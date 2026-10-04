import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type AutomationStatus = "PENDING" | "RUNNING" | "AWAITING_APPROVAL" | "SUCCEEDED" | "FAILED" | "CANCELLED";
type AutonomyMode = "AUTO" | "CONTROLLED" | "APPROVAL_GATED";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface AutomationRunRow extends QueryResultRow {
  id: string;
  organization_id: string | null;
  automation_type: string;
  autonomy_mode: AutonomyMode;
  resource_type: string | null;
  resource_id: string | null;
  status: AutomationStatus;
  risk_level: RiskLevel;
  correlation_id: string;
  requested_by_actor: Record<string, unknown>;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown> | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  version: string;
}

interface ToolInvocationRow extends QueryResultRow {
  id: string;
  tool_name: string;
  reversible: boolean;
  status: string;
  request_summary: Record<string, unknown>;
  result_summary: Record<string, unknown> | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
}

interface ApprovalRow extends QueryResultRow {
  id: string;
  decision: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: Date;
  decided_at: Date | null;
  decided_by_user_id: string | null;
  decision_reason: string | null;
}

@Injectable()
export class AutomationService {
  constructor(private readonly database: DatabaseService) {}

  async list(input: { status?: AutomationStatus; limit: number }) {
    const values: unknown[] = [];
    let whereClause = "";
    if (input.status) {
      values.push(input.status);
      whereClause = `WHERE status = $${values.length}`;
    }
    values.push(input.limit);
    const result = await this.database.query<AutomationRunRow>(
      `SELECT * FROM automation_runs ${whereClause} ORDER BY created_at DESC LIMIT $${values.length}`,
      values,
    );
    return { items: result.rows.map((row) => this.toRun(row)) };
  }

  async get(runId: string) {
    const runResult = await this.database.query<AutomationRunRow>(`SELECT * FROM automation_runs WHERE id = $1 LIMIT 1`, [runId]);
    const run = runResult.rows[0];
    if (!run) throw new NotFoundException({ code: "AUTOMATION_RUN_NOT_FOUND", message: "Automation run was not found" });

    const invocations = await this.database.query<ToolInvocationRow>(
      `SELECT * FROM automation_tool_invocations WHERE automation_run_id = $1 ORDER BY created_at ASC`,
      [runId],
    );
    const approval = await this.database.query<ApprovalRow>(
      `SELECT * FROM automation_approvals WHERE automation_run_id = $1 LIMIT 1`,
      [runId],
    );

    return {
      ...this.toRun(run),
      approval: approval.rows[0] ? this.toApproval(approval.rows[0]) : null,
      toolInvocations: invocations.rows.map((row) => ({
        id: row.id,
        toolName: row.tool_name,
        reversible: row.reversible,
        status: row.status,
        requestSummary: row.request_summary,
        resultSummary: row.result_summary,
        startedAt: row.started_at?.toISOString() ?? null,
        completedAt: row.completed_at?.toISOString() ?? null,
        createdAt: row.created_at.toISOString(),
      })),
    };
  }

  async request(input: {
    organizationId: string | null;
    automationType: string;
    autonomyMode: AutonomyMode;
    resourceType: string | null;
    resourceId: string | null;
    riskLevel: RiskLevel;
    inputSummary: Record<string, unknown>;
    actorUserId: string;
    correlationId: string;
  }) {
    if ((input.resourceType === null) !== (input.resourceId === null)) {
      throw new ConflictException({ code: "AUTOMATION_RESOURCE_INVALID", message: "Resource type and resource id must be supplied together" });
    }

    const approvalRequired = input.autonomyMode === "APPROVAL_GATED" || input.riskLevel === "HIGH" || input.riskLevel === "CRITICAL";
    if ((input.riskLevel === "HIGH" || input.riskLevel === "CRITICAL") && input.autonomyMode === "AUTO") {
      throw new ConflictException({
        code: "AUTOMATION_AUTONOMY_NOT_ALLOWED",
        message: "High-risk and critical automation cannot run in AUTO mode",
      });
    }

    return this.database.transaction(async (client) => {
      const runId = randomUUID();
      const now = new Date();
      const status: AutomationStatus = approvalRequired ? "AWAITING_APPROVAL" : "PENDING";
      const requestedByActor = { type: "USER", id: input.actorUserId, organizationId: input.organizationId };

      const result = await client.query<AutomationRunRow>(
        `INSERT INTO automation_runs
          (id, organization_id, automation_type, autonomy_mode, resource_type, resource_id, status, risk_level,
           correlation_id, requested_by_actor, input_summary, output_summary, started_at, completed_at, created_at, version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::uuid,$10::jsonb,$11::jsonb,NULL,NULL,NULL,$12,1)
         RETURNING *`,
        [
          runId,
          input.organizationId,
          input.automationType.trim(),
          input.autonomyMode,
          input.resourceType,
          input.resourceId,
          status,
          input.riskLevel,
          input.correlationId,
          JSON.stringify(requestedByActor),
          JSON.stringify(input.inputSummary),
          now,
        ],
      );

      if (approvalRequired) {
        await client.query(
          `INSERT INTO automation_approvals
            (id, automation_run_id, decision, requested_at, decided_at, decided_by_user_id, decision_reason)
           VALUES ($1,$2,'PENDING',$3,NULL,NULL,NULL)`,
          [randomUUID(), runId, now],
        );
      }

      await this.audit(client, {
        runId,
        actorUserId: input.actorUserId,
        correlationId: input.correlationId,
        organizationId: input.organizationId,
        action: "automation.run.requested",
        metadata: { autonomyMode: input.autonomyMode, riskLevel: input.riskLevel, approvalRequired },
      });

      return this.toRun(result.rows[0]!);
    });
  }

  async decide(input: {
    runId: string;
    decision: "APPROVED" | "REJECTED";
    reason: string;
    actorUserId: string;
    expectedVersion: number;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const run = await this.lock(client, input.runId);
      this.assertVersion(run, input.expectedVersion);
      if (run.status !== "AWAITING_APPROVAL") {
        throw new ConflictException({ code: "AUTOMATION_APPROVAL_NOT_ALLOWED", message: "Automation run is not awaiting approval" });
      }

      const approvalResult = await client.query<ApprovalRow>(
        `UPDATE automation_approvals
         SET decision = $1, decided_at = NOW(), decided_by_user_id = $2, decision_reason = $3
         WHERE automation_run_id = $4 AND decision = 'PENDING'
         RETURNING *`,
        [input.decision, input.actorUserId, input.reason.trim(), input.runId],
      );
      if (!approvalResult.rows[0]) {
        throw new ConflictException({ code: "AUTOMATION_APPROVAL_ALREADY_DECIDED", message: "Automation approval was already decided" });
      }

      const nextStatus: AutomationStatus = input.decision === "APPROVED" ? "PENDING" : "CANCELLED";
      const runResult = await client.query<AutomationRunRow>(
        `UPDATE automation_runs
         SET status = $1, completed_at = CASE WHEN $1 = 'CANCELLED' THEN NOW() ELSE NULL END, version = version + 1
         WHERE id = $2
         RETURNING *`,
        [nextStatus, input.runId],
      );
      await this.audit(client, {
        runId: input.runId,
        actorUserId: input.actorUserId,
        correlationId: input.correlationId,
        organizationId: run.organization_id,
        action: input.decision === "APPROVED" ? "automation.run.approved" : "automation.run.rejected",
        metadata: { reason: input.reason.trim() },
      });
      return { run: this.toRun(runResult.rows[0]!), approval: this.toApproval(approvalResult.rows[0]) };
    });
  }

  async cancel(input: {
    runId: string;
    actorUserId: string;
    expectedVersion: number;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const run = await this.lock(client, input.runId);
      this.assertVersion(run, input.expectedVersion);
      if (!["PENDING", "RUNNING", "AWAITING_APPROVAL"].includes(run.status)) {
        throw new ConflictException({ code: "AUTOMATION_STATE_TRANSITION_INVALID", message: "Automation run cannot be cancelled from its current state" });
      }
      const result = await client.query<AutomationRunRow>(
        `UPDATE automation_runs SET status = 'CANCELLED', completed_at = NOW(), version = version + 1 WHERE id = $1 RETURNING *`,
        [input.runId],
      );
      await client.query(
        `UPDATE automation_approvals
         SET decision = 'REJECTED', decided_at = NOW(), decided_by_user_id = $1, decision_reason = 'Run cancelled before approval'
         WHERE automation_run_id = $2 AND decision = 'PENDING'`,
        [input.actorUserId, input.runId],
      );
      await this.audit(client, {
        runId: input.runId,
        actorUserId: input.actorUserId,
        correlationId: input.correlationId,
        organizationId: run.organization_id,
        action: "automation.run.cancelled",
        metadata: {},
      });
      return this.toRun(result.rows[0]!);
    });
  }

  private async lock(client: PoolClient, runId: string): Promise<AutomationRunRow> {
    const result = await client.query<AutomationRunRow>(`SELECT * FROM automation_runs WHERE id = $1 FOR UPDATE`, [runId]);
    const run = result.rows[0];
    if (!run) throw new NotFoundException({ code: "AUTOMATION_RUN_NOT_FOUND", message: "Automation run was not found" });
    return run;
  }

  private assertVersion(run: AutomationRunRow, expectedVersion: number): void {
    const currentVersion = Number(run.version);
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({ code: "AUTOMATION_RUN_VERSION_CONFLICT", message: "Automation run changed before the operation was applied", currentVersion });
    }
  }

  private async audit(client: PoolClient, input: {
    runId: string;
    actorUserId: string;
    correlationId: string;
    organizationId: string | null;
    action: string;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,$2,'USER',$3,$4,'AutomationRun',$5,$6::uuid,NOW(),$7::jsonb)`,
      [randomUUID(), input.organizationId, input.actorUserId, input.action, input.runId, input.correlationId, JSON.stringify(input.metadata)],
    );
  }

  private toRun(row: AutomationRunRow) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      automationType: row.automation_type,
      autonomyMode: row.autonomy_mode,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      status: row.status,
      riskLevel: row.risk_level,
      correlationId: row.correlation_id,
      requestedByActor: row.requested_by_actor,
      inputSummary: row.input_summary,
      outputSummary: row.output_summary,
      startedAt: row.started_at?.toISOString() ?? null,
      completedAt: row.completed_at?.toISOString() ?? null,
      createdAt: row.created_at.toISOString(),
      version: Number(row.version),
    };
  }

  private toApproval(row: ApprovalRow) {
    return {
      id: row.id,
      decision: row.decision,
      requestedAt: row.requested_at.toISOString(),
      decidedAt: row.decided_at?.toISOString() ?? null,
      decidedByUserId: row.decided_by_user_id,
      decisionReason: row.decision_reason,
    };
  }
}
