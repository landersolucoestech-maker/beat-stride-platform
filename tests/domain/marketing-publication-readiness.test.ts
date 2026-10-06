import { describe, expect, it } from "vitest";

import { evaluatePublicationReadiness } from "../../packages/modules/marketing/domain/PublicationReadiness";

describe("Marketing publication readiness", () => {
  it("requires asset, connection and provider before execution", () => {
    const readiness = evaluatePublicationReadiness({
      contentStatus: "DRAFT",
      campaignStatus: "DRAFT",
      channel: "INSTAGRAM",
      requiresAsset: true,
      assetStatus: "PENDING_UPLOAD",
      channelConnected: false,
      providerConfigured: false,
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toEqual([
      "ASSET_NOT_AVAILABLE",
      "CHANNEL_NOT_CONNECTED",
      "PROVIDER_NOT_CONFIGURED",
    ]);
  });

  it("allows execution only when all external prerequisites are satisfied", () => {
    const readiness = evaluatePublicationReadiness({
      contentStatus: "READY",
      campaignStatus: "ACTIVE",
      channel: "YOUTUBE_SHORTS",
      requiresAsset: true,
      assetStatus: "AVAILABLE",
      channelConnected: true,
      providerConfigured: true,
    });

    expect(readiness).toEqual({ ready: true, blockers: [] });
  });

  it("blocks closed campaigns independently of external readiness", () => {
    const readiness = evaluatePublicationReadiness({
      contentStatus: "READY",
      campaignStatus: "COMPLETED",
      channel: "TIKTOK",
      requiresAsset: false,
      assetStatus: null,
      channelConnected: true,
      providerConfigured: true,
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toContain("CAMPAIGN_CLOSED");
  });
});
