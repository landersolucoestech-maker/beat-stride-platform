export interface LedgerPostingView {
  id: string;
  occurredAt: string;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: string;
  currency: string;
}

export interface AccountingOverview {
  available: boolean;
  ledgerBalanced: boolean | null;
  openReconciliationExceptions: number | null;
  unmatchedRoyaltyLines: number | null;
  lastClosedPeriod: string | null;
  recentPostings: LedgerPostingView[];
}
