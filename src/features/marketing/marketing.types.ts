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

export interface SmartLinkView {
  id: string;
  title: string;
  artworkUrl: string | null;
  publicUrl: string;
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
