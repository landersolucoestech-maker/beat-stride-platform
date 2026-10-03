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
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<FinanceOverview> {
    if (!this.baseUrl) return unavailableFinanceOverview;
    return this.getJson<FinanceOverview>("/api/v1/finance/overview");
  }

  async requestPayout(input: { amount: string; currency: string; payoutAccountId: string }): Promise<{ payoutId: string }> {
    if (!this.baseUrl) throw new Error("FINANCE_API_NOT_CONNECTED");
    const response = await fetch(this.url("/api/v1/payouts"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`PAYOUT_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as { payoutId: string };
  }

  async listRoyalties(filters: { period?: string; providerCode?: string }): Promise<RoyaltyListResult> {
    if (!this.baseUrl) return { available: false, items: [], providers: [], periods: [] };
    const params = new URLSearchParams();
    if (filters.period) params.set("period", filters.period);
    if (filters.providerCode) params.set("provider", filters.providerCode);
    const query = params.size > 0 ? `?${params.toString()}` : "";
    return this.getJson<RoyaltyListResult>(`/api/v1/royalties${query}`);
  }

  async getAnalytics(period?: string): Promise<FinancialAnalyticsSummary> {
    if (!this.baseUrl) {
      return { available: false, period: null, currency: null, totalUsage: null, grossAmount: null, netAmount: null, providers: [], periods: [] };
    }
    const query = period ? `?period=${encodeURIComponent(period)}` : "";
    return this.getJson<FinancialAnalyticsSummary>(`/api/v1/finance/analytics${query}`);
  }

  async getStatementImportOptions(): Promise<StatementImportOptions> {
    if (!this.baseUrl) return { available: false, providers: [] };
    return this.getJson<StatementImportOptions>("/api/v1/statements/import-options");
  }

  async importStatement(input: { providerCode: string; file: File }): Promise<StatementImportResult> {
    if (!this.baseUrl) throw new Error("FINANCE_API_NOT_CONNECTED");
    const form = new FormData();
    form.set("providerCode", input.providerCode);
    form.set("file", input.file);
    const response = await fetch(this.url("/api/v1/statements"), {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!response.ok) throw new Error(`STATEMENT_IMPORT_FAILED:${response.status}`);
    return (await response.json()) as StatementImportResult;
  }

  private url(path: string): string {
    if (!this.baseUrl) throw new Error("FINANCE_API_NOT_CONNECTED");
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(this.url(path), {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`FINANCE_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const financeGateway: FinanceGateway = new HttpFinanceGateway(configuredBaseUrl);
