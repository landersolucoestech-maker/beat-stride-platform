import { describe, expect, it } from "vitest";

import { Payout } from "../../packages/modules/payouts/domain/Payout";
import { Money } from "../../packages/modules/shared/domain/Money";

const now = new Date("2026-10-03T12:00:00.000Z");

function draftPayout() {
  return Payout.draft({
    id: "payout-1",
    organizationId: "org-1",
    beneficiaryId: "beneficiary-1",
    payoutAccountId: "account-1",
    amount: Money.of("100", "BRL"),
    now,
  });
}

describe("Payout", () => {
  it("requires provider binding before processing", () => {
    const payout = draftPayout();
    payout.beginEligibilityCheck(now);
    payout.markReady(now);
    payout.request(now);

    expect(() => payout.startProcessing(now)).toThrow("PAYOUT_PROVIDER_REFERENCE_REQUIRED");
  });

  it("reaches paid only through the approved lifecycle", () => {
    const payout = draftPayout();
    payout.beginEligibilityCheck(now);
    payout.markReady(now);
    payout.request(now);
    payout.bindProvider("payment-provider", "provider-ref-1", now);
    payout.startProcessing(now);
    payout.markPaid(now);

    expect(payout.snapshot().status).toBe("PAID");
  });
});
