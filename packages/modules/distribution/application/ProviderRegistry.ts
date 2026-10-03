import type { ProviderCapability } from "../domain/ProviderCapability";
import type { DistributionProvider } from "./ports/DistributionProvider";

export class ProviderRegistry {
  private readonly providers = new Map<string, DistributionProvider>();

  register(provider: DistributionProvider): void {
    if (this.providers.has(provider.providerCode)) throw new Error("PROVIDER_ALREADY_REGISTERED");
    this.providers.set(provider.providerCode, provider);
  }

  require(providerCode: string, capability: ProviderCapability): DistributionProvider {
    const provider = this.providers.get(providerCode);
    if (!provider) throw new Error("PROVIDER_NOT_CONFIGURED");
    if (!provider.capabilities().has(capability)) throw new Error("PROVIDER_CAPABILITY_NOT_AVAILABLE");
    return provider;
  }
}
