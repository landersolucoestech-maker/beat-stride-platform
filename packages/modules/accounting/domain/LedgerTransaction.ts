import type { Money } from "../../shared/domain/Money";

export type LedgerSide = "DEBIT" | "CREDIT";

export interface LedgerEntryDraft {
  accountId: string;
  side: LedgerSide;
  amount: Money;
}

export interface LedgerTransactionProps {
  id: string;
  organizationId: string;
  referenceType: string;
  referenceId: string;
  currency: string;
  entries: LedgerEntryDraft[];
  occurredAt: Date;
  createdAt: Date;
}

export class LedgerTransaction {
  private constructor(private readonly props: LedgerTransactionProps) {}

  static create(props: LedgerTransactionProps): LedgerTransaction {
    if (props.entries.length < 2) throw new Error("LEDGER_TRANSACTION_REQUIRES_ENTRIES");
    if (props.entries.some((entry) => entry.amount.currency !== props.currency)) throw new Error("LEDGER_CURRENCY_MISMATCH");
    if (!props.entries.some((entry) => entry.side === "DEBIT") || !props.entries.some((entry) => entry.side === "CREDIT")) throw new Error("LEDGER_DOUBLE_ENTRY_REQUIRED");
    return new LedgerTransaction(props);
  }

  snapshot(): Readonly<LedgerTransactionProps> { return { ...this.props, entries: [...this.props.entries] }; }
}
