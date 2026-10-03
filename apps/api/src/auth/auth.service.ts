import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { QueryResultRow } from "pg";

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
    const result = await this.database.query<CredentialRow>(
      `SELECT u.id AS user_id, u.email, c.password_hash, c.password_salt
       FROM users u
       JOIN user_credentials c ON c.user_id = u.id
       WHERE u.normalized_email = $1
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [normalizeEmail(input.email)],
    );

    const credential = result.rows[0];
    if (!credential || !(await this.passwordHasher.verify(input.password, credential.password_hash, credential.password_salt))) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const session = await this.sessions.createForUser(credential.user_id);
    return {
      ...session,
      user: { id: credential.user_id, email: credential.email },
    };
  }
}
