import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  FanListOverview,
  MarketingToolsOverview,
  NativeMarketingOverview,
  SmartLinksOverview,
} from "./marketing.types";

export interface MarketingGateway {
  getOverview(): Promise<NativeMarketingOverview>;
  getSmartLinks(): Promise<SmartLinksOverview>;
  getFanList(): Promise<FanListOverview>;
  getTools(): Promise<MarketingToolsOverview>;
}

class HttpMarketingGateway implements MarketingGateway {
  getOverview(): Promise<NativeMarketingOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, releases: [], actions: [] });
    return this.getJson("/api/v1/marketing/overview");
  }

  getSmartLinks(): Promise<SmartLinksOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/marketing/smart-links");
  }

  getFanList(): Promise<FanListOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, summary: { totalContacts: null, subscribedContacts: null, unsubscribedContacts: null, lastUpdatedAt: null }, sources: [] });
    return this.getJson("/api/v1/marketing/fans");
  }

  getTools(): Promise<MarketingToolsOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/marketing/tools");
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await apiRequest(path);
    return (await response.json()) as T;
  }
}

export const marketingGateway: MarketingGateway = new HttpMarketingGateway();
