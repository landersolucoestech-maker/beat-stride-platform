import { describe, expect, it } from "vitest";

import {
  MarketingCampaignContent,
  MarketingPublicationPlan,
} from "../../packages/modules/marketing/domain/MarketingContent";

const now = new Date("2026-10-06T12:00:00.000Z");

describe("Marketing campaign content", () => {
  it("moves promotional content from draft to ready", () => {
    const content = MarketingCampaignContent.createDraft({
      id: "content-1",
      organizationId: "org-1",
      campaignId: "campaign-1",
      recordingId: "recording-1",
      assetId: "asset-1",
      contentType: "TEASER",
      title: "Teaser vertical",
      notes: null,
      now,
    });

    content.markReady(now);

    expect(content.snapshot().status).toBe("READY");
  });

  it("requires a future date when scheduling publication", () => {
    const publication = MarketingPublicationPlan.plan({
      id: "publication-1",
      organizationId: "org-1",
      contentId: "content-1",
      channel: "INSTAGRAM",
      now,
    });

    expect(() => publication.schedule(now, now)).toThrow("MARKETING_PUBLICATION_SCHEDULE_INVALID");
  });

  it("records authoritative provider publication identity only after publishing starts", () => {
    const publication = MarketingPublicationPlan.plan({
      id: "publication-2",
      organizationId: "org-1",
      contentId: "content-1",
      channel: "YOUTUBE_SHORTS",
      now,
    });

    publication.markReady(now);
    publication.startPublishing(now);
    publication.markPublished({
      publishedAt: new Date("2026-10-06T12:05:00.000Z"),
      externalPublicationId: "provider-post-1",
      externalUrl: "https://example.invalid/provider-post-1",
      now: new Date("2026-10-06T12:05:00.000Z"),
    });

    expect(publication.snapshot().status).toBe("PUBLISHED");
    expect(publication.snapshot().externalPublicationId).toBe("provider-post-1");
  });
});
