import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

type ExerciseType = "BACKUP_RESTORE" | "FAILOVER" | "DATA_RECOVERY";
type ExerciseStatus = "PLANNED" | "RUNNING" | "PASSED" | "FAILED";

interface RecoveryExerciseRow extends QueryResultRow {
  id: string;
  exercise_type: ExerciseType;
  environment: string;
  started_at: Date;
  completed_at: Date | null;
  status: ExerciseStatus;
  evidence_reference: string | null;
  notes: string | null;
  created_at: Date;
  initiated_by_user_id: string | null;
  restore_point_at: Date | null;
  result_summary: Record<string, unknown> | null;
  version: string;
}

@Injectable()
export class RecoveryService {
  constructor(private readonly database: DatabaseService) {}

  async list(limit: number) {
    const result = await this.database.query<RecoveryExerciseRow>(
      `SELECT * FROM recovery_exercises ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return { items: result.rows.map((row) => this.toExercise(row)) };
  }

  async plan(input: {
    exerciseType: ExerciseType;
    environment: string;
    restorePointAt?: string;
    notes?: string;
    actorUserId: string;
    correlationId: string;
  }) {
    const id = randomUUID();
    const now = new Date();
    const result = await this.database.query<RecoveryExerciseRow>(
      `INSERT INTO recovery_exercises
        (id, exercise_type, environment, started_at, completed_at, status, evidence_reference, notes, created_at,
         initiated_by_user_id, restore_point_at, result_summary, version)
       VALUES ($1,$2,$3,$4,NULL,'PLANNED',NULL,$5,$4,$6,$7,NULL,1)
       RETURNING *`,
      [
        id,
        input.exerciseType,
        input.environment.trim(),
        now,
        input.notes?.trim() || null,
        input.actorUserId,
        input.restorePointAt ? new Date(input.restorePointAt) : null,
      ],
    );
    await this.audit(input.actorUserId, input.correlationId, id, "recovery.exercise.planned", {
      exerciseType: input.exerciseType,
      environment: input.environment.trim(),
    });
    return this.toExercise(result.rows[0]!);
  }

  async start(input: { exerciseId: string; expectedVersion: number; actorUserId: string; correlationId: string }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.exerciseId);
      this.assertVersion(current, input.expectedVersion);
      if (current.status !== "PLANNED") {
        throw new ConflictException({ code: "RECOVERY_EXERCISE_START_NOT_ALLOWED", message: "Only planned exercises can be started" });
      }
      const result = await client.query<RecoveryExerciseRow>(
        `UPDATE recovery_exercises
         SET status = 'RUNNING', started_at = NOW(), version = version + 1
         WHERE id = $1
         RETURNING *`,
        [input.exerciseId],
      );
      await this.auditWithClient(client, input.actorUserId, input.correlationId, input.exerciseId, "recovery.exercise.started", {});
      return this.toExercise(result.rows[0]!);
    });
  }

  async complete(input: {
    exerciseId: string;
    outcome: "PASSED" | "FAILED";
    expectedVersion: number;
    evidenceReference: string;
    notes?: string;
    resultSummary: Record<string, unknown>;
    actorUserId: string;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.exerciseId);
      this.assertVersion(current, input.expectedVersion);
      if (current.status !== "RUNNING") {
        throw new ConflictException({ code: "RECOVERY_EXERCISE_COMPLETE_NOT_ALLOWED", message: "Only running exercises can be completed" });
      }
      const result = await client.query<RecoveryExerciseRow>(
        `UPDATE recovery_exercises
         SET status = $1,
             completed_at = NOW(),
             evidence_reference = $2,
             notes = COALESCE($3, notes),
             result_summary = $4::jsonb,
             version = version + 1
         WHERE id = $5
         RETURNING *`,
        [input.outcome, input.evidenceReference.trim(), input.notes?.trim() || null, JSON.stringify(input.resultSummary), input.exerciseId],
      );
      await this.auditWithClient(client, input.actorUserId, input.correlationId, input.exerciseId, "recovery.exercise.completed", {
        outcome: input.outcome,
      });
      return this.toExercise(result.rows[0]!);
    });
  }

  private async lock(client: PoolClient, exerciseId: string): Promise<RecoveryExerciseRow> {
    const result = await client.query<RecoveryExerciseRow>(`SELECT * FROM recovery_exercises WHERE id = $1 FOR UPDATE`, [exerciseId]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException({ code: "RECOVERY_EXERCISE_NOT_FOUND", message: "Recovery exercise was not found" });
    return row;
  }

  private assertVersion(row: RecoveryExerciseRow, expectedVersion: number): void {
    const currentVersion = Number(row.version);
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({ code: "RECOVERY_EXERCISE_VERSION_CONFLICT", message: "Recovery exercise changed before the operation was applied", currentVersion });
    }
  }

  private async audit(actorUserId: string, correlationId: string, exerciseId: string, action: string, metadata: Record<string, unknown>) {
    await this.database.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'RecoveryExercise',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, exerciseId, correlationId, JSON.stringify(metadata)],
    );
  }

  private async auditWithClient(client: PoolClient, actorUserId: string, correlationId: string, exerciseId: string, action: string, metadata: Record<string, unknown>) {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       VALUES ($1,NULL,'USER',$2,$3,'RecoveryExercise',$4,$5::uuid,NOW(),$6::jsonb)`,
      [randomUUID(), actorUserId, action, exerciseId, correlationId, JSON.stringify(metadata)],
    );
  }

  private toExercise(row: RecoveryExerciseRow) {
    return {
      id: row.id,
      exerciseType: row.exercise_type,
      environment: row.environment,
      status: row.status,
      startedAt: row.started_at.toISOString(),
      completedAt: row.completed_at?.toISOString() ?? null,
      evidenceReference: row.evidence_reference,
      notes: row.notes,
      initiatedByUserId: row.initiated_by_user_id,
      restorePointAt: row.restore_point_at?.toISOString() ?? null,
      resultSummary: row.result_summary,
      version: Number(row.version),
      createdAt: row.created_at.toISOString(),
    };
  }
}
