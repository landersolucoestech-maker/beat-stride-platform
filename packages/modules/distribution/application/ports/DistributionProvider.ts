import type { ProviderCapability, ProviderHealth } from "../../domain/ProviderCapability";

export interface ProviderDeliveryRequest {
  operationId: string;
  releaseId: string;
  releaseVersion: number;
  destinationCode: string;
  payloadReference: string;
  correlationId: string;
}

export interface ProviderOperationResult {
  providerOperationId: string;
  accepted: boolean;
  retryable: boolean;
  externalStatus: string | null;
  errorCode: string | null;
}

export interface DistributionProvider {
  readonly providerCode: string;
  capabilities(): ReadonlySet<ProviderCapability>;
  health(): Promise<ProviderHealth>;
  deliver(request: ProviderDeliveryRequest): Promise<ProviderOperationResult>;
  requestUpdate?(request: ProviderDeliveryRequest): Promise<ProviderOperationResult>;
  requestTakedown?(request: ProviderDeliveryRequest): Promise<ProviderOperationResult>;
}
