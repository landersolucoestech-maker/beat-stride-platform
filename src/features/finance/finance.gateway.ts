import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  FinanceOverview,
  FinancialAnalyticsSummary,
  RoyaltyListResult,
  StatementImportOptions,
  StatementImportResult,
} from "./finance.types";

const unavailableFinanceOverview: FinanceOverview = {
  available: false,
  wallet: { available: null, pending: null, held: null, lastPayout: null },
  payoutAccounts: [],
  payouts: [],
};

export interface FinanceGateway {
  getOverview(): Promise<FinanceOverview>;
  requestPayout(input: { amount: string; currency: string; payoutAccountId: string }): Promise<{ payoutId: string }>;
  listRoyalties(filters: { period?: string; providerCode?: string }): Promise<RoyaltyListResult>;
  getAnalytics(period?: string): Promise<FinancialAnalyticsSummary>;
  getStatementImportOptions(): Promise<StatementImportOptions>;
  importStatement(input: { providerCode: string; file: File }): Promise<StatementImportResult>;
}

class HttpFinanceGateway implements FinanceGateway {
  async getOverview(): Promise<FinanceOverview> {
    if (!isApiConfigured()) return unavailableFinanceOverview;
    return this.getJson<FinanceOverview>("/api/v1/finance/overview");
  }

  async requestPayout(input: { amount: string; currency: string; payoutAccountId: string }): Promise<{ payoutId: string }> {
    if (!isApiConfigured()) throw new Error("FINANCE_API_NOT_CONNECTED");
    const response = await apiRequest("/api/v1/payouts", { method: "POST", body: JSON.stringify(input) });
    return (await response.json()) as { payoutId: string };
  }

  async listRoyalties(filters: { period?: string; providerCode?: string }): Promise<RoyaltyListResult> {
    if (!isApiConfigured()) return { available: false, items: [], providers: [], periods: [] };
    const params = new URLSearchParams();
    if (filters.period) params.set("period", filters.period);
    if (filters.providerCode) params.set("provider", filters.providerCode);
    const query = params.size > 0 ? `?${params.toString()}` : "";
    return this.getJson<RoyaltyListResult>(`/api/v1/royalties${query}`);
  }

  async getAnalytics(period?: string): Promise<FinancialAnalyticsSummary> {
    if (!isApiConfigured()) {
      return { available: false, period: null, currency: null, totalUsage: null, grossAmount: null, netAmount: null, providers: [], periods: [] };
    }
    const query = period ? `?period=${encodeURIComponent(period)}` : "";
    return this.getJson<FinancialAnalyticsSummary>(`/api/v1/finance/analytics${query}`);
  }

  async getStatementImportOptions(): Promise<StatementImportOptions> {
    if (!isApiConfigured()) return { available: false, providers: [] };
    return this.getJson<StatementImportOptions>("/api/v1/statements/import-options");
  }

  async importStatement(input: { providerCode: string; file: File }): Promise<StatementImportResult> {
    if (!isApiConfigured()) throw new Error("FINANCE_API_NOT_CONNECTED");
    const form = new FormData();
    form.set("providerCode", input.providerCode);
    form.set("file", input.file);
    const response = await apiRequest("/api/v1/statements", { method: "POST", body: form });
    return (await response.json()) as StatementImportResult;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await apiRequest(path);
    return (await response.json()) as T;
  }
}

export const financeGateway: FinanceGateway = new HttpFinanceGateway();
