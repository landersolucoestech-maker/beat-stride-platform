import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  FanListOverview,
  MarketingCampaignContentView,
  MarketingCampaignType,
  MarketingCampaignView,
  MarketingContentType,
  MarketingPublicationChannel,
  MarketingPublicationView,
  MarketingToolsOverview,
  NativeMarketingOverview,
  SmartLinksOverview,
} from "./marketing.types";

export interface MarketingGateway {
  getOverview(): Promise<NativeMarketingOverview>;
  listCampaigns(releaseId?: string): Promise<{ items: MarketingCampaignView[] }>;
  createCampaign(input: {
    releaseId: string;
    campaignType: MarketingCampaignType;
    startsAt?: string | null;
    endsAt?: string | null;
  }): Promise<MarketingCampaignView>;
  getCampaignContents(campaignId: string): Promise<{ items: MarketingCampaignContentView[] }>;
  createCampaignContent(campaignId: string, input: {
    recordingId?: string | null;
    assetId?: string | null;
    contentType: MarketingContentType;
    title: string;
    notes?: string | null;
  }): Promise<MarketingCampaignContentView>;
  createPublicationPlan(contentId: string, input: {
    channel: MarketingPublicationChannel;
    scheduledFor?: string | null;
  }): Promise<MarketingPublicationView & { contentId: string; providerExecutionAvailable: boolean }>;
  getSmartLinks(): Promise<SmartLinksOverview>;
  getFanList(): Promise<FanListOverview>;
  getTools(): Promise<MarketingToolsOverview>;
}

class HttpMarketingGateway implements MarketingGateway {
  getOverview(): Promise<NativeMarketingOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, releases: [], actions: [] });
    return this.getJson("/api/v1/marketing/overview");
  }

  listCampaigns(releaseId?: string): Promise<{ items: MarketingCampaignView[] }> {
    if (!isApiConfigured()) return Promise.resolve({ items: [] });
    const query = releaseId ? `?releaseId=${encodeURIComponent(releaseId)}` : "";
    return this.getJson(`/api/v1/marketing/campaigns${query}`);
  }

  createCampaign(input: {
    releaseId: string;
    campaignType: MarketingCampaignType;
    startsAt?: string | null;
    endsAt?: string | null;
  }): Promise<MarketingCampaignView> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson("/api/v1/marketing/campaigns", input);
  }

  getCampaignContents(campaignId: string): Promise<{ items: MarketingCampaignContentView[] }> {
    if (!isApiConfigured()) return Promise.resolve({ items: [] });
    return this.getJson(`/api/v1/marketing/campaigns/${campaignId}/contents`);
  }

  createCampaignContent(campaignId: string, input: {
    recordingId?: string | null;
    assetId?: string | null;
    contentType: MarketingContentType;
    title: string;
    notes?: string | null;
  }): Promise<MarketingCampaignContentView> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson(`/api/v1/marketing/campaigns/${campaignId}/contents`, input);
  }

  createPublicationPlan(contentId: string, input: {
    channel: MarketingPublicationChannel;
    scheduledFor?: string | null;
  }): Promise<MarketingPublicationView & { contentId: string; providerExecutionAvailable: boolean }> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson(`/api/v1/marketing/contents/${contentId}/publications`, input);
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

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  }
}

export const marketingGateway: MarketingGateway = new HttpMarketingGateway();
