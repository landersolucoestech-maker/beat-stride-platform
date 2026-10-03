import { Money } from "../../shared/domain/Money";

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
    if (props.entries.some((entry) => entry.amount.currency !== props.currency)) {
      throw new Error("LEDGER_CURRENCY_MISMATCH");
    }
    if (props.entries.some((entry) => !entry.accountId.trim())) {
      throw new Error("LEDGER_ACCOUNT_REQUIRED");
    }
    if (props.entries.some((entry) => !entry.amount.isPositive())) {
      throw new Error("LEDGER_ENTRY_AMOUNT_MUST_BE_POSITIVE");
    }

    const debit = props.entries
      .filter((entry) => entry.side === "DEBIT")
      .reduce((total, entry) => total.add(entry.amount), Money.zero(props.currency));

    const credit = props.entries
      .filter((entry) => entry.side === "CREDIT")
      .reduce((total, entry) => total.add(entry.amount), Money.zero(props.currency));

    if (debit.isZero() || credit.isZero()) throw new Error("LEDGER_DOUBLE_ENTRY_REQUIRED");
    if (!debit.equals(credit)) throw new Error("LEDGER_TRANSACTION_UNBALANCED");

    return new LedgerTransaction({
      ...props,
      entries: props.entries.map((entry) => ({ ...entry, accountId: entry.accountId.trim() })),
    });
  }

  debitTotal(): Money {
    return this.props.entries
      .filter((entry) => entry.side === "DEBIT")
      .reduce((total, entry) => total.add(entry.amount), Money.zero(this.props.currency));
  }

  creditTotal(): Money {
    return this.props.entries
      .filter((entry) => entry.side === "CREDIT")
      .reduce((total, entry) => total.add(entry.amount), Money.zero(this.props.currency));
  }

  snapshot(): Readonly<LedgerTransactionProps> {
    return {
      ...this.props,
      entries: this.props.entries.map((entry) => ({ ...entry })),
    };
  }
}
