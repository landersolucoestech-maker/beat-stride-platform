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

export interface MarketingCampaignTaskProps {
  id: string;
  organizationId: string;
  campaignId: string;
  phase: MarketingCampaignPhase;
  category: MarketingCampaignTaskCategory;
  title: string;
  description: string | null;
  status: MarketingCampaignTaskStatus;
  assigneeUserId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketingCampaignTask {
  private constructor(private props: MarketingCampaignTaskProps) {}

  static create(input: Omit<
    MarketingCampaignTaskProps,
    "status" | "completedAt" | "createdAt" | "updatedAt"
  > & { now: Date }): MarketingCampaignTask {
    const title = input.title.trim();
    if (!title) throw new Error("MARKETING_TASK_TITLE_REQUIRED");
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      throw new Error("MARKETING_TASK_SORT_ORDER_INVALID");
    }

    return new MarketingCampaignTask({
      ...input,
      title,
      description: input.description?.trim() || null,
      status: "TODO",
      completedAt: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: MarketingCampaignTaskProps): MarketingCampaignTask {
    return new MarketingCampaignTask({ ...props });
  }

  start(now: Date): void {
    if (!["TODO", "BLOCKED"].includes(this.props.status)) {
      throw new Error("MARKETING_TASK_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "IN_PROGRESS",
      completedAt: null,
      updatedAt: now,
    };
  }

  block(now: Date): void {
    if (!["TODO", "IN_PROGRESS"].includes(this.props.status)) {
      throw new Error("MARKETING_TASK_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "BLOCKED",
      completedAt: null,
      updatedAt: now,
    };
  }

  complete(now: Date): void {
    if (!["TODO", "IN_PROGRESS", "BLOCKED"].includes(this.props.status)) {
      throw new Error("MARKETING_TASK_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "DONE",
      completedAt: now,
      updatedAt: now,
    };
  }

  cancel(now: Date): void {
    if (["DONE", "CANCELLED"].includes(this.props.status)) {
      throw new Error("MARKETING_TASK_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "CANCELLED",
      completedAt: null,
      updatedAt: now,
    };
  }

  snapshot(): Readonly<MarketingCampaignTaskProps> {
    return { ...this.props };
  }
}
