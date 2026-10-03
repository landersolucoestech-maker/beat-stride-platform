import { Injectable, Logger } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { loadWorkerConfig } from "./worker-config.js";
import { WorkerDatabaseService } from "./worker-database.service.js";

interface OutboxRow extends QueryResultRow {
  id: string;
  event_type: string;
  event_version: number;
  aggregate_type: string;
  aggregate_id: string;
  correlation_id: string;
  actor: unknown;
  payload: unknown;
  attempts: number;
}

export interface ClaimedOutboxEvent {
  id: string;
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  actor: unknown;
  payload: unknown;
  attempts: number;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private readonly maxAttempts = loadWorkerConfig().OUTBOX_MAX_ATTEMPTS;

  constructor(private readonly database: WorkerDatabaseService) {}

  async claimNext(): Promise<ClaimedOutboxEvent | null> {
    return this.database.transaction(async (client) => {
      const result = await client.query<OutboxRow>(
        `SELECT id, event_type, event_version, aggregate_type, aggregate_id, correlation_id, actor, payload, attempts
         FROM outbox_events
         WHERE status IN ('PENDING', 'FAILED')
           AND available_at <= NOW()
         ORDER BY occurred_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1`,
      );

      const event = result.rows[0];
      if (!event) return null;

      const attempts = event.attempts + 1;
      await client.query(
        `UPDATE outbox_events
         SET status = 'PROCESSING', attempts = $1, last_error = NULL
         WHERE id = $2`,
        [attempts, event.id],
      );

      return {
        id: event.id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        aggregateType: event.aggregate_type,
        aggregateId: event.aggregate_id,
        correlationId: event.correlation_id,
        actor: event.actor,
        payload: event.payload,
        attempts,
      };
    });
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.database.query(
      `UPDATE outbox_events
       SET status = 'PROCESSED', processed_at = NOW(), last_error = NULL
       WHERE id = $1`,
      [eventId],
    );
  }

  async markFailed(event: ClaimedOutboxEvent, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : "UNKNOWN_WORKER_ERROR";
    const deadLetter = event.attempts >= this.maxAttempts;
    const delaySeconds = Math.min(300, 2 ** Math.min(event.attempts, 8));

    await this.database.query(
      `UPDATE outbox_events
       SET status = $1,
           available_at = CASE WHEN $1 = 'FAILED' THEN NOW() + ($2 * INTERVAL '1 second') ELSE available_at END,
           last_error = $3
       WHERE id = $4`,
      [deadLetter ? "DEAD_LETTER" : "FAILED", delaySeconds, message.slice(0, 4_000), event.id],
    );

    this.logger.error(
      `Outbox event ${event.id} (${event.eventType}) failed on attempt ${event.attempts}${deadLetter ? " and moved to dead letter" : ""}: ${message}`,
    );
  }
}
