import type { MarketingPublicationChannel } from "../../domain/MarketingContent";

export interface MarketingPublicationRequest {
  organizationId: string;
  publicationId: string;
  contentId: string;
  channel: MarketingPublicationChannel;
  title: string;
  notes: string | null;
  asset: {
    storageKey: string;
    contentType: string;
    byteSize: number;
    checksumSha256: string;
  } | null;
  scheduledFor: Date | null;
}

export interface MarketingPublicationResult {
  externalPublicationId: string;
  externalUrl: string | null;
  publishedAt: Date;
}

export interface MarketingPublicationProvider {
  isConfigured(): boolean;
  supports(channel: MarketingPublicationChannel): boolean;
  publish(request: MarketingPublicationRequest): Promise<MarketingPublicationResult>;
}
