import type { Money } from "../../shared/domain/Money";

export type PayoutStatus = "DRAFT" | "ELIGIBILITY_CHECK" | "INELIGIBLE" | "COMPLIANCE_HOLD" | "RISK_HOLD" | "READY" | "REQUESTED" | "PROCESSING" | "PAID" | "FAILED" | "RETURNED" | "CANCELLED" | "REVERSED";

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

export class Payout {
  private constructor(private props: PayoutProps) {}
  static draft(input: Omit<PayoutProps, "status" | "providerCode" | "providerReference" | "createdAt" | "updatedAt"> & { now: Date }): Payout {
    return new Payout({ ...input, status: "DRAFT", providerCode: null, providerReference: null, createdAt: input.now, updatedAt: input.now });
  }
  moveTo(status: PayoutStatus, now: Date): void {
    if (this.props.status === "REVERSED" || this.props.status === "CANCELLED") throw new Error("PAYOUT_TERMINAL_STATE");
    this.props = { ...this.props, status, updatedAt: now };
  }
  snapshot(): Readonly<PayoutProps> { return { ...this.props }; }
}
