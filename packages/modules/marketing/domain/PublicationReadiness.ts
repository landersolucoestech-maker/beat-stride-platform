import type {
  MarketingPublicationChannel,
} from "./MarketingContent";

export type PublicationReadinessBlocker =
  | "CONTENT_ARCHIVED"
  | "CAMPAIGN_CLOSED"
  | "ASSET_REQUIRED"
  | "ASSET_NOT_AVAILABLE"
  | "CHANNEL_NOT_CONNECTED"
  | "PROVIDER_NOT_CONFIGURED";

export interface PublicationReadinessInput {
  contentStatus: "DRAFT" | "READY" | "ARCHIVED";
  campaignStatus: "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  channel: MarketingPublicationChannel;
  requiresAsset: boolean;
  assetStatus: "PENDING_UPLOAD" | "AVAILABLE" | "QUARANTINED" | "REJECTED" | "DELETED" | null;
  channelConnected: boolean;
  providerConfigured: boolean;
}

export interface PublicationReadiness {
  ready: boolean;
  blockers: PublicationReadinessBlocker[];
}

export function evaluatePublicationReadiness(input: PublicationReadinessInput): PublicationReadiness {
  const blockers: PublicationReadinessBlocker[] = [];

  if (input.contentStatus === "ARCHIVED") blockers.push("CONTENT_ARCHIVED");
  if (input.campaignStatus === "COMPLETED" || input.campaignStatus === "CANCELLED") {
    blockers.push("CAMPAIGN_CLOSED");
  }

  if (input.requiresAsset && input.assetStatus === null) blockers.push("ASSET_REQUIRED");
  if (
    input.requiresAsset &&
    input.assetStatus !== null &&
    input.assetStatus !== "AVAILABLE"
  ) {
    blockers.push("ASSET_NOT_AVAILABLE");
  }

  if (!input.channelConnected) blockers.push("CHANNEL_NOT_CONNECTED");
  if (!input.providerConfigured) blockers.push("PROVIDER_NOT_CONFIGURED");

  return { ready: blockers.length === 0, blockers };
}
