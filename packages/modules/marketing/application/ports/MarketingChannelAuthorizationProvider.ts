import type { MarketingChannelProvider } from "../../domain/MarketingChannelConnection";

export interface MarketingChannelAuthorizationResult {
  authorizationUrl: string;
  expiresAt: Date;
}

export interface MarketingChannelAuthorizationProvider {
  provider: MarketingChannelProvider;
  isConfigured(): boolean;
  beginAuthorization(input: {
    organizationId: string;
    state: string;
  }): Promise<MarketingChannelAuthorizationResult>;
  revoke(input: {
    credentialSecretReference: string;
  }): Promise<void>;
}
