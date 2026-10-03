import { createHash, randomBytes, randomUUID } from "node:crypto";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { loadRuntimeConfig } from "../platform/config/runtime-config.js";
import { DatabaseService } from "../platform/database/database.service.js";

interface SessionUserRow extends QueryResultRow {
  user_id: string;
  email: string;
}

interface MembershipRow extends QueryResultRow {
  organization_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  organization_type: "INDEPENDENT_ARTIST" | "COMPANY";
  company_subtype: "LABEL" | "PRODUCER" | "PUBLISHER" | "MANAGEMENT" | "AGENCY" | "OTHER" | null;
  display_name: string;
}

export interface SessionContext {
  user: {
    id: string;
    email: string;
  };
  memberships: Array<{
    organizationId: string;
    role: MembershipRow["role"];
    organizationType: MembershipRow["organization_type"];
    companySubtype: MembershipRow["company_subtype"];
    displayName: string;
  }>;
}

@Injectable()
export class SessionService {
  constructor(private readonly database: DatabaseService) {}

  async createForUser(userId: string): Promise<{ token: string; expiresAt: string }> {
    const config = loadRuntimeConfig();
    const token = randomBytes(32).toString("base64url");
    const tokenHash = this.hashToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.SESSION_TTL_HOURS * 60 * 60 * 1000);

    await this.database.query(
      `INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, revoked_at, created_at, last_seen_at)
       VALUES ($1, $2, $3, $4, NULL, $5, $5)`,
      [randomUUID(), userId, tokenHash, expiresAt, now],
    );

    return { token, expiresAt: expiresAt.toISOString() };
  }

  async requireContext(authorizationHeader: string | undefined): Promise<SessionContext> {
    const token = this.readBearerToken(authorizationHeader);
    const tokenHash = this.hashToken(token);

    const userResult = await this.database.query<SessionUserRow>(
      `SELECT u.id AS user_id, u.email
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > NOW()
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [tokenHash],
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new UnauthorizedException({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required",
      });
    }

    await this.database.query(
      `UPDATE auth_sessions SET last_seen_at = NOW() WHERE token_hash = $1`,
      [tokenHash],
    );

    const memberships = await this.database.query<MembershipRow>(
      `SELECT m.organization_id, m.role, o.organization_type, o.company_subtype, o.display_name
       FROM organization_memberships m
       JOIN organizations o ON o.id = m.organization_id
       WHERE m.user_id = $1
         AND m.status = 'ACTIVE'
         AND o.status = 'ACTIVE'
       ORDER BY m.created_at ASC`,
      [user.user_id],
    );

    return {
      user: { id: user.user_id, email: user.email },
      memberships: memberships.rows.map((membership) => ({
        organizationId: membership.organization_id,
        role: membership.role,
        organizationType: membership.organization_type,
        companySubtype: membership.company_subtype,
        displayName: membership.display_name,
      })),
    };
  }

  async revoke(authorizationHeader: string | undefined): Promise<void> {
    const token = this.readBearerToken(authorizationHeader);
    await this.database.query(
      `UPDATE auth_sessions
       SET revoked_at = COALESCE(revoked_at, NOW())
       WHERE token_hash = $1`,
      [this.hashToken(token)],
    );
  }

  private readBearerToken(authorizationHeader: string | undefined): string {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required",
      });
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required",
      });
    }
    return token;
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
