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

export type MarketingContentStatus = "DRAFT" | "READY" | "ARCHIVED";

export type MarketingPublicationChannel =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "YOUTUBE"
  | "YOUTUBE_SHORTS";

export type MarketingPublicationStatus =
  | "PLANNED"
  | "READY"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export interface MarketingCampaignContentProps {
  id: string;
  organizationId: string;
  campaignId: string;
  recordingId: string | null;
  assetId: string | null;
  contentType: MarketingContentType;
  title: string;
  notes: string | null;
  status: MarketingContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketingCampaignContent {
  private constructor(private props: MarketingCampaignContentProps) {}

  static createDraft(
    input: Omit<MarketingCampaignContentProps, "status" | "createdAt" | "updatedAt"> & { now: Date },
  ): MarketingCampaignContent {
    const title = input.title.trim();
    if (!title) throw new Error("MARKETING_CONTENT_TITLE_REQUIRED");
    if (!input.campaignId.trim()) throw new Error("MARKETING_CONTENT_CAMPAIGN_REQUIRED");

    return new MarketingCampaignContent({
      ...input,
      title,
      status: "DRAFT",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: MarketingCampaignContentProps): MarketingCampaignContent {
    return new MarketingCampaignContent({ ...props });
  }

  markReady(now: Date): void {
    if (this.props.status !== "DRAFT") throw new Error("MARKETING_CONTENT_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "READY", updatedAt: now };
  }

  archive(now: Date): void {
    if (this.props.status === "ARCHIVED") throw new Error("MARKETING_CONTENT_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "ARCHIVED", updatedAt: now };
  }

  snapshot(): Readonly<MarketingCampaignContentProps> {
    return { ...this.props };
  }
}

export interface MarketingPublicationPlanProps {
  id: string;
  organizationId: string;
  contentId: string;
  channel: MarketingPublicationChannel;
  status: MarketingPublicationStatus;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  externalPublicationId: string | null;
  externalUrl: string | null;
  lastErrorCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketingPublicationPlan {
  private constructor(private props: MarketingPublicationPlanProps) {}

  static plan(
    input: Omit<
      MarketingPublicationPlanProps,
      | "status"
      | "scheduledFor"
      | "publishedAt"
      | "externalPublicationId"
      | "externalUrl"
      | "lastErrorCode"
      | "createdAt"
      | "updatedAt"
    > & { now: Date },
  ): MarketingPublicationPlan {
    if (!input.contentId.trim()) throw new Error("MARKETING_PUBLICATION_CONTENT_REQUIRED");

    return new MarketingPublicationPlan({
      ...input,
      status: "PLANNED",
      scheduledFor: null,
      publishedAt: null,
      externalPublicationId: null,
      externalUrl: null,
      lastErrorCode: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: MarketingPublicationPlanProps): MarketingPublicationPlan {
    return new MarketingPublicationPlan({ ...props });
  }

  markReady(now: Date): void {
    if (!["PLANNED", "FAILED"].includes(this.props.status)) {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "READY", lastErrorCode: null, updatedAt: now };
  }

  schedule(scheduledFor: Date, now: Date): void {
    if (!["PLANNED", "READY", "FAILED"].includes(this.props.status)) {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    if (scheduledFor <= now) throw new Error("MARKETING_PUBLICATION_SCHEDULE_INVALID");

    this.props = {
      ...this.props,
      status: "SCHEDULED",
      scheduledFor,
      lastErrorCode: null,
      updatedAt: now,
    };
  }

  startPublishing(now: Date): void {
    if (!["READY", "SCHEDULED"].includes(this.props.status)) {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "PUBLISHING", updatedAt: now };
  }

  markPublished(
    input: { publishedAt: Date; externalPublicationId: string; externalUrl: string | null; now: Date },
  ): void {
    if (this.props.status !== "PUBLISHING") {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    const externalPublicationId = input.externalPublicationId.trim();
    if (!externalPublicationId) throw new Error("MARKETING_PUBLICATION_EXTERNAL_ID_REQUIRED");

    this.props = {
      ...this.props,
      status: "PUBLISHED",
      publishedAt: input.publishedAt,
      externalPublicationId,
      externalUrl: input.externalUrl?.trim() || null,
      lastErrorCode: null,
      updatedAt: input.now,
    };
  }

  fail(errorCode: string, now: Date): void {
    if (!["READY", "SCHEDULED", "PUBLISHING"].includes(this.props.status)) {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    const normalizedErrorCode = errorCode.trim();
    if (!normalizedErrorCode) throw new Error("MARKETING_PUBLICATION_ERROR_REQUIRED");
    this.props = { ...this.props, status: "FAILED", lastErrorCode: normalizedErrorCode, updatedAt: now };
  }

  cancel(now: Date): void {
    if (["PUBLISHED", "CANCELLED"].includes(this.props.status)) {
      throw new Error("MARKETING_PUBLICATION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "CANCELLED", updatedAt: now };
  }

  snapshot(): Readonly<MarketingPublicationPlanProps> {
    return { ...this.props };
  }
}
