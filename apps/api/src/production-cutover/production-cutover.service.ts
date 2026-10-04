import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type CutoverStatus = "PREPARED" | "ACTIVE" | "ABORTED" | "ROLLED_BACK";

interface CutoverRow extends QueryResultRow {
  id: string;
  launch_decision_id: string;
  commit_sha: string;
  migration_version: string;
  configuration_version: string;
  rollback_target: string;
  status: CutoverStatus;
  prepared_by_user_id: string;
  prepared_at: Date;
  activated_by_user_id: string | null;
  activated_at: Date | null;
  completed_by_user_id: string | null;
  completed_at: Date | null;
  completion_reason: string | null;
  version: string;
}

interface ProductionDecisionRow extends QueryResultRow {
  id: string;
  commit_sha: string;
  migration_version: string;
  rollback_target: string;
}

@Injectable()
export class ProductionCutoverService {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const result = await this.database.query<CutoverRow>(
      `SELECT * FROM production_cutovers ORDER BY prepared_at DESC, id DESC`,
      [],
    );
    return { items: result.rows.map((row) => this.toCutover(row)) };
  }

  async prepare(input: {
    launchDecisionId: string;
    configurationVersion: string;
    actorUserId: string;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const decision = await this.loadApprovedDecision(client, input.launchDecisionId);
      await this.requireProductionGateReady(client);

      const existing = await client.query<CutoverRow>(
        `SELECT * FROM production_cutovers
         WHERE launch_decision_id = $1 AND status IN ('PREPARED','ACTIVE')
         ORDER BY prepared_at DESC LIMIT 1
         FOR UPDATE`,
        [decision.id],
      );
      if (existing.rows[0]) return this.toCutover(existing.rows[0]);

      const id = randomUUID();
      const result = await client.query<CutoverRow>(
        `INSERT INTO production_cutovers
          (id, launch_decision_id, commit_sha, migration_version, configuration_version, rollback_target,
           status, prepared_by_user_id, prepared_at, version)
         VALUES ($1,$2,$3,$4,$5,$6,'PREPARED',$7,NOW(),1)
         RETURNING *`,
        [
          id,
          decision.id,
          decision.commit_sha,
          decision.migration_version,
          input.configurationVersion.trim(),
          decision.rollback_target,
          input.actorUserId,
        ],
      );

      await this.audit(client, input.actorUserId, input.correlationId, "production.cutover.prepared", id, {
        launchDecisionId: decision.id,
        commitSha: decision.commit_sha,
        migrationVersion: decision.migration_version,
        configurationVersion: input.configurationVersion.trim(),
      });
      return this.toCutover(result.rows[0]!);
    });
  }

  async activate(input: { cutoverId: string; expectedVersion: number; actorUserId: string; correlationId: string }) {
    return this.database.transaction(async (client) => {
      const cutover = await this.loadForUpdate(client, input.cutoverId);
      if (Number(cutover.version) !== input.expectedVersion) {
        throw new ConflictException({ code: "CUTOVER_VERSION_CONFLICT", message: "Production cutover changed before activation" });
      }
      if (cutover.status !== "PREPARED") {
        throw new ConflictException({ code: "CUTOVER_NOT_PREPARED", message: "Only a prepared cutover can be activated" });
      }

      const decision = await this.loadApprovedDecision(client, cutover.launch_decision_id);
      await this.requireProductionGateReady(client);
      if (decision.commit_sha !== cutover.commit_sha || decision.migration_version !== cutover.migration_version) {
        throw new ConflictException({ code: "CUTOVER_DECISION_DRIFT", message: "Prepared cutover no longer matches its production approval" });
      }

      const active = await client.query<QueryResultRow>(
        `SELECT id FROM production_cutovers WHERE status = 'ACTIVE' AND id <> $1 LIMIT 1 FOR UPDATE`,
        [cutover.id],
      );
      if (active.rows[0]) {
        throw new ConflictException({ code: "PRODUCTION_CUTOVER_ALREADY_ACTIVE", message: "Another production cutover is already active" });
      }

      const nextVersion = input.expectedVersion + 1;
      const result = await client.query<CutoverRow>(
        `UPDATE production_cutovers
         SET status = 'ACTIVE', activated_by_user_id = $1, activated_at = NOW(), version = $2
         WHERE id = $3 AND status = 'PREPARED' AND version = $4
         RETURNING *`,
        [input.actorUserId, nextVersion, cutover.id, input.expectedVersion],
      );
      if (!result.rows[0]) {
        throw new ConflictException({ code: "CUTOVER_ACTIVATION_CONFLICT", message: "Production cutover activation lost a concurrency race" });
      }

      await this.audit(client, input.actorUserId, input.correlationId, "production.cutover.activated", cutover.id, {
        commitSha: cutover.commit_sha,
        migrationVersion: cutover.migration_version,
        configurationVersion: cutover.configuration_version,
      });
      return this.toCutover(result.rows[0]);
    });
  }

  async terminate(input: {
    cutoverId: string;
    action: "ABORT" | "ROLLBACK";
    reason: string;
    expectedVersion: number;
    actorUserId: string;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const cutover = await this.loadForUpdate(client, input.cutoverId);
      if (Number(cutover.version) !== input.expectedVersion) {
        throw new ConflictException({ code: "CUTOVER_VERSION_CONFLICT", message: "Production cutover changed before termination" });
      }

      const targetStatus: CutoverStatus = input.action === "ABORT" ? "ABORTED" : "ROLLED_BACK";
      const allowed = input.action === "ABORT" ? cutover.status === "PREPARED" : cutover.status === "ACTIVE";
      if (!allowed) {
        throw new ConflictException({
          code: input.action === "ABORT" ? "CUTOVER_NOT_ABORTABLE" : "CUTOVER_NOT_ROLLBACKABLE",
          message: input.action === "ABORT" ? "Only a prepared cutover can be aborted" : "Only an active cutover can be rolled back",
        });
      }

      const result = await client.query<CutoverRow>(
        `UPDATE production_cutovers
         SET status = $1, completed_by_user_id = $2, completed_at = NOW(), completion_reason = $3, version = $4
         WHERE id = $5 AND version = $6
         RETURNING *`,
        [targetStatus, input.actorUserId, input.reason.trim(), input.expectedVersion + 1, cutover.id, input.expectedVersion],
      );
      if (!result.rows[0]) {
        throw new ConflictException({ code: "CUTOVER_TERMINATION_CONFLICT", message: "Production cutover termination lost a concurrency race" });
      }

      await this.audit(
        client,
        input.actorUserId,
        input.correlationId,
        input.action === "ABORT" ? "production.cutover.aborted" : "production.cutover.rolled_back",
        cutover.id,
        { reason: input.reason.trim(), rollbackTarget: cutover.rollback_target },
      );
      return this.toCutover(result.rows[0]);
    });
  }

  private async loadApprovedDecision(client: PoolClient, decisionId: string): Promise<ProductionDecisionRow> {
    const result = await client.query<ProductionDecisionRow>(
      `SELECT id, commit_sha, migration_version, rollback_target
       FROM launch_decisions
       WHERE id = $1 AND gate = 'PRODUCTION' AND decision = 'APPROVED'
       LIMIT 1`,
      [decisionId],
    );
    const decision = result.rows[0];
    if (!decision) {
      throw new ConflictException({ code: "PRODUCTION_APPROVAL_REQUIRED", message: "An approved production launch decision is required" });
    }

    const latest = await client.query<{ id: string } & QueryResultRow>(
      `SELECT id
       FROM launch_decisions
       WHERE gate = 'PRODUCTION'
       ORDER BY decided_at DESC, id DESC
       LIMIT 1`,
      [],
    );
    if (latest.rows[0]?.id !== decision.id) {
      throw new ConflictException({
        code: "PRODUCTION_APPROVAL_SUPERSEDED",
        message: "Production cutover requires the latest production decision to remain approved",
      });
    }
    return decision;
  }

  private async requireProductionGateReady(client: PoolClient): Promise<void> {
    const result = await client.query<{ required_count: string; passed_count: string } & QueryResultRow>(
      `SELECT
         COUNT(*) FILTER (WHERE requirement.required)::text AS required_count,
         COUNT(*) FILTER (WHERE requirement.required AND latest.status = 'PASSED')::text AS passed_count
       FROM launch_gate_requirements requirement
       LEFT JOIN LATERAL (
         SELECT evidence.status
         FROM launch_gate_evidence evidence
         WHERE evidence.requirement_key = requirement.requirement_key
         ORDER BY evidence.recorded_at DESC, evidence.id DESC
         LIMIT 1
       ) latest ON TRUE
       WHERE requirement.gate = 'PRODUCTION'`,
      [],
    );
    const row = result.rows[0]!;
    const required = Number(row.required_count);
    const passed = Number(row.passed_count);
    if (required < 1 || passed !== required) {
      throw new ConflictException({
        code: "PRODUCTION_GATE_NOT_READY",
        message: "Production cutover requires all production gate evidence to remain passed",
        required,
        passed,
      });
    }
  }

  private async loadForUpdate(client: PoolClient, cutoverId: string): Promise<CutoverRow> {
    const result = await client.query<CutoverRow>(`SELECT * FROM production_cutovers WHERE id = $1 FOR UPDATE`, [cutoverId]);
    const cutover = result.rows[0];
    if (!cutover) throw new NotFoundException({ code: "PRODUCTION_CUTOVER_NOT_FOUND", message: "Production cutover was not found" });
    return cutover;
  }

  private async audit(
    client: PoolClient,
    actorUserId: string,
    correlationId: string,
    action: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ) {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'ProductionCutover',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, resourceId, correlationId, JSON.stringify(metadata)],
    );
  }

  private toCutover(row: CutoverRow) {
    return {
      id: row.id,
      launchDecisionId: row.launch_decision_id,
      commitSha: row.commit_sha,
      migrationVersion: row.migration_version,
      configurationVersion: row.configuration_version,
      rollbackTarget: row.rollback_target,
      status: row.status,
      preparedByUserId: row.prepared_by_user_id,
      preparedAt: row.prepared_at.toISOString(),
      activatedByUserId: row.activated_by_user_id,
      activatedAt: row.activated_at?.toISOString() ?? null,
      completedByUserId: row.completed_by_user_id,
      completedAt: row.completed_at?.toISOString() ?? null,
      completionReason: row.completion_reason,
      version: Number(row.version),
    };
  }
}
