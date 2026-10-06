import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  MarketingChannelIntegrationsOverview,
  MarketingChannelProvider,
} from "./marketing-channel-integrations.types";

export interface MarketingChannelIntegrationsGateway {
  getOverview(): Promise<MarketingChannelIntegrationsOverview>;
  beginAuthorization(provider: MarketingChannelProvider): Promise<{ authorizationUrl: string }>;
  disconnect(provider: MarketingChannelProvider): Promise<void>;
}

class HttpMarketingChannelIntegrationsGateway implements MarketingChannelIntegrationsGateway {
  async getOverview(): Promise<MarketingChannelIntegrationsOverview> {
    if (!isApiConfigured()) return { providers: [] };
    const response = await apiRequest("/api/v1/integrations/marketing-channels");
    return (await response.json()) as MarketingChannelIntegrationsOverview;
  }

  async beginAuthorization(provider: MarketingChannelProvider): Promise<{ authorizationUrl: string }> {
    const response = await apiRequest(`/api/v1/integrations/marketing-channels/${provider}/authorize`, {
      method: "POST",
    });
    return (await response.json()) as { authorizationUrl: string };
  }

  async disconnect(provider: MarketingChannelProvider): Promise<void> {
    await apiRequest(`/api/v1/integrations/marketing-channels/${provider}`, {
      method: "DELETE",
    });
  }
}

export const marketingChannelIntegrationsGateway = new HttpMarketingChannelIntegrationsGateway();
