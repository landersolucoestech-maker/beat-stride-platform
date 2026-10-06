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
  status: MarketingCampaignStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface SmartLinkView {
  id: string;
  title: string;
  artworkUrl: string | null;
  publicUrl: string | null;
  destinations: Array<{ code: string; label: string }>;
  visits: string | null;
  conversions: string | null;
  conversionRate: string | null;
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
