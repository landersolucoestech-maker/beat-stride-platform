import type { ProviderCapability, ProviderHealth } from "./ProviderCapability";

export interface ProviderRouteProps {
  providerCode: string;
  capabilities: ReadonlySet<ProviderCapability>;
  destinations: ReadonlySet<string>;
  territories: ReadonlySet<string> | null;
  health: ProviderHealth;
  enabled: boolean;
}

export interface ProviderRouteRequest {
  capability: ProviderCapability;
  destinationCode: string;
  territoryCode?: string | null;
}

export type ProviderRouteDecision =
  | { eligible: true }
  | {
      eligible: false;
      reason:
        | "PROVIDER_DISABLED"
        | "PROVIDER_UNAVAILABLE"
        | "PROVIDER_HEALTH_UNKNOWN"
        | "PROVIDER_CAPABILITY_UNSUPPORTED"
        | "PROVIDER_DESTINATION_UNSUPPORTED"
        | "PROVIDER_TERRITORY_UNSUPPORTED";
    };

export class ProviderRoute {
  private constructor(private readonly props: ProviderRouteProps) {}

  static create(props: ProviderRouteProps): ProviderRoute {
    const providerCode = props.providerCode.trim();
    if (!providerCode) throw new Error("PROVIDER_CODE_REQUIRED");
    if (props.capabilities.size === 0) throw new Error("PROVIDER_CAPABILITY_REQUIRED");
    if (props.destinations.size === 0) throw new Error("PROVIDER_DESTINATION_REQUIRED");
    return new ProviderRoute({
      ...props,
      providerCode,
      capabilities: new Set(props.capabilities),
      destinations: new Set(props.destinations),
      territories: props.territories === null ? null : new Set(props.territories),
    });
  }

  evaluate(request: ProviderRouteRequest): ProviderRouteDecision {
    if (!this.props.enabled) return { eligible: false, reason: "PROVIDER_DISABLED" };
    if (this.props.health === "UNAVAILABLE") return { eligible: false, reason: "PROVIDER_UNAVAILABLE" };
    if (this.props.health === "UNKNOWN") return { eligible: false, reason: "PROVIDER_HEALTH_UNKNOWN" };
    if (!this.props.capabilities.has(request.capability)) return { eligible: false, reason: "PROVIDER_CAPABILITY_UNSUPPORTED" };
    if (!this.props.destinations.has(request.destinationCode)) return { eligible: false, reason: "PROVIDER_DESTINATION_UNSUPPORTED" };
    if (
      request.territoryCode &&
      this.props.territories !== null &&
      !this.props.territories.has(request.territoryCode)
    ) {
      return { eligible: false, reason: "PROVIDER_TERRITORY_UNSUPPORTED" };
    }
    return { eligible: true };
  }

  snapshot(): Readonly<ProviderRouteProps> {
    return {
      ...this.props,
      capabilities: new Set(this.props.capabilities),
      destinations: new Set(this.props.destinations),
      territories: this.props.territories === null ? null : new Set(this.props.territories),
    };
  }
}
