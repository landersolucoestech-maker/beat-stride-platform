import { createHash, randomUUID } from "node:crypto";

import { ConflictException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { loadRuntimeConfig } from "../platform/config/runtime-config.js";
import { DatabaseService } from "../platform/database/database.service.js";
import { SessionService } from "../session/session.service.js";
import { PasswordHasher } from "./password-hasher.js";

export type OrganizationType = "INDEPENDENT_ARTIST" | "COMPANY";
export type CompanySubtype = "LABEL" | "PRODUCER" | "PUBLISHER" | "MANAGEMENT" | "AGENCY" | "OTHER";

export interface RegisterInput {
  email: string;
  password: string;
  organizationType: OrganizationType;
  organizationDisplayName: string;
  organizationLegalName: string | null;
  companySubtype: CompanySubtype | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface CredentialRow extends QueryResultRow {
  user_id: string;
  email: string;
  password_hash: string;
  password_salt: string;
}

interface ThrottleRow extends QueryResultRow {
  failed_count: number;
  locked_until: Date | null;
}

const DUMMY_PASSWORD_HASH = Buffer.alloc(64).toString("base64");
const DUMMY_PASSWORD_SALT = Buffer.alloc(16).toString("base64");

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessions: SessionService,
  ) {}

  async register(input: RegisterInput): Promise<{
    token: string;
    expiresAt: string;
    user: { id: string; email: string };
    organization: { id: string; displayName: string; organizationType: OrganizationType; companySubtype: CompanySubtype | null };
  }> {
    const now = new Date();
    const userId = randomUUID();
    const organizationId = randomUUID();
    const membershipId = randomUUID();
    const normalizedEmail = normalizeEmail(input.email);
    const credentials = await this.passwordHasher.hash(input.password);

    try {
      await this.database.transaction(async (client) => {
        await client.query(
          `INSERT INTO users (id, email, normalized_email, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'ACTIVE', $4, $4)`,
          [userId, input.email.trim(), normalizedEmail, now],
        );

        await client.query(
          `INSERT INTO user_credentials
            (user_id, password_hash, password_salt, password_algorithm, password_version, created_at, updated_at)
           VALUES ($1, $2, $3, 'SCRYPT', 1, $4, $4)`,
          [userId, credentials.passwordHash, credentials.passwordSalt, now],
        );

        await client.query(
          `INSERT INTO organizations
            (id, organization_type, company_subtype, display_name, legal_name, status, version, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 1, $6, $6)`,
          [
            organizationId,
            input.organizationType,
            input.companySubtype,
            input.organizationDisplayName.trim(),
            input.organizationLegalName?.trim() || null,
            now,
          ],
        );

        await client.query(
          `INSERT INTO organization_memberships
            (id, organization_id, user_id, role, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'OWNER', 'ACTIVE', $4, $4)`,
          [membershipId, organizationId, userId, now],
        );

        await this.provisionOrganizationRoles(client, organizationId, membershipId, now);
      });
    } catch (error) {
      const databaseError = error as { code?: string };
      if (databaseError.code === "23505") {
        throw new ConflictException({
          code: "EMAIL_ALREADY_REGISTERED",
          message: "An account with this email already exists",
        });
      }
      throw error;
    }

    const session = await this.sessions.createForUser(userId);
    return {
      ...session,
      user: { id: userId, email: input.email.trim() },
      organization: {
        id: organizationId,
        displayName: input.organizationDisplayName.trim(),
        organizationType: input.organizationType,
        companySubtype: input.companySubtype,
      },
    };
  }

  async login(input: LoginInput): Promise<{
    token: string;
    expiresAt: string;
    user: { id: string; email: string };
  }> {
    const normalizedEmail = normalizeEmail(input.email);
    const identityHash = createHash("sha256").update(normalizedEmail).digest("hex");
    await this.assertLoginAllowed(identityHash);

    const result = await this.database.query<CredentialRow>(
      `SELECT u.id AS user_id, u.email, c.password_hash, c.password_salt
       FROM users u
       JOIN user_credentials c ON c.user_id = u.id
       WHERE u.normalized_email = $1
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [normalizedEmail],
    );

    const credential = result.rows[0];
    const passwordMatches = credential
      ? await this.passwordHasher.verify(input.password, credential.password_hash, credential.password_salt)
      : await this.passwordHasher.verify(input.password, DUMMY_PASSWORD_HASH, DUMMY_PASSWORD_SALT);

    if (!credential || !passwordMatches) {
      await this.recordLoginFailure(identityHash);
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    await this.database.query(`DELETE FROM auth_login_throttle WHERE identity_hash = $1`, [identityHash]);

    const session = await this.sessions.createForUser(credential.user_id);
    return {
      ...session,
      user: { id: credential.user_id, email: credential.email },
    };
  }

  private async assertLoginAllowed(identityHash: string): Promise<void> {
    const result = await this.database.query<ThrottleRow>(
      `SELECT failed_count, locked_until
       FROM auth_login_throttle
       WHERE identity_hash = $1
         AND locked_until IS NOT NULL
         AND locked_until > NOW()
       LIMIT 1`,
      [identityHash],
    );

    if (result.rows[0]) {
      throw new HttpException(
        { code: "AUTHENTICATION_TEMPORARILY_THROTTLED", message: "Authentication is temporarily throttled" },
        429,
      );
    }
  }

  private async recordLoginFailure(identityHash: string): Promise<void> {
    const config = loadRuntimeConfig();
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.AUTH_FAILURE_WINDOW_MINUTES * 60 * 1000);
    const lockedUntil = new Date(now.getTime() + config.AUTH_LOCKOUT_MINUTES * 60 * 1000);

    await this.database.transaction(async (client) => {
      const result = await client.query<ThrottleRow>(
        `INSERT INTO auth_login_throttle
          (identity_hash, failed_count, first_failed_at, locked_until, updated_at)
         VALUES ($1, 1, $2, NULL, $2)
         ON CONFLICT (identity_hash) DO UPDATE
         SET failed_count = CASE
               WHEN auth_login_throttle.first_failed_at < $3 THEN 1
               ELSE auth_login_throttle.failed_count + 1
             END,
             first_failed_at = CASE
               WHEN auth_login_throttle.first_failed_at < $3 THEN $2
               ELSE auth_login_throttle.first_failed_at
             END,
             locked_until = CASE
               WHEN (CASE
                 WHEN auth_login_throttle.first_failed_at < $3 THEN 1
                 ELSE auth_login_throttle.failed_count + 1
               END) >= $4 THEN $5
               ELSE NULL
             END,
             updated_at = $2
         RETURNING failed_count, locked_until`,
        [identityHash, now, windowStart, config.AUTH_MAX_FAILED_ATTEMPTS, lockedUntil],
      );

      const throttle = result.rows[0]!;
      await client.query(
        `INSERT INTO security_events
          (id, organization_id, actor_type, actor_id, event_type, severity, correlation_id, occurred_at, metadata)
         VALUES ($1, NULL, 'ANONYMOUS', NULL, $2, $3, $4, $5, $6::jsonb)`,
        [
          randomUUID(),
          throttle.locked_until ? "AUTH_LOGIN_THROTTLED" : "AUTH_LOGIN_FAILED",
          throttle.locked_until ? "MEDIUM" : "LOW",
          randomUUID(),
          now,
          JSON.stringify({ identityHash, failedCount: throttle.failed_count }),
        ],
      );
    });
  }

  private async provisionOrganizationRoles(client: PoolClient, organizationId: string, ownerMembershipId: string, now: Date): Promise<void> {
    const ownerRoleId = randomUUID();
    const adminRoleId = randomUUID();
    const memberRoleId = randomUUID();

    await client.query(
      `INSERT INTO roles (id, organization_id, name, role_type, created_at, updated_at)
       VALUES
         ($1, $4, 'Organization Owner', 'ORGANIZATION', $5, $5),
         ($2, $4, 'Organization Admin', 'ORGANIZATION', $5, $5),
         ($3, $4, 'Organization Member', 'ORGANIZATION', $5, $5)`,
      [ownerRoleId, adminRoleId, memberRoleId, organizationId, now],
    );

    await client.query(
      `INSERT INTO role_permissions (role_id, permission_key)
       SELECT $1, permission_key FROM permissions WHERE permission_scope = 'ORGANIZATION'`,
      [ownerRoleId],
    );

    await client.query(
      `INSERT INTO role_permissions (role_id, permission_key)
       SELECT $1, permission_key
       FROM permissions
       WHERE permission_scope = 'ORGANIZATION'
         AND permission_key NOT IN ('organization.update','membership.revoke','beneficiary.manage','payout.request')`,
      [adminRoleId],
    );

    await client.query(
      `INSERT INTO role_permissions (role_id, permission_key)
       SELECT $1, permission_key
       FROM permissions
       WHERE permission_key = ANY($2::text[])`,
      [
        memberRoleId,
        [
          'organization.read',
          'artist_identity.read',
          'catalog.read',
          'release.create',
          'release.update_draft',
          'asset.upload',
          'metadata.update',
          'analytics.read',
          'royalty.read',
          'ledger.read',
          'wallet.read',
          'marketing.manage',
          'creators.campaign.read',
          'support.ticket.create',
        ],
      ],
    );

    await client.query(
      `INSERT INTO membership_roles (membership_id, role_id, assigned_at) VALUES ($1, $2, $3)`,
      [ownerMembershipId, ownerRoleId, now],
    );
  }
}
