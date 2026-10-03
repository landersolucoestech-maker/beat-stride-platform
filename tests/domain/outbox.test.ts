import { describe, expect, it } from "vitest";

import { createEventEnvelope } from "../../packages/events/src/EventEnvelope";
import { OutboxMessage } from "../../packages/events/src/OutboxMessage";

const now = new Date("2026-10-03T12:00:00.000Z");

const event = createEventEnvelope({
  eventId: "event-1",
  eventType: "release.submitted",
  eventVersion: 1,
  aggregateType: "release",
  aggregateId: "release-1",
  correlationId: "correlation-1",
  causationId: null,
  actor: { type: "USER", id: "user-1", organizationId: "org-1" },
  occurredAt: now.toISOString(),
  payload: { releaseId: "release-1" },
});

describe("OutboxMessage", () => {
  it("supports failure retry and processing", () => {
    const message = OutboxMessage.pending("outbox-1", event, now);
    message.beginAttempt(now);
    message.markFailed("temporary failure", now);
    message.beginAttempt(now);
    message.markProcessed(now);

    const snapshot = message.snapshot();
    expect(snapshot.status).toBe("PROCESSED");
    expect(snapshot.attempts).toBe(2);
  });

  it("does not process before available time", () => {
    const future = new Date("2026-10-03T13:00:00.000Z");
    const message = OutboxMessage.pending("outbox-2", event, future);
    expect(() => message.beginAttempt(now)).toThrow("OUTBOX_NOT_AVAILABLE");
  });
});
