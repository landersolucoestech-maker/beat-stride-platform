import type { DistributionProvider, ProviderDeliveryRequest, ProviderOperationResult } from "../../../modules/distribution/application/ports/DistributionProvider";
import type { ProviderCapability, ProviderHealth } from "../../../modules/distribution/domain/ProviderCapability";

export class FakeDistributionProvider implements DistributionProvider {
  readonly providerCode = "fake-distribution-provider";
  private readonly operations = new Map<string, ProviderOperationResult>();

  capabilities(): ReadonlySet<ProviderCapability> {
    return new Set<ProviderCapability>(["DELIVERY", "UPDATE", "TAKEDOWN"]);
  }

  async health(): Promise<ProviderHealth> { return "HEALTHY"; }

  async deliver(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.accept(request);
  }

  async requestUpdate(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.accept(request);
  }

  async requestTakedown(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.accept(request);
  }

  private accept(request: ProviderDeliveryRequest): ProviderOperationResult {
    const existing = this.operations.get(request.operationId);
    if (existing) return existing;
    const result: ProviderOperationResult = {
      providerOperationId: `fake:${request.operationId}`,
      accepted: true,
      retryable: false,
      externalStatus: "accepted",
      errorCode: null,
    };
    this.operations.set(request.operationId, result);
    return result;
  }
}
