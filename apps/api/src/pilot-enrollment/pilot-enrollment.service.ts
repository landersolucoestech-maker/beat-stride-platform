import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type EnrollmentStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "EXITED";

interface EnrollmentRow extends QueryResultRow {
  id: string;
  pilot_configuration_id: string;
  organization_id: string;
  organization_name: string;
  status: EnrollmentStatus;
  release_limit_override: number | null;
  notes: string | null;
  enrolled_by_user_id: string;
  enrolled_at: Date;
  activated_at: Date | null;
  suspended_at: Date | null;
  exited_at: Date | null;
  version: string;
}

interface PilotLimitRow extends QueryResultRow {
  status: "DRAFT" | "ACTIVE" | "RETIRED";
  max_active_organizations: number;
  emergency_disable: boolean;
}

const transitions: Record<EnrollmentStatus, readonly EnrollmentStatus[]> = {
  INVITED: ["ACTIVE", "EXITED"],
  ACTIVE: ["SUSPENDED", "EXITED"],
  SUSPENDED: ["ACTIVE", "EXITED"],
  EXITED: [],
};

@Injectable()
export class PilotEnrollmentService {
  constructor(private readonly database: DatabaseService) {}

  async list(configurationId: string) {
    const result = await this.database.query<EnrollmentRow>(
      `SELECT enrollment.*, organization.display_name AS organization_name
       FROM pilot_enrollments enrollment
       JOIN organizations organization ON organization.id = enrollment.organization_id
       WHERE enrollment.pilot_configuration_id = $1
       ORDER BY enrollment.enrolled_at ASC`,
      [configurationId],
    );
    return { items: result.rows.map((row) => this.toEnrollment(row)) };
  }

  async invite(input: {
    configurationId: string;
    organizationId: string;
    releaseLimitOverride?: number;
    notes?: string;
    actorUserId: string;
    correlationId: string;
  }) {
    const id = randomUUID();
    try {
      const result = await this.database.query<EnrollmentRow>(
        `INSERT INTO pilot_enrollments
          (id, pilot_configuration_id, organization_id, status, release_limit_override, notes, enrolled_by_user_id,
           enrolled_at, activated_at, suspended_at, exited_at, version)
         SELECT $1, configuration.id, organization.id, 'INVITED', $4, $5, $6, NOW(), NULL, NULL, NULL, 1
         FROM pilot_configurations configuration
         CROSS JOIN organizations organization
         WHERE configuration.id = $2
           AND configuration.status IN ('DRAFT','ACTIVE')
           AND organization.id = $3
           AND organization.status = 'ACTIVE'
         RETURNING *, (SELECT display_name FROM organizations WHERE id = organization_id) AS organization_name`,
        [id, input.configurationId, input.organizationId, input.releaseLimitOverride ?? null, input.notes?.trim() || null, input.actorUserId],
      );
      const row = result.rows[0];
      if (!row) {
        throw new NotFoundException({ code: "PILOT_ENROLLMENT_TARGET_NOT_FOUND", message: "Pilot configuration or organization was not found or is not eligible" });
      }
      await this.audit(input.actorUserId, input.correlationId, id, "pilot.enrollment.invited", {
        configurationId: input.configurationId,
        organizationId: input.organizationId,
      });
      return this.toEnrollment(row);
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new ConflictException({ code: "PILOT_ENROLLMENT_ALREADY_EXISTS", message: "Organization is already enrolled in this pilot configuration" });
      }
      throw error;
    }
  }

  async transition(input: {
    configurationId: string;
    enrollmentId: string;
    nextStatus: EnrollmentStatus;
    expectedVersion: number;
    notes?: string;
    actorUserId: string;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.configurationId, input.enrollmentId);
      this.assertVersion(current, input.expectedVersion);
      if (!transitions[current.status].includes(input.nextStatus)) {
        throw new ConflictException({
          code: "PILOT_ENROLLMENT_TRANSITION_INVALID",
          message: "Pilot enrollment state transition is not allowed",
          currentStatus: current.status,
          requestedStatus: input.nextStatus,
        });
      }

      if (input.nextStatus === "ACTIVE") {
        await this.assertActivationCapacity(client, current.pilot_configuration_id, input.enrollmentId);
      }

      const result = await client.query<EnrollmentRow>(
        `UPDATE pilot_enrollments enrollment
         SET status = $1,
             notes = COALESCE($2, notes),
             activated_at = CASE WHEN $1 = 'ACTIVE' THEN COALESCE(activated_at, NOW()) ELSE activated_at END,
             suspended_at = CASE WHEN $1 = 'SUSPENDED' THEN NOW() ELSE suspended_at END,
             exited_at = CASE WHEN $1 = 'EXITED' THEN NOW() ELSE exited_at END,
             version = version + 1
         WHERE id = $3 AND pilot_configuration_id = $4
         RETURNING enrollment.*, (SELECT display_name FROM organizations WHERE id = enrollment.organization_id) AS organization_name`,
        [input.nextStatus, input.notes?.trim() || null, input.enrollmentId, input.configurationId],
      );

      await this.auditWithClient(client, input.actorUserId, input.correlationId, input.enrollmentId, "pilot.enrollment.transitioned", {
        previousStatus: current.status,
        nextStatus: input.nextStatus,
        configurationId: input.configurationId,
      });
      return this.toEnrollment(result.rows[0]!);
    });
  }

  private async assertActivationCapacity(client: PoolClient, configurationId: string, enrollmentId: string): Promise<void> {
    const configResult = await client.query<PilotLimitRow>(
      `SELECT status, max_active_organizations, emergency_disable
       FROM pilot_configurations
       WHERE id = $1
       FOR UPDATE`,
      [configurationId],
    );
    const config = configResult.rows[0];
    if (!config || config.status !== "ACTIVE") {
      throw new ConflictException({ code: "PILOT_CONFIGURATION_NOT_ACTIVE", message: "Enrollment activation requires the active pilot configuration" });
    }
    if (config.emergency_disable) {
      throw new ConflictException({ code: "PILOT_CONFIGURATION_DISABLED", message: "Pilot configuration is emergency-disabled" });
    }

    const countResult = await client.query<{ count: string } & QueryResultRow>(
      `SELECT COUNT(*)::text AS count
       FROM pilot_enrollments
       WHERE pilot_configuration_id = $1
         AND status = 'ACTIVE'
         AND id <> $2`,
      [configurationId, enrollmentId],
    );
    if (Number(countResult.rows[0]?.count ?? 0) >= config.max_active_organizations) {
      throw new ConflictException({ code: "PILOT_COHORT_CAPACITY_REACHED", message: "Pilot active organization limit has been reached" });
    }
  }

  private async lock(client: PoolClient, configurationId: string, enrollmentId: string): Promise<EnrollmentRow> {
    const result = await client.query<EnrollmentRow>(
      `SELECT enrollment.*, organization.display_name AS organization_name
       FROM pilot_enrollments enrollment
       JOIN organizations organization ON organization.id = enrollment.organization_id
       WHERE enrollment.id = $1 AND enrollment.pilot_configuration_id = $2
       FOR UPDATE OF enrollment`,
      [enrollmentId, configurationId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException({ code: "PILOT_ENROLLMENT_NOT_FOUND", message: "Pilot enrollment was not found" });
    return row;
  }

  private assertVersion(row: EnrollmentRow, expectedVersion: number): void {
    const currentVersion = Number(row.version);
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({ code: "PILOT_ENROLLMENT_VERSION_CONFLICT", message: "Pilot enrollment changed before the operation was applied", currentVersion });
    }
  }

  private async audit(actorUserId: string, correlationId: string, enrollmentId: string, action: string, metadata: Record<string, unknown>) {
    await this.database.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'PilotEnrollment',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, enrollmentId, correlationId, JSON.stringify(metadata)],
    );
  }

  private async auditWithClient(client: PoolClient, actorUserId: string, correlationId: string, enrollmentId: string, action: string, metadata: Record<string, unknown>) {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'PilotEnrollment',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, enrollmentId, correlationId, JSON.stringify(metadata)],
    );
  }

  private toEnrollment(row: EnrollmentRow) {
    return {
      id: row.id,
      pilotConfigurationId: row.pilot_configuration_id,
      organizationId: row.organization_id,
      organizationName: row.organization_name,
      status: row.status,
      releaseLimitOverride: row.release_limit_override,
      notes: row.notes,
      enrolledByUserId: row.enrolled_by_user_id,
      enrolledAt: row.enrolled_at.toISOString(),
      activatedAt: row.activated_at?.toISOString() ?? null,
      suspendedAt: row.suspended_at?.toISOString() ?? null,
      exitedAt: row.exited_at?.toISOString() ?? null,
      version: Number(row.version),
    };
  }
}
