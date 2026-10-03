import type { EventEnvelope } from "./EventEnvelope";

export type OutboxStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED" | "DEAD_LETTER";

export interface OutboxMessageProps {
  id: string;
  event: EventEnvelope;
  status: OutboxStatus;
  attempts: number;
  availableAt: Date;
  processedAt: Date | null;
  lastError: string | null;
}

export class OutboxMessage {
  private constructor(private props: OutboxMessageProps) {}

  static pending(id: string, event: EventEnvelope, availableAt: Date): OutboxMessage {
    if (!id.trim()) throw new Error("OUTBOX_ID_REQUIRED");
    return new OutboxMessage({ id, event, status: "PENDING", attempts: 0, availableAt, processedAt: null, lastError: null });
  }

  static restore(props: OutboxMessageProps): OutboxMessage {
    return new OutboxMessage({ ...props });
  }

  beginAttempt(now: Date): void {
    if (!["PENDING", "FAILED"].includes(this.props.status)) throw new Error("OUTBOX_STATE_TRANSITION_INVALID");
    if (this.props.availableAt > now) throw new Error("OUTBOX_NOT_AVAILABLE");
    this.props = { ...this.props, status: "PROCESSING", attempts: this.props.attempts + 1, lastError: null };
  }

  markProcessed(now: Date): void {
    if (this.props.status !== "PROCESSING") throw new Error("OUTBOX_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "PROCESSED", processedAt: now, lastError: null };
  }

  markFailed(error: string, nextAvailableAt: Date): void {
    if (this.props.status !== "PROCESSING") throw new Error("OUTBOX_STATE_TRANSITION_INVALID");
    const lastError = error.trim();
    if (!lastError) throw new Error("OUTBOX_ERROR_REQUIRED");
    this.props = { ...this.props, status: "FAILED", lastError, availableAt: nextAvailableAt };
  }

  moveToDeadLetter(error: string): void {
    if (!["PROCESSING", "FAILED"].includes(this.props.status)) throw new Error("OUTBOX_STATE_TRANSITION_INVALID");
    const lastError = error.trim();
    if (!lastError) throw new Error("OUTBOX_ERROR_REQUIRED");
    this.props = { ...this.props, status: "DEAD_LETTER", lastError };
  }

  snapshot(): Readonly<OutboxMessageProps> {
    return { ...this.props };
  }
}
