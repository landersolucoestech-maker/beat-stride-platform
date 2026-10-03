export type EventActorType = "USER" | "SERVICE" | "SYSTEM";

export interface EventActor {
  type: EventActorType;
  id: string;
  organizationId: string | null;
}

export interface EventEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: string;
  correlationId: string;
  causationId: string | null;
  actor: EventActor;
  occurredAt: string;
  payload: TPayload;
}

export function createEventEnvelope<TPayload extends Record<string, unknown>>(input: EventEnvelope<TPayload>): EventEnvelope<TPayload> {
  if (!input.eventId.trim()) throw new Error("EVENT_ID_REQUIRED");
  if (!input.eventType.trim()) throw new Error("EVENT_TYPE_REQUIRED");
  if (!Number.isInteger(input.eventVersion) || input.eventVersion < 1) throw new Error("EVENT_VERSION_INVALID");
  if (!input.aggregateType.trim() || !input.aggregateId.trim()) throw new Error("EVENT_AGGREGATE_REQUIRED");
  if (!input.correlationId.trim()) throw new Error("EVENT_CORRELATION_ID_REQUIRED");
  if (!input.actor.id.trim()) throw new Error("EVENT_ACTOR_ID_REQUIRED");
  if (Number.isNaN(Date.parse(input.occurredAt))) throw new Error("EVENT_OCCURRED_AT_INVALID");

  return {
    ...input,
    actor: { ...input.actor },
    payload: { ...input.payload },
  };
}
