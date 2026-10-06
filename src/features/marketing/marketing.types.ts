export interface MarketingReleaseOption {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string | null;
}

export interface MarketingActionOption {
  code: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface NativeMarketingOverview {
  available: boolean;
  releases: MarketingReleaseOption[];
  actions: MarketingActionOption[];
}

export type MarketingCampaignType =
  | "PRE_SAVE"
  | "DSP_PITCH"
  | "PROMOTION"
  | "PLAYLIST_TRACKING"
  | "CONTENT_PROMOTION";

export type MarketingCampaignStatus =
  | "DRAFT"
  | "READY"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface MarketingCampaignView {
  id: string;
  releaseId: string;
  releaseTitle: string;
  campaignType: MarketingCampaignType;
  name: string;
  objective: string | null;
  focusRecordingId: string | null;
  brief: string | null;
  budgetMinor: string | null;
  budgetCurrency: string | null;
  status: MarketingCampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MarketingCampaignPhase =
  | "PRE_RELEASE"
  | "RELEASE_DAY"
  | "POST_RELEASE"
  | "ONGOING";

export type MarketingCampaignTaskCategory =
  | "CONTENT"
  | "DSP"
  | "SMART_LINK"
  | "SOCIAL"
  | "ADS"
  | "CREATORS"
  | "AUDIENCE"
  | "PLAYLIST"
  | "OTHER";

export type MarketingCampaignTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export interface MarketingCampaignTaskView {
  id: string;
  campaignId: string;
  phase: MarketingCampaignPhase;
  category: MarketingCampaignTaskCategory;
  title: string;
  description: string | null;
  status: MarketingCampaignTaskStatus;
  assigneeUserId: string | null;
  dueAt: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaignCalendarItem {
  id: string;
  sourceType: "TASK" | "PUBLICATION";
  title: string;
  startsAt: string;
  status: string;
  phase: MarketingCampaignPhase | null;
  channel: MarketingPublicationChannel | null;
}

export type MarketingContentType =
  | "TEASER"
  | "TRAILER"
  | "MUSIC_VIDEO"
  | "VISUALIZER"
  | "LYRIC_VIDEO"
  | "SHORT_VIDEO"
  | "REEL"
  | "TIKTOK"
  | "YOUTUBE_SHORT"
  | "STORY"
  | "FEED_POST"
  | "CAROUSEL"
  | "BEHIND_THE_SCENES"
  | "AUDIO_SNIPPET"
  | "ANNOUNCEMENT"
  | "OTHER";

export type MarketingPublicationChannel =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "YOUTUBE"
  | "YOUTUBE_SHORTS";

export interface MarketingPublicationView {
  id: string;
  channel: MarketingPublicationChannel;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  externalUrl: string | null;
  lastErrorCode: string | null;
}

export type MarketingAssetType =
  | "MARKETING_IMAGE"
  | "MARKETING_VIDEO"
  | "MARKETING_AUDIO";

export interface MarketingAssetReservation {
  asset: {
    id: string;
    type: MarketingAssetType;
    status: "PENDING_UPLOAD";
    fileName: string;
    contentType: string;
    byteSize: number;
    storageKey: string;
  };
  upload: {
    available: boolean;
    reason: string | null;
    method: "PUT" | "POST" | null;
    url: string | null;
    headers: Record<string, string>;
    expiresAt: string | null;
  };
}

export interface MarketingCampaignContentView {
  id: string;
  campaignId: string;
  recordingId: string | null;
  recordingTitle: string | null;
  assetId: string | null;
  assetFileName: string | null;
  assetStatus: string | null;
  assetContentType: string | null;
  assetByteSize: string | null;
  contentType: MarketingContentType;
  title: string;
  notes: string | null;
  status: "DRAFT" | "READY" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  publications: MarketingPublicationView[];
}

export type SmartLinkType = "SMART_LINK" | "PRE_SAVE";

export interface CreateSmartLinkInput {
  releaseId: string;
  title: string;
  slug: string;
  linkType: SmartLinkType;
  destinations: Array<{ code: string; url: string }>;
  activate: boolean;
}

export interface CreatedSmartLinkView {
  id: string;
  releaseId: string;
  title: string;
  slug: string;
  linkType: SmartLinkType;
  status: "DRAFT" | "ACTIVE";
  destinations: Array<{ code: string; url: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface SmartLinkView {
  id: string;
  title: string;
  slug: string;
  linkType: SmartLinkType;
  artworkUrl: string | null;
  publicPath: string;
  destinations: Array<{ code: string; label: string }>;
  visits: string;
  clicks: string;
  clickThroughRate: string;
}

export interface SmartLinkAnalyticsView {
  id: string;
  title: string;
  slug: string;
  linkType: SmartLinkType;
  visits: string;
  clicks: string;
  clickThroughRate: string;
  destinations: Array<{
    code: string;
    url: string;
    clicks: string;
  }>;
  traffic: {
    referrers: Array<{ value: string; visits: string }>;
    utmSources: Array<{ value: string; visits: string }>;
    utmMediums: Array<{ value: string; visits: string }>;
    utmCampaigns: Array<{ value: string; visits: string }>;
  };
  timeline: Array<{
    date: string;
    visits: string;
    clicks: string;
    clickThroughRate: string;
  }>;
}

export interface SmartLinksOverview { available: boolean; items: SmartLinkView[]; }

export interface FanContactSummary {
  totalContacts: string | null;
  subscribedContacts: string | null;
  unsubscribedContacts: string | null;
  lastUpdatedAt: string | null;
}

export interface FanListOverview {
  available: boolean;
  summary: FanContactSummary;
  sources: Array<{ code: string; label: string; contacts: string }>;
}

export interface MarketingToolView {
  code: string;
  label: string;
  description: string;
  available: boolean;
  href: string | null;
}

export interface MarketingToolsOverview { available: boolean; items: MarketingToolView[]; }
