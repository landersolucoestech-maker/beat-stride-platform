import type { Money } from "../../shared/domain/Money";

export type PayoutStatus =
  | "DRAFT"
  | "ELIGIBILITY_CHECK"
  | "INELIGIBLE"
  | "COMPLIANCE_HOLD"
  | "RISK_HOLD"
  | "READY"
  | "REQUESTED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED"
  | "REVERSED";

export interface PayoutProps {
  id: string;
  organizationId: string;
  beneficiaryId: string;
  payoutAccountId: string;
  amount: Money;
  status: PayoutStatus;
  providerCode: string | null;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<PayoutStatus, readonly PayoutStatus[]> = {
  DRAFT: ["ELIGIBILITY_CHECK", "CANCELLED"],
  ELIGIBILITY_CHECK: ["INELIGIBLE", "COMPLIANCE_HOLD", "RISK_HOLD", "READY", "CANCELLED"],
  INELIGIBLE: ["ELIGIBILITY_CHECK", "CANCELLED"],
  COMPLIANCE_HOLD: ["ELIGIBILITY_CHECK", "READY", "CANCELLED"],
  RISK_HOLD: ["ELIGIBILITY_CHECK", "READY", "CANCELLED"],
  READY: ["REQUESTED", "CANCELLED"],
  REQUESTED: ["PROCESSING", "FAILED", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "RETURNED"],
  PAID: ["RETURNED", "REVERSED"],
  FAILED: ["REQUESTED", "CANCELLED"],
  RETURNED: ["REQUESTED", "REVERSED"],
  CANCELLED: [],
  REVERSED: [],
};

export class Payout {
  private constructor(private props: PayoutProps) {}

  static draft(input: Omit<PayoutProps, "status" | "providerCode" | "providerReference" | "createdAt" | "updatedAt"> & { now: Date }): Payout {
    if (!input.amount.isPositive()) throw new Error("PAYOUT_AMOUNT_MUST_BE_POSITIVE");
    if (!input.beneficiaryId.trim()) throw new Error("PAYOUT_BENEFICIARY_REQUIRED");
    if (!input.payoutAccountId.trim()) throw new Error("PAYOUT_ACCOUNT_REQUIRED");

    return new Payout({
      ...input,
      beneficiaryId: input.beneficiaryId.trim(),
      payoutAccountId: input.payoutAccountId.trim(),
      status: "DRAFT",
      providerCode: null,
      providerReference: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: PayoutProps): Payout {
    return new Payout({ ...props });
  }

  beginEligibilityCheck(now: Date): void {
    this.transitionTo("ELIGIBILITY_CHECK", now);
  }

  markIneligible(now: Date): void {
    this.transitionTo("INELIGIBLE", now);
  }

  placeComplianceHold(now: Date): void {
    this.transitionTo("COMPLIANCE_HOLD", now);
  }

  placeRiskHold(now: Date): void {
    this.transitionTo("RISK_HOLD", now);
  }

  markReady(now: Date): void {
    this.transitionTo("READY", now);
  }

  request(now: Date): void {
    this.transitionTo("REQUESTED", now);
  }

  bindProvider(providerCode: string, providerReference: string, now: Date): void {
    if (!["REQUESTED", "PROCESSING", "FAILED", "RETURNED"].includes(this.props.status)) {
      throw new Error("PAYOUT_PROVIDER_BINDING_NOT_ALLOWED");
    }

    const code = providerCode.trim();
    const reference = providerReference.trim();
    if (!code || !reference) throw new Error("PAYOUT_PROVIDER_REFERENCE_REQUIRED");
    if (this.props.providerReference && this.props.providerReference !== reference) {
      throw new Error("PAYOUT_PROVIDER_REFERENCE_IMMUTABLE");
    }

    this.props = {
      ...this.props,
      providerCode: code,
      providerReference: reference,
      updatedAt: now,
    };
  }

  startProcessing(now: Date): void {
    if (!this.props.providerCode || !this.props.providerReference) {
      throw new Error("PAYOUT_PROVIDER_REFERENCE_REQUIRED");
    }
    this.transitionTo("PROCESSING", now);
  }

  markPaid(now: Date): void {
    this.transitionTo("PAID", now);
  }

  markFailed(now: Date): void {
    this.transitionTo("FAILED", now);
  }

  markReturned(now: Date): void {
    this.transitionTo("RETURNED", now);
  }

  cancel(now: Date): void {
    this.transitionTo("CANCELLED", now);
  }

  reverse(now: Date): void {
    this.transitionTo("REVERSED", now);
  }

  snapshot(): Readonly<PayoutProps> {
    return { ...this.props };
  }

  private transitionTo(nextStatus: PayoutStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(nextStatus)) {
      throw new Error("PAYOUT_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: nextStatus, updatedAt: now };
  }
}
