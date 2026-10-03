export type RepresentationStatus =
  | "REQUESTED"
  | "EVIDENCE_PENDING"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "DISPUTED"
  | "ACTIVE"
  | "TERMINATION_REQUESTED"
  | "TRANSITIONING"
  | "TERMINATED";

export interface RepresentationProps {
  id: string;
  artistIdentityId: string;
  organizationId: string;
  status: RepresentationStatus;
  evidenceReference: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<RepresentationStatus, readonly RepresentationStatus[]> = {
  REQUESTED: ["EVIDENCE_PENDING", "UNDER_REVIEW", "REJECTED"],
  EVIDENCE_PENDING: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ACTIVE", "REJECTED", "DISPUTED"],
  REJECTED: [],
  DISPUTED: ["UNDER_REVIEW", "ACTIVE", "TERMINATION_REQUESTED", "TERMINATED"],
  ACTIVE: ["DISPUTED", "TERMINATION_REQUESTED"],
  TERMINATION_REQUESTED: ["TRANSITIONING", "TERMINATED"],
  TRANSITIONING: ["TERMINATED"],
  TERMINATED: [],
};

export class Representation {
  private constructor(private props: RepresentationProps) {}

  static request(id: string, artistIdentityId: string, organizationId: string, now: Date): Representation {
    return new Representation({
      id,
      artistIdentityId,
      organizationId,
      status: "REQUESTED",
      evidenceReference: null,
      validFrom: null,
      validUntil: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: RepresentationProps): Representation {
    return new Representation({ ...props });
  }

  requireEvidence(now: Date): void {
    this.transitionTo("EVIDENCE_PENDING", now);
  }

  submitEvidence(evidenceReference: string, now: Date): void {
    const reference = evidenceReference.trim();
    if (!reference) throw new Error("REPRESENTATION_EVIDENCE_REQUIRED");
    if (!["REQUESTED", "EVIDENCE_PENDING"].includes(this.props.status)) {
      throw new Error("REPRESENTATION_STATE_TRANSITION_INVALID");
    }

    this.props = {
      ...this.props,
      evidenceReference: reference,
      status: "UNDER_REVIEW",
      updatedAt: now,
    };
  }

  beginReview(now: Date): void {
    if (!this.props.evidenceReference) throw new Error("REPRESENTATION_EVIDENCE_REQUIRED");
    this.transitionTo("UNDER_REVIEW", now);
  }

  activate(validFrom: Date, validUntil: Date | null, now: Date): void {
    if (!this.props.evidenceReference) throw new Error("REPRESENTATION_EVIDENCE_REQUIRED");
    if (validUntil !== null && validUntil <= validFrom) throw new Error("REPRESENTATION_VALIDITY_INVALID");
    this.transitionTo("ACTIVE", now);
    this.props = { ...this.props, validFrom, validUntil, updatedAt: now };
  }

  reject(now: Date): void {
    this.transitionTo("REJECTED", now);
  }

  dispute(now: Date): void {
    this.transitionTo("DISPUTED", now);
  }

  requestTermination(now: Date): void {
    this.transitionTo("TERMINATION_REQUESTED", now);
  }

  beginTransition(now: Date): void {
    this.transitionTo("TRANSITIONING", now);
  }

  terminate(now: Date): void {
    this.transitionTo("TERMINATED", now);
    this.props = { ...this.props, validUntil: this.props.validUntil ?? now, updatedAt: now };
  }

  isActiveAt(instant: Date): boolean {
    return (
      this.props.status === "ACTIVE" &&
      this.props.validFrom !== null &&
      this.props.validFrom <= instant &&
      (this.props.validUntil === null || this.props.validUntil > instant)
    );
  }

  snapshot(): Readonly<RepresentationProps> {
    return { ...this.props };
  }

  private transitionTo(nextStatus: RepresentationStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(nextStatus)) {
      throw new Error("REPRESENTATION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: nextStatus, updatedAt: now };
  }
}
