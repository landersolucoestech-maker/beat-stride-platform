export type SubmissionStatus = "PENDING" | "VALIDATING" | "CORRECTION_REQUIRED" | "APPROVED" | "REJECTED";

export interface SubmissionProps {
  id: string;
  organizationId: string;
  releaseId: string;
  releaseVersion: number;
  status: SubmissionStatus;
  submittedByActorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Submission {
  private constructor(private props: SubmissionProps) {}

  static create(input: Omit<SubmissionProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Submission {
    if (input.releaseVersion < 1) throw new Error("SUBMISSION_RELEASE_VERSION_INVALID");
    return new Submission({ ...input, status: "PENDING", createdAt: input.now, updatedAt: input.now });
  }

  startValidation(now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("SUBMISSION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "VALIDATING", updatedAt: now };
  }

  snapshot(): Readonly<SubmissionProps> { return { ...this.props }; }
}
