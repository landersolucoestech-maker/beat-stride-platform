import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  FanListOverview,
  MarketingAssetReservation,
  MarketingCampaignCalendarItem,
  MarketingCampaignContentView,
  MarketingCampaignPhase,
  MarketingCampaignTaskCategory,
  MarketingCampaignTaskStatus,
  MarketingCampaignTaskView,
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
    name?: string;
    objective?: string | null;
    focusRecordingId?: string | null;
    brief?: string | null;
    budgetMinor?: number | null;
    budgetCurrency?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
  }): Promise<MarketingCampaignView>;
  getCampaignTasks(campaignId: string): Promise<{ items: MarketingCampaignTaskView[] }>;
  createCampaignTask(campaignId: string, input: {
    phase: MarketingCampaignPhase;
    category: MarketingCampaignTaskCategory;
    title: string;
    description?: string | null;
    assigneeUserId?: string | null;
    dueAt?: string | null;
    sortOrder?: number;
  }): Promise<MarketingCampaignTaskView>;
  updateCampaignTaskStatus(taskId: string, status: MarketingCampaignTaskStatus): Promise<MarketingCampaignTaskView>;
  getCampaignCalendar(campaignId: string): Promise<{ items: MarketingCampaignCalendarItem[] }>;
  getCampaignContents(campaignId: string): Promise<{ items: MarketingCampaignContentView[] }>;
  createCampaignContent(campaignId: string, input: {
    recordingId?: string | null;
    assetId?: string | null;
    contentType: MarketingContentType;
    title: string;
    notes?: string | null;
  }): Promise<MarketingCampaignContentView>;
  registerContentAsset(contentId: string, input: {
    fileName: string;
    contentType: string;
    byteSize: number;
  }): Promise<MarketingAssetReservation>;
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
    name?: string;
    objective?: string | null;
    focusRecordingId?: string | null;
    brief?: string | null;
    budgetMinor?: number | null;
    budgetCurrency?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
  }): Promise<MarketingCampaignView> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson("/api/v1/marketing/campaigns", input);
  }

  getCampaignTasks(campaignId: string): Promise<{ items: MarketingCampaignTaskView[] }> {
    if (!isApiConfigured()) return Promise.resolve({ items: [] });
    return this.getJson(`/api/v1/marketing/campaigns/${campaignId}/tasks`);
  }

  createCampaignTask(campaignId: string, input: {
    phase: MarketingCampaignPhase;
    category: MarketingCampaignTaskCategory;
    title: string;
    description?: string | null;
    assigneeUserId?: string | null;
    dueAt?: string | null;
    sortOrder?: number;
  }): Promise<MarketingCampaignTaskView> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson(`/api/v1/marketing/campaigns/${campaignId}/tasks`, input);
  }

  updateCampaignTaskStatus(taskId: string, status: MarketingCampaignTaskStatus): Promise<MarketingCampaignTaskView> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.patchJson(`/api/v1/marketing/tasks/${taskId}/status`, { status });
  }

  getCampaignCalendar(campaignId: string): Promise<{ items: MarketingCampaignCalendarItem[] }> {
    if (!isApiConfigured()) return Promise.resolve({ items: [] });
    return this.getJson(`/api/v1/marketing/campaigns/${campaignId}/calendar`);
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

  registerContentAsset(contentId: string, input: {
    fileName: string;
    contentType: string;
    byteSize: number;
  }): Promise<MarketingAssetReservation> {
    if (!isApiConfigured()) throw new Error("MARKETING_API_NOT_CONNECTED");
    return this.postJson(`/api/v1/marketing/contents/${contentId}/asset`, input);
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

  private async patchJson<T>(path: string, body: unknown): Promise<T> {
    const response = await apiRequest(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  }
}

export const marketingGateway: MarketingGateway = new HttpMarketingGateway();
