import type {
  DistributionProvider,
  ProviderDeliveryRequest,
  ProviderOperationResult,
} from "../application/ports/DistributionProvider";
import type { ProviderCapability, ProviderHealth } from "../domain/ProviderCapability";

export interface FakeDistributionProviderOptions {
  providerCode?: string;
  health?: ProviderHealth;
  capabilities?: ReadonlySet<ProviderCapability>;
  failDestinations?: ReadonlySet<string>;
}

export class FakeDistributionProvider implements DistributionProvider {
  readonly providerCode: string;
  private readonly providerHealth: ProviderHealth;
  private readonly providerCapabilities: ReadonlySet<ProviderCapability>;
  private readonly failDestinations: ReadonlySet<string>;

  constructor(options: FakeDistributionProviderOptions = {}) {
    this.providerCode = options.providerCode ?? "FAKE_PROVIDER";
    this.providerHealth = options.health ?? "HEALTHY";
    this.providerCapabilities = options.capabilities ?? new Set<ProviderCapability>(["DELIVERY", "UPDATE", "TAKEDOWN"]);
    this.failDestinations = options.failDestinations ?? new Set<string>();
  }

  capabilities(): ReadonlySet<ProviderCapability> {
    return new Set(this.providerCapabilities);
  }

  async health(): Promise<ProviderHealth> {
    return this.providerHealth;
  }

  async deliver(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.execute("DELIVERY", request);
  }

  async requestUpdate(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.execute("UPDATE", request);
  }

  async requestTakedown(request: ProviderDeliveryRequest): Promise<ProviderOperationResult> {
    return this.execute("TAKEDOWN", request);
  }

  private execute(capability: ProviderCapability, request: ProviderDeliveryRequest): ProviderOperationResult {
    if (!this.providerCapabilities.has(capability)) {
      return {
        providerOperationId: `${this.providerCode}:${request.operationId}`,
        accepted: false,
        retryable: false,
        externalStatus: "UNSUPPORTED",
        errorCode: "PROVIDER_CAPABILITY_UNSUPPORTED",
      };
    }

    if (this.providerHealth === "UNAVAILABLE") {
      return {
        providerOperationId: `${this.providerCode}:${request.operationId}`,
        accepted: false,
        retryable: true,
        externalStatus: "UNAVAILABLE",
        errorCode: "PROVIDER_UNAVAILABLE",
      };
    }

    if (this.failDestinations.has(request.destinationCode)) {
      return {
        providerOperationId: `${this.providerCode}:${request.operationId}`,
        accepted: false,
        retryable: false,
        externalStatus: "REJECTED",
        errorCode: "FAKE_PROVIDER_DESTINATION_REJECTED",
      };
    }

    return {
      providerOperationId: `${this.providerCode}:${request.operationId}`,
      accepted: true,
      retryable: false,
      externalStatus: "ACCEPTED",
      errorCode: null,
    };
  }
}
