export type DistributionChangeRequestType = "UPDATE" | "TAKEDOWN";
export type DistributionChangeRequestStatus = "REQUESTED" | "VALIDATING" | "APPROVED" | "SENT" | "COMPLETED" | "REJECTED" | "FAILED";

export interface DistributionChangeRequestProps {
  id: string;
  organizationId: string;
  releaseId: string;
  deliveryId: string;
  requestType: DistributionChangeRequestType;
  status: DistributionChangeRequestStatus;
  reason: string;
  requestedByActorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<DistributionChangeRequestStatus, readonly DistributionChangeRequestStatus[]> = {
  REQUESTED: ["VALIDATING", "REJECTED"],
  VALIDATING: ["APPROVED", "REJECTED", "FAILED"],
  APPROVED: ["SENT", "FAILED"],
  SENT: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  REJECTED: [],
  FAILED: ["VALIDATING", "SENT"],
};

export class DistributionChangeRequest {
  private constructor(private props: DistributionChangeRequestProps) {}

  static request(input: Omit<DistributionChangeRequestProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): DistributionChangeRequest {
    const reason = input.reason.trim();
    const requestedByActorId = input.requestedByActorId.trim();
    if (!reason) throw new Error("DISTRIBUTION_CHANGE_REASON_REQUIRED");
    if (!requestedByActorId) throw new Error("DISTRIBUTION_CHANGE_ACTOR_REQUIRED");
    return new DistributionChangeRequest({
      ...input,
      reason,
      requestedByActorId,
      status: "REQUESTED",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: DistributionChangeRequestProps): DistributionChangeRequest {
    return new DistributionChangeRequest({ ...props });
  }

  startValidation(now: Date): void { this.transitionTo("VALIDATING", now); }
  approve(now: Date): void { this.transitionTo("APPROVED", now); }
  markSent(now: Date): void { this.transitionTo("SENT", now); }
  complete(now: Date): void { this.transitionTo("COMPLETED", now); }
  reject(now: Date): void { this.transitionTo("REJECTED", now); }
  fail(now: Date): void { this.transitionTo("FAILED", now); }

  snapshot(): Readonly<DistributionChangeRequestProps> {
    return { ...this.props };
  }

  private transitionTo(next: DistributionChangeRequestStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("DISTRIBUTION_CHANGE_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
