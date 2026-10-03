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

const allowedTransitions: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
  PENDING: ["VALIDATING", "REJECTED"],
  VALIDATING: ["CORRECTION_REQUIRED", "APPROVED", "REJECTED"],
  CORRECTION_REQUIRED: ["PENDING", "VALIDATING", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

export class Submission {
  private constructor(private props: SubmissionProps) {}

  static create(input: Omit<SubmissionProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Submission {
    if (!Number.isInteger(input.releaseVersion) || input.releaseVersion < 1) throw new Error("SUBMISSION_RELEASE_VERSION_INVALID");
    if (!input.submittedByActorId.trim()) throw new Error("SUBMISSION_ACTOR_REQUIRED");
    return new Submission({
      ...input,
      submittedByActorId: input.submittedByActorId.trim(),
      status: "PENDING",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: SubmissionProps): Submission {
    return new Submission({ ...props });
  }

  startValidation(now: Date): void { this.transitionTo("VALIDATING", now); }
  requireCorrection(now: Date): void { this.transitionTo("CORRECTION_REQUIRED", now); }
  resubmit(now: Date): void { this.transitionTo("PENDING", now); }
  approve(now: Date): void { this.transitionTo("APPROVED", now); }
  reject(now: Date): void { this.transitionTo("REJECTED", now); }

  snapshot(): Readonly<SubmissionProps> {
    return { ...this.props };
  }

  private transitionTo(next: SubmissionStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("SUBMISSION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
