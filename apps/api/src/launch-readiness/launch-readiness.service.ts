import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type Gate = "PRODUCTION_READINESS" | "PILOT" | "PRODUCTION";
type EvidenceStatus = "PENDING" | "BLOCKED" | "PASSED" | "FAILED";

interface RequirementRow extends QueryResultRow {
  requirement_key: string;
  gate: Gate;
  title: string;
  description: string;
  required: boolean;
  evidence_status: EvidenceStatus | null;
  evidence_reference: string | null;
  notes: string | null;
  recorded_at: Date | null;
  version: string | null;
}

interface DecisionRow extends QueryResultRow {
  id: string;
  gate: "PILOT" | "PRODUCTION";
  decision: "APPROVED" | "REJECTED";
  commit_sha: string;
  migration_version: string;
  provider_configuration_version: string | null;
  accepted_risks: unknown[];
  rollback_target: string;
  decided_by_user_id: string;
  decided_at: Date;
  notes: string | null;
}

@Injectable()
export class LaunchReadinessService {
  constructor(private readonly database: DatabaseService) {}

  async getGate(gate: Gate) {
    const result = await this.database.query<RequirementRow>(
      `SELECT
         requirement.requirement_key,
         requirement.gate,
         requirement.title,
         requirement.description,
         requirement.required,
         latest.status AS evidence_status,
         latest.evidence_reference,
         latest.notes,
         latest.recorded_at,
         latest.version::text AS version
       FROM launch_gate_requirements requirement
       LEFT JOIN LATERAL (
         SELECT evidence.status, evidence.evidence_reference, evidence.notes, evidence.recorded_at, evidence.version
         FROM launch_gate_evidence evidence
         WHERE evidence.requirement_key = requirement.requirement_key
         ORDER BY evidence.recorded_at DESC, evidence.id DESC
         LIMIT 1
       ) latest ON TRUE
       WHERE requirement.gate = $1
       ORDER BY requirement.requirement_key ASC`,
      [gate],
    );

    const requirements = result.rows.map((row) => ({
      requirementKey: row.requirement_key,
      title: row.title,
      description: row.description,
      required: row.required,
      status: row.evidence_status ?? "PENDING",
      evidenceReference: row.evidence_reference,
      notes: row.notes,
      recordedAt: row.recorded_at?.toISOString() ?? null,
      version: row.version ? Number(row.version) : 0,
    }));
    const required = requirements.filter((requirement) => requirement.required);
    const passed = required.filter((requirement) => requirement.status === "PASSED").length;
    return {
      gate,
      ready: required.length > 0 && passed === required.length,
      summary: { required: required.length, passed, remaining: required.length - passed },
      requirements,
    };
  }

  async recordEvidence(input: {
    requirementKey: string;
    status: EvidenceStatus;
    evidenceReference?: string;
    notes?: string;
    actorUserId: string;
    correlationId: string;
  }) {
    if (input.status === "PASSED" && !input.evidenceReference?.trim()) {
      throw new ConflictException({
        code: "LAUNCH_EVIDENCE_REQUIRED",
        message: "Passed launch requirements require an evidence reference",
      });
    }

    return this.database.transaction(async (client) => {
      const requirement = await client.query<QueryResultRow>(
        `SELECT requirement_key, gate FROM launch_gate_requirements WHERE requirement_key = $1 LIMIT 1`,
        [input.requirementKey],
      );
      if (!requirement.rows[0]) {
        throw new NotFoundException({ code: "LAUNCH_REQUIREMENT_NOT_FOUND", message: "Launch requirement was not found" });
      }

      const previous = await client.query<{ version: string } & QueryResultRow>(
        `SELECT version::text AS version
         FROM launch_gate_evidence
         WHERE requirement_key = $1
         ORDER BY recorded_at DESC, id DESC
         LIMIT 1`,
        [input.requirementKey],
      );
      const nextVersion = Number(previous.rows[0]?.version ?? 0) + 1;
      const evidenceId = randomUUID();
      const result = await client.query<QueryResultRow>(
        `INSERT INTO launch_gate_evidence
          (id, requirement_key, status, evidence_reference, notes, recorded_by_user_id, recorded_at, version)
         VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
         RETURNING id, requirement_key, status, evidence_reference, notes, recorded_at, version`,
        [
          evidenceId,
          input.requirementKey,
          input.status,
          input.evidenceReference?.trim() || null,
          input.notes?.trim() || null,
          input.actorUserId,
          nextVersion,
        ],
      );

      await this.audit(client, {
        actorUserId: input.actorUserId,
        correlationId: input.correlationId,
        action: "launch.requirement.evidence_recorded",
        resourceId: input.requirementKey,
        metadata: { status: input.status, version: nextVersion },
      });

      const row = result.rows[0]!;
      return {
        id: row.id as string,
        requirementKey: row.requirement_key as string,
        status: row.status as EvidenceStatus,
        evidenceReference: row.evidence_reference as string | null,
        notes: row.notes as string | null,
        recordedAt: (row.recorded_at as Date).toISOString(),
        version: Number(row.version),
      };
    });
  }

  async listDecisions(gate?: "PILOT" | "PRODUCTION") {
    const result = gate
      ? await this.database.query<DecisionRow>(`SELECT * FROM launch_decisions WHERE gate = $1 ORDER BY decided_at DESC, id DESC`, [gate])
      : await this.database.query<DecisionRow>(`SELECT * FROM launch_decisions ORDER BY decided_at DESC, id DESC`, []);
    return { items: result.rows.map((row) => this.toDecision(row)) };
  }

  async decide(input: {
    gate: "PILOT" | "PRODUCTION";
    decision: "APPROVED" | "REJECTED";
    commitSha: string;
    migrationVersion: string;
    providerConfigurationVersion?: string;
    acceptedRisks: unknown[];
    rollbackTarget: string;
    notes?: string;
    actorUserId: string;
    correlationId: string;
  }) {
    if (input.decision === "APPROVED") {
      const gateState = await this.getGate(input.gate);
      if (!gateState.ready) {
        throw new ConflictException({
          code: "LAUNCH_GATE_NOT_READY",
          message: "Launch gate cannot be approved while required evidence is incomplete",
          remaining: gateState.summary.remaining,
        });
      }
      if (input.gate === "PILOT") {
        const readiness = await this.getGate("PRODUCTION_READINESS");
        if (!readiness.ready) {
          throw new ConflictException({
            code: "PRODUCTION_READINESS_NOT_COMPLETE",
            message: "Pilot approval requires the production-readiness gate to pass",
          });
        }
      }
      if (input.gate === "PRODUCTION") {
        if (!input.providerConfigurationVersion?.trim()) {
          throw new ConflictException({
            code: "PROVIDER_CONFIGURATION_VERSION_REQUIRED",
            message: "Production approval requires the verified provider configuration version",
          });
        }
        const latestPilot = await this.database.query<{ decision: "APPROVED" | "REJECTED" } & QueryResultRow>(
          `SELECT decision
           FROM launch_decisions
           WHERE gate = 'PILOT'
           ORDER BY decided_at DESC, id DESC
           LIMIT 1`,
          [],
        );
        if (latestPilot.rows[0]?.decision !== "APPROVED") {
          throw new ConflictException({
            code: "PILOT_APPROVAL_REQUIRED",
            message: "Production approval requires the latest pilot decision to be approved",
          });
        }
      }
    }

    const id = randomUUID();
    const result = await this.database.query<DecisionRow>(
      `INSERT INTO launch_decisions
        (id, gate, decision, commit_sha, migration_version, provider_configuration_version, accepted_risks,
         rollback_target, decided_by_user_id, decided_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,NOW(),$10)
       RETURNING *`,
      [
        id,
        input.gate,
        input.decision,
        input.commitSha,
        input.migrationVersion.trim(),
        input.providerConfigurationVersion?.trim() || null,
        JSON.stringify(input.acceptedRisks),
        input.rollbackTarget.trim(),
        input.actorUserId,
        input.notes?.trim() || null,
      ],
    );

    await this.database.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'LaunchDecision',$4,$5::uuid,NOW(),$6::jsonb)`,
      [
        randomUUID(),
        input.actorUserId,
        input.decision === "APPROVED" ? "launch.gate.approved" : "launch.gate.rejected",
        id,
        input.correlationId,
        JSON.stringify({ gate: input.gate, commitSha: input.commitSha }),
      ],
    );

    return this.toDecision(result.rows[0]!);
  }

  private async audit(client: PoolClient, input: {
    actorUserId: string;
    correlationId: string;
    action: string;
    resourceId: string;
    metadata: Record<string, unknown>;
  }) {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'LaunchRequirement',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), input.actorUserId, input.action, input.resourceId, input.correlationId, JSON.stringify(input.metadata)],
    );
  }

  private toDecision(row: DecisionRow) {
    return {
      id: row.id,
      gate: row.gate,
      decision: row.decision,
      commitSha: row.commit_sha,
      migrationVersion: row.migration_version,
      providerConfigurationVersion: row.provider_configuration_version,
      acceptedRisks: row.accepted_risks,
      rollbackTarget: row.rollback_target,
      decidedByUserId: row.decided_by_user_id,
      decidedAt: row.decided_at.toISOString(),
      notes: row.notes,
    };
  }
}
