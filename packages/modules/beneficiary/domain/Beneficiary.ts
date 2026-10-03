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

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const allowedTransitions: Record<BeneficiaryStatus, readonly BeneficiaryStatus[]> = {
  DRAFT: ["VERIFICATION_REQUIRED", "CLOSED"],
  VERIFICATION_REQUIRED: ["ACTIVE", "SUSPENDED", "CLOSED"],
  ACTIVE: ["SUSPENDED", "VERIFICATION_REQUIRED", "CLOSED"],
  SUSPENDED: ["VERIFICATION_REQUIRED", "ACTIVE", "CLOSED"],
  CLOSED: [],
};

export class Beneficiary {
  private constructor(private props: BeneficiaryProps) {}

  static createDraft(input: Omit<BeneficiaryProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Beneficiary {
    const legalName = input.legalName.trim();
    if (!legalName) throw new Error("BENEFICIARY_LEGAL_NAME_REQUIRED");
    if (!COUNTRY_CODE_PATTERN.test(input.countryCode)) throw new Error("BENEFICIARY_COUNTRY_CODE_INVALID");

    return new Beneficiary({
      ...input,
      legalName,
      status: "DRAFT",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: BeneficiaryProps): Beneficiary {
    return new Beneficiary({ ...props });
  }

  updateDraft(input: { legalName?: string; countryCode?: string; now: Date }): void {
    if (this.props.status !== "DRAFT") throw new Error("BENEFICIARY_NOT_EDITABLE");
    const legalName = input.legalName === undefined ? this.props.legalName : input.legalName.trim();
    const countryCode = input.countryCode ?? this.props.countryCode;
    if (!legalName) throw new Error("BENEFICIARY_LEGAL_NAME_REQUIRED");
    if (!COUNTRY_CODE_PATTERN.test(countryCode)) throw new Error("BENEFICIARY_COUNTRY_CODE_INVALID");
    this.props = { ...this.props, legalName, countryCode, updatedAt: input.now };
  }

  requireVerification(now: Date): void { this.transitionTo("VERIFICATION_REQUIRED", now); }
  activate(now: Date): void { this.transitionTo("ACTIVE", now); }
  suspend(now: Date): void { this.transitionTo("SUSPENDED", now); }
  close(now: Date): void { this.transitionTo("CLOSED", now); }

  isActive(): boolean {
    return this.props.status === "ACTIVE";
  }

  snapshot(): Readonly<BeneficiaryProps> {
    return { ...this.props };
  }

  private transitionTo(next: BeneficiaryStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("BENEFICIARY_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
