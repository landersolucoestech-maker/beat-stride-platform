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

export class Release {
  private constructor(private readonly props: ReleaseProps) {}

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
    return new Release(props);
  }

  snapshot(): Readonly<ReleaseProps> {
    return { ...this.props };
  }
}
