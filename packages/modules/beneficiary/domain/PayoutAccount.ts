export type PayoutMethodType = "PIX" | "PAYPAL" | "WISE" | "LOCAL_BANK" | "INTERNATIONAL_BANK";
export type PayoutAccountStatus = "DRAFT" | "VERIFICATION_REQUIRED" | "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface PayoutAccountProps {
  id: string;
  beneficiaryId: string;
  methodType: PayoutMethodType;
  countryCode: string;
  currency: string;
  providerCode: string | null;
  providerAccountReference: string | null;
  status: PayoutAccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const allowedTransitions: Record<PayoutAccountStatus, readonly PayoutAccountStatus[]> = {
  DRAFT: ["VERIFICATION_REQUIRED", "CLOSED"],
  VERIFICATION_REQUIRED: ["ACTIVE", "SUSPENDED", "CLOSED"],
  ACTIVE: ["SUSPENDED", "VERIFICATION_REQUIRED", "CLOSED"],
  SUSPENDED: ["VERIFICATION_REQUIRED", "ACTIVE", "CLOSED"],
  CLOSED: [],
};

export class PayoutAccount {
  private constructor(private props: PayoutAccountProps) {}

  static createDraft(input: Omit<PayoutAccountProps, "status" | "providerCode" | "providerAccountReference" | "createdAt" | "updatedAt"> & { now: Date }): PayoutAccount {
    if (!COUNTRY_CODE_PATTERN.test(input.countryCode)) throw new Error("PAYOUT_ACCOUNT_COUNTRY_INVALID");
    if (!CURRENCY_PATTERN.test(input.currency)) throw new Error("PAYOUT_ACCOUNT_CURRENCY_INVALID");
    return new PayoutAccount({
      ...input,
      status: "DRAFT",
      providerCode: null,
      providerAccountReference: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: PayoutAccountProps): PayoutAccount {
    return new PayoutAccount({ ...props });
  }

  bindProvider(providerCode: string, providerAccountReference: string, now: Date): void {
    if (this.props.status === "CLOSED") throw new Error("PAYOUT_ACCOUNT_CLOSED");
    const code = providerCode.trim();
    const reference = providerAccountReference.trim();
    if (!code || !reference) throw new Error("PAYOUT_ACCOUNT_PROVIDER_REFERENCE_REQUIRED");
    if (this.props.providerAccountReference && this.props.providerAccountReference !== reference) {
      throw new Error("PAYOUT_ACCOUNT_PROVIDER_REFERENCE_IMMUTABLE");
    }
    this.props = { ...this.props, providerCode: code, providerAccountReference: reference, updatedAt: now };
  }

  requireVerification(now: Date): void { this.transitionTo("VERIFICATION_REQUIRED", now); }
  activate(now: Date): void {
    if (!this.props.providerCode || !this.props.providerAccountReference) throw new Error("PAYOUT_ACCOUNT_PROVIDER_REFERENCE_REQUIRED");
    this.transitionTo("ACTIVE", now);
  }
  suspend(now: Date): void { this.transitionTo("SUSPENDED", now); }
  close(now: Date): void { this.transitionTo("CLOSED", now); }

  isUsable(): boolean {
    return this.props.status === "ACTIVE" && this.props.providerCode !== null && this.props.providerAccountReference !== null;
  }

  snapshot(): Readonly<PayoutAccountProps> {
    return { ...this.props };
  }

  private transitionTo(next: PayoutAccountStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("PAYOUT_ACCOUNT_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
