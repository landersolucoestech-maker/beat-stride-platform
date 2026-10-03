export type ReleaseType = "SINGLE" | "EP" | "ALBUM";
export type ReleaseStatus =
  | "DRAFT"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED"
  | "VALIDATING"
  | "CORRECTION_REQUIRED"
  | "RESUBMITTED"
  | "AUTHORIZATION_REQUIRED"
  | "MANUAL_REVIEW"
  | "REJECTED"
  | "APPROVED"
  | "SCHEDULED"
  | "DISTRIBUTING"
  | "LIVE"
  | "PARTIALLY_LIVE"
  | "DISTRIBUTION_FAILED";

export interface ReleaseProps {
  id: string;
  organizationId: string;
  title: string;
  type: ReleaseType;
  status: ReleaseStatus;
  currentVersion: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<ReleaseStatus, readonly ReleaseStatus[]> = {
  DRAFT: ["READY_FOR_SUBMISSION"],
  READY_FOR_SUBMISSION: ["DRAFT", "SUBMITTED"],
  SUBMITTED: ["VALIDATING"],
  VALIDATING: ["CORRECTION_REQUIRED", "AUTHORIZATION_REQUIRED", "MANUAL_REVIEW", "REJECTED", "APPROVED"],
  CORRECTION_REQUIRED: ["RESUBMITTED"],
  RESUBMITTED: ["VALIDATING"],
  AUTHORIZATION_REQUIRED: ["VALIDATING", "MANUAL_REVIEW", "REJECTED"],
  MANUAL_REVIEW: ["CORRECTION_REQUIRED", "AUTHORIZATION_REQUIRED", "REJECTED", "APPROVED"],
  REJECTED: [],
  APPROVED: ["SCHEDULED", "DISTRIBUTING"],
  SCHEDULED: ["DISTRIBUTING"],
  DISTRIBUTING: ["LIVE", "PARTIALLY_LIVE", "DISTRIBUTION_FAILED"],
  LIVE: [],
  PARTIALLY_LIVE: ["DISTRIBUTING", "LIVE", "DISTRIBUTION_FAILED"],
  DISTRIBUTION_FAILED: ["DISTRIBUTING"],
};

export class Release {
  private constructor(private props: ReleaseProps) {}

  static createDraft(input: Omit<ReleaseProps, "status" | "currentVersion" | "version" | "createdAt" | "updatedAt"> & { now: Date }): Release {
    const title = input.title.trim();
    if (!title) throw new Error("RELEASE_TITLE_REQUIRED");

    return new Release({
      id: input.id,
      organizationId: input.organizationId,
      title,
      type: input.type,
      status: "DRAFT",
      currentVersion: 1,
      version: 1,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: ReleaseProps): Release {
    return new Release({ ...props });
  }

  updateDraft(input: { title?: string; type?: ReleaseType; now: Date }): void {
    if (this.props.status !== "DRAFT" && this.props.status !== "READY_FOR_SUBMISSION") {
      throw new Error("RELEASE_NOT_EDITABLE");
    }

    const nextTitle = input.title === undefined ? this.props.title : input.title.trim();
    if (!nextTitle) throw new Error("RELEASE_TITLE_REQUIRED");

    this.props = {
      ...this.props,
      title: nextTitle,
      type: input.type ?? this.props.type,
      currentVersion: this.props.currentVersion + 1,
      version: this.props.version + 1,
      updatedAt: input.now,
    };
  }

  markReadyForSubmission(now: Date): void {
    this.transitionTo("READY_FOR_SUBMISSION", now);
  }

  reopenDraft(now: Date): void {
    this.transitionTo("DRAFT", now);
  }

  submit(now: Date): void {
    this.transitionTo("SUBMITTED", now);
  }

  startValidation(now: Date): void {
    this.transitionTo("VALIDATING", now);
  }

  requireCorrection(now: Date): void {
    this.transitionTo("CORRECTION_REQUIRED", now);
  }

  resubmit(now: Date): void {
    this.transitionTo("RESUBMITTED", now);
  }

  requireAuthorization(now: Date): void {
    this.transitionTo("AUTHORIZATION_REQUIRED", now);
  }

  routeToManualReview(now: Date): void {
    this.transitionTo("MANUAL_REVIEW", now);
  }

  reject(now: Date): void {
    this.transitionTo("REJECTED", now);
  }

  approve(now: Date): void {
    this.transitionTo("APPROVED", now);
  }

  schedule(now: Date): void {
    this.transitionTo("SCHEDULED", now);
  }

  startDistribution(now: Date): void {
    this.transitionTo("DISTRIBUTING", now);
  }

  markLive(now: Date): void {
    this.transitionTo("LIVE", now);
  }

  markPartiallyLive(now: Date): void {
    this.transitionTo("PARTIALLY_LIVE", now);
  }

  markDistributionFailed(now: Date): void {
    this.transitionTo("DISTRIBUTION_FAILED", now);
  }

  snapshot(): Readonly<ReleaseProps> {
    return { ...this.props };
  }

  private transitionTo(nextStatus: ReleaseStatus, now: Date): void {
    const allowed = allowedTransitions[this.props.status];
    if (!allowed.includes(nextStatus)) {
      throw new Error("RELEASE_STATE_TRANSITION_INVALID");
    }

    this.props = {
      ...this.props,
      status: nextStatus,
      version: this.props.version + 1,
      updatedAt: now,
    };
  }
}
