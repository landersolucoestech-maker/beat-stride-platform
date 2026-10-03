export type RepresentationStatus = "REQUESTED" | "EVIDENCE_PENDING" | "UNDER_REVIEW" | "REJECTED" | "DISPUTED" | "ACTIVE" | "TERMINATION_REQUESTED" | "TRANSITIONING" | "TERMINATED";

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

export class Representation {
  private constructor(private props: RepresentationProps) {}

  static request(id: string, artistIdentityId: string, organizationId: string, now: Date): Representation {
    return new Representation({ id, artistIdentityId, organizationId, status: "REQUESTED", evidenceReference: null, validFrom: null, validUntil: null, createdAt: now, updatedAt: now });
  }

  activate(evidenceReference: string, validFrom: Date, validUntil: Date | null, now: Date): void {
    if (!evidenceReference.trim()) throw new Error("REPRESENTATION_EVIDENCE_REQUIRED");
    if (!["REQUESTED", "EVIDENCE_PENDING", "UNDER_REVIEW"].includes(this.props.status)) throw new Error("REPRESENTATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "ACTIVE", evidenceReference, validFrom, validUntil, updatedAt: now };
  }

  requestTermination(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("REPRESENTATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "TERMINATION_REQUESTED", updatedAt: now };
  }

  snapshot(): Readonly<RepresentationProps> { return { ...this.props }; }
}
