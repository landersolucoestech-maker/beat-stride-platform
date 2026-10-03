export type BeneficiaryType = "INDIVIDUAL" | "COMPANY";
export type BeneficiaryStatus = "DRAFT" | "VERIFICATION_REQUIRED" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface BeneficiaryProps {
  id: string;
  organizationId: string;
  type: BeneficiaryType;
  legalName: string;
  countryCode: string;
  status: BeneficiaryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Beneficiary {
  private constructor(private readonly props: BeneficiaryProps) {}
  static createDraft(input: Omit<BeneficiaryProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Beneficiary {
    if (!input.legalName.trim()) throw new Error("BENEFICIARY_LEGAL_NAME_REQUIRED");
    return new Beneficiary({ ...input, status: "DRAFT", createdAt: input.now, updatedAt: input.now });
  }
  snapshot(): Readonly<BeneficiaryProps> { return { ...this.props }; }
}
