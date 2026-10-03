import { describe, expect, it } from "vitest";

import { LedgerTransaction } from "../../packages/modules/accounting/domain/LedgerTransaction";
import { Money } from "../../packages/modules/shared/domain/Money";

const now = new Date("2026-10-03T12:00:00.000Z");

describe("LedgerTransaction", () => {
  it("accepts an exact balanced double entry transaction", () => {
    const transaction = LedgerTransaction.create({
      id: "tx-1",
      organizationId: "org-1",
      referenceType: "ROYALTY_POSTING",
      referenceId: "royalty-1",
      currency: "BRL",
      entries: [
        { accountId: "receivable", side: "DEBIT", amount: Money.of("10.10", "BRL") },
        { accountId: "payable", side: "CREDIT", amount: Money.of("10.1", "BRL") },
      ],
      occurredAt: now,
      createdAt: now,
    });

    expect(transaction.debitTotal().equals(transaction.creditTotal())).toBe(true);
  });

  it("rejects an unbalanced transaction", () => {
    expect(() => LedgerTransaction.create({
      id: "tx-2",
      organizationId: "org-1",
      referenceType: "ROYALTY_POSTING",
      referenceId: "royalty-2",
      currency: "BRL",
      entries: [
        { accountId: "receivable", side: "DEBIT", amount: Money.of("10", "BRL") },
        { accountId: "payable", side: "CREDIT", amount: Money.of("9.99", "BRL") },
      ],
      occurredAt: now,
      createdAt: now,
    })).toThrow("LEDGER_TRANSACTION_UNBALANCED");
  });
});
