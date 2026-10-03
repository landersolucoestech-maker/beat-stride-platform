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

export class ComplianceCase {
  private constructor(private readonly props: ComplianceCaseProps) {}
  static create(input: Omit<ComplianceCaseProps, "status" | "providerReference" | "createdAt" | "updatedAt"> & { now: Date }): ComplianceCase {
    return new ComplianceCase({ ...input, status: "PENDING", providerReference: null, createdAt: input.now, updatedAt: input.now });
  }
  snapshot(): Readonly<ComplianceCaseProps> { return { ...this.props }; }
}
