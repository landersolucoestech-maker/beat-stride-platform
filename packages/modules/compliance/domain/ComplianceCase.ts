export type ComplianceCaseType = "KYC" | "KYB" | "PAYOUT_REVIEW" | "RIGHTS_REVIEW";
export type ComplianceCaseStatus = "PENDING" | "IN_REVIEW" | "ACTION_REQUIRED" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface ComplianceCaseProps {
  id: string;
  organizationId: string;
  beneficiaryId: string | null;
  type: ComplianceCaseType;
  status: ComplianceCaseStatus;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<ComplianceCaseStatus, readonly ComplianceCaseStatus[]> = {
  PENDING: ["IN_REVIEW", "ACTION_REQUIRED", "REJECTED"],
  IN_REVIEW: ["ACTION_REQUIRED", "APPROVED", "REJECTED"],
  ACTION_REQUIRED: ["IN_REVIEW", "REJECTED"],
  APPROVED: ["EXPIRED"],
  REJECTED: [],
  EXPIRED: ["PENDING"],
};

export class ComplianceCase {
  private constructor(private props: ComplianceCaseProps) {}

  static create(input: Omit<ComplianceCaseProps, "status" | "providerReference" | "createdAt" | "updatedAt"> & { now: Date }): ComplianceCase {
    if ((input.type === "KYC" || input.type === "PAYOUT_REVIEW") && !input.beneficiaryId) {
      throw new Error("COMPLIANCE_BENEFICIARY_REQUIRED");
    }
    return new ComplianceCase({ ...input, status: "PENDING", providerReference: null, createdAt: input.now, updatedAt: input.now });
  }

  static restore(props: ComplianceCaseProps): ComplianceCase {
    return new ComplianceCase({ ...props });
  }

  bindProviderReference(providerReference: string, now: Date): void {
    const reference = providerReference.trim();
    if (!reference) throw new Error("COMPLIANCE_PROVIDER_REFERENCE_REQUIRED");
    if (this.props.providerReference && this.props.providerReference !== reference) {
      throw new Error("COMPLIANCE_PROVIDER_REFERENCE_IMMUTABLE");
    }
    this.props = { ...this.props, providerReference: reference, updatedAt: now };
  }

  startReview(now: Date): void { this.transitionTo("IN_REVIEW", now); }
  requireAction(now: Date): void { this.transitionTo("ACTION_REQUIRED", now); }
  approve(now: Date): void { this.transitionTo("APPROVED", now); }
  reject(now: Date): void { this.transitionTo("REJECTED", now); }
  expire(now: Date): void { this.transitionTo("EXPIRED", now); }
  reopen(now: Date): void { this.transitionTo("PENDING", now); }

  isApproved(): boolean {
    return this.props.status === "APPROVED";
  }

  snapshot(): Readonly<ComplianceCaseProps> {
    return { ...this.props };
  }

  private transitionTo(next: ComplianceCaseStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("COMPLIANCE_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
