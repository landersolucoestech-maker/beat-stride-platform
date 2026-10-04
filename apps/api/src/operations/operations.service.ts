import { randomUUID } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PoolClient, QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

const statuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"] as const;
type WorkStatus = (typeof statuses)[number];
type WorkPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface WorkItemRow extends QueryResultRow {
  id: string;
  organization_id: string | null;
  work_type: string;
  resource_type: string;
  resource_id: string;
  status: WorkStatus;
  priority: WorkPriority;
  summary: string;
  assigned_user_id: string | null;
  blocked_reason: string | null;
  resolution: string | null;
  due_at: Date | null;
  version: string;
  created_at: Date;
  updated_at: Date;
}

interface WorkItemListRow extends WorkItemRow {
  assigned_email: string | null;
  organization_name: string | null;
}

const allowedTransitions: Record<WorkStatus, readonly WorkStatus[]> = {
  OPEN: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["OPEN", "IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["BLOCKED", "COMPLETED", "CANCELLED"],
  BLOCKED: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class OperationsService {
  constructor(private readonly database: DatabaseService) {}

  async list(input: {
    status?: WorkStatus;
    workType?: string;
    assignedUserId?: string;
    limit: number;
  }) {
    const values: unknown[] = [];
    const predicates: string[] = [];

    if (input.status) {
      values.push(input.status);
      predicates.push(`work.status = $${values.length}`);
    }
    if (input.workType) {
      values.push(input.workType);
      predicates.push(`work.work_type = $${values.length}`);
    }
    if (input.assignedUserId) {
      values.push(input.assignedUserId);
      predicates.push(`work.assigned_user_id = $${values.length}`);
    }
    values.push(input.limit);

    const result = await this.database.query<WorkItemListRow>(
      `SELECT
         work.*,
         assigned.email AS assigned_email,
         organization.display_name AS organization_name
       FROM operation_work_items work
       LEFT JOIN users assigned ON assigned.id = work.assigned_user_id
       LEFT JOIN organizations organization ON organization.id = work.organization_id
       ${predicates.length ? `WHERE ${predicates.join(" AND ")}` : ""}
       ORDER BY
         CASE work.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END,
         work.due_at ASC NULLS LAST,
         work.created_at ASC
       LIMIT $${values.length}`,
      values,
    );

    return { items: result.rows.map((row) => this.toListItem(row)) };
  }

  async get(workItemId: string) {
    const result = await this.database.query<WorkItemListRow>(
      `SELECT
         work.*,
         assigned.email AS assigned_email,
         organization.display_name AS organization_name
       FROM operation_work_items work
       LEFT JOIN users assigned ON assigned.id = work.assigned_user_id
       LEFT JOIN organizations organization ON organization.id = work.organization_id
       WHERE work.id = $1
       LIMIT 1`,
      [workItemId],
    );
    const item = result.rows[0];
    if (!item) throw new NotFoundException({ code: "OPERATION_WORK_ITEM_NOT_FOUND", message: "Work item was not found" });
    return this.toListItem(item);
  }

  async assign(input: {
    workItemId: string;
    assignedUserId: string;
    actorUserId: string;
    expectedVersion: number;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.workItemId);
      this.assertVersion(current, input.expectedVersion);
      if (!["OPEN", "BLOCKED"].includes(current.status)) this.invalidTransition(current.status, "ASSIGNED");
      await this.assertActiveUser(client, input.assignedUserId);

      const updated = await client.query<WorkItemRow>(
        `UPDATE operation_work_items
         SET status = 'ASSIGNED', assigned_user_id = $1, blocked_reason = NULL, version = version + 1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [input.assignedUserId, input.workItemId],
      );
      await this.audit(client, input, "operation.work_item.assigned", { assignedUserId: input.assignedUserId });
      return this.toItem(updated.rows[0]!);
    });
  }

  async transition(input: {
    workItemId: string;
    nextStatus: WorkStatus;
    actorUserId: string;
    expectedVersion: number;
    blockedReason?: string;
    resolution?: string;
    correlationId: string;
  }) {
    return this.database.transaction(async (client) => {
      const current = await this.lock(client, input.workItemId);
      this.assertVersion(current, input.expectedVersion);
      if (!allowedTransitions[current.status].includes(input.nextStatus)) this.invalidTransition(current.status, input.nextStatus);
      if (input.nextStatus === "BLOCKED" && !input.blockedReason?.trim()) {
        throw new ConflictException({ code: "OPERATION_BLOCK_REASON_REQUIRED", message: "A blocked reason is required" });
      }
      if (input.nextStatus === "COMPLETED" && !input.resolution?.trim()) {
        throw new ConflictException({ code: "OPERATION_RESOLUTION_REQUIRED", message: "A completion resolution is required" });
      }

      const assignedUserId = input.nextStatus === "OPEN" ? null : current.assigned_user_id;
      const updated = await client.query<WorkItemRow>(
        `UPDATE operation_work_items
         SET status = $1,
             assigned_user_id = $2,
             blocked_reason = $3,
             resolution = $4,
             version = version + 1,
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          input.nextStatus,
          assignedUserId,
          input.nextStatus === "BLOCKED" ? input.blockedReason?.trim() : null,
          input.nextStatus === "COMPLETED" ? input.resolution?.trim() : null,
          input.workItemId,
        ],
      );
      await this.audit(client, input, `operation.work_item.${input.nextStatus.toLowerCase()}`, {
        previousStatus: current.status,
        nextStatus: input.nextStatus,
      });
      return this.toItem(updated.rows[0]!);
    });
  }

  private async lock(client: PoolClient, workItemId: string): Promise<WorkItemRow> {
    const result = await client.query<WorkItemRow>(`SELECT * FROM operation_work_items WHERE id = $1 FOR UPDATE`, [workItemId]);
    const item = result.rows[0];
    if (!item) throw new NotFoundException({ code: "OPERATION_WORK_ITEM_NOT_FOUND", message: "Work item was not found" });
    return item;
  }

  private assertVersion(item: WorkItemRow, expectedVersion: number): void {
    const currentVersion = Number(item.version);
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({
        code: "OPERATION_WORK_ITEM_VERSION_CONFLICT",
        message: "Work item changed before the operation was applied",
        currentVersion,
      });
    }
  }

  private async assertActiveUser(client: PoolClient, userId: string): Promise<void> {
    const result = await client.query<QueryResultRow>(`SELECT 1 FROM users WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`, [userId]);
    if (!result.rows[0]) throw new NotFoundException({ code: "OPERATION_ASSIGNEE_NOT_FOUND", message: "Assignee was not found" });
  }

  private invalidTransition(current: WorkStatus, next: WorkStatus): never {
    throw new ConflictException({
      code: "OPERATION_STATE_TRANSITION_INVALID",
      message: "Work item state transition is not allowed",
      currentStatus: current,
      requestedStatus: next,
    });
  }

  private async audit(
    client: PoolClient,
    input: { workItemId: string; actorUserId: string; correlationId: string },
    action: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await client.query(
      `INSERT INTO audit_events
        (id, organization_id, actor_type, actor_id, action, resource_type, resource_id, correlation_id, occurred_at, metadata)
       SELECT $1, work.organization_id, 'USER', $2, $3, 'OperationWorkItem', work.id::text, $4::uuid, NOW(), $5::jsonb
       FROM operation_work_items work
       WHERE work.id = $6`,
      [randomUUID(), input.actorUserId, action, input.correlationId, JSON.stringify(metadata), input.workItemId],
    );
  }

  private toListItem(row: WorkItemListRow) {
    return {
      ...this.toItem(row),
      assignedEmail: row.assigned_email,
      organizationName: row.organization_name,
    };
  }

  private toItem(row: WorkItemRow) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      workType: row.work_type,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      status: row.status,
      priority: row.priority,
      summary: row.summary,
      assignedUserId: row.assigned_user_id,
      blockedReason: row.blocked_reason,
      resolution: row.resolution,
      dueAt: row.due_at?.toISOString() ?? null,
      overdue: row.due_at !== null && row.due_at < new Date() && !["COMPLETED", "CANCELLED"].includes(row.status),
      version: Number(row.version),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
