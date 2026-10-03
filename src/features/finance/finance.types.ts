export interface MoneyView {
  amount: string;
  currency: string;
}

export interface WalletOverview {
  available: MoneyView | null;
  pending: MoneyView | null;
  held: MoneyView | null;
  lastPayout: {
    amount: MoneyView;
    completedAt: string;
  } | null;
}

export interface PayoutAccountOption {
  id: string;
  label: string;
  currency: string;
  eligible: boolean;
  ineligibilityReason: string | null;
}

export type PayoutStatus = "REQUESTED" | "REVIEWING" | "APPROVED" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REVERSED";

export interface PayoutListItem {
  id: string;
  beneficiaryName: string;
  amount: MoneyView;
  payoutAccountLabel: string;
  status: PayoutStatus;
  requestedAt: string;
  completedAt: string | null;
}

export interface FinanceOverview {
  available: boolean;
  wallet: WalletOverview;
  payoutAccounts: PayoutAccountOption[];
  payouts: PayoutListItem[];
}

export interface RoyaltyLineView {
  id: string;
  period: string;
  trackTitle: string;
  providerLabel: string;
  territoryCode: string | null;
  usageCount: string | null;
  grossAmount: MoneyView;
  netAmount: MoneyView | null;
  matched: boolean;
}

export interface RoyaltyListResult {
  available: boolean;
  items: RoyaltyLineView[];
  providers: Array<{ code: string; label: string }>;
  periods: string[];
}

export interface FinancialAnalyticsSummary {
  available: boolean;
  period: string | null;
  currency: string | null;
  totalUsage: string | null;
  grossAmount: string | null;
  netAmount: string | null;
  providers: Array<{
    code: string;
    label: string;
    usageCount: string;
    grossAmount: string;
    netAmount: string;
  }>;
  periods: string[];
}

export interface StatementImportOptions {
  available: boolean;
  providers: Array<{ code: string; label: string; acceptedFileTypes: string[] }>;
}

export interface StatementImportResult {
  statementId: string;
  status: "RECEIVED" | "PARSING";
}
