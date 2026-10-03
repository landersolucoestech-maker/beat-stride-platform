export interface PartnerRequestContext {
  partnerClientId: string;
  correlationId: string;
  idempotencyKey: string;
}

export interface PartnerError {
  code: string;
  message: string;
  retryable: boolean;
  correlationId: string;
  fields?: Record<string, string[]>;
}

export interface MusicOsReleaseReference {
  musicOsProjectId: string;
  musicOsReleaseId: string;
  distributionReleaseId: string;
  status: string;
  version: number;
}

export interface SignedPartnerWebhookEnvelope<TPayload> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  correlationId: string;
  payload: TPayload;
}
