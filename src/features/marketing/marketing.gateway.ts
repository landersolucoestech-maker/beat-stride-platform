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
  constructor(private readonly baseUrl: string | null) {}

  getOverview(): Promise<NativeMarketingOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, releases: [], actions: [] });
    return this.getJson("/api/v1/marketing/overview");
  }

  getSmartLinks(): Promise<SmartLinksOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/marketing/smart-links");
  }

  getFanList(): Promise<FanListOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, summary: { totalContacts: null, subscribedContacts: null, unsubscribedContacts: null, lastUpdatedAt: null }, sources: [] });
    return this.getJson("/api/v1/marketing/fans");
  }

  getTools(): Promise<MarketingToolsOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/marketing/tools");
  }

  private async getJson<T>(path: string): Promise<T> {
    if (!this.baseUrl) throw new Error("MARKETING_API_NOT_CONNECTED");
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`MARKETING_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const marketingGateway: MarketingGateway = new HttpMarketingGateway(configuredBaseUrl);
