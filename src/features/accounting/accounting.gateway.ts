import type { AccountingOverview } from "./accounting.types";

export interface AccountingGateway {
  getOverview(): Promise<AccountingOverview>;
}

class HttpAccountingGateway implements AccountingGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<AccountingOverview> {
    if (!this.baseUrl) {
      return {
        available: false,
        ledgerBalanced: null,
        openReconciliationExceptions: null,
        unmatchedRoyaltyLines: null,
        lastClosedPeriod: null,
        recentPostings: [],
      };
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/accounting/overview`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`ACCOUNTING_OVERVIEW_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as AccountingOverview;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const accountingGateway: AccountingGateway = new HttpAccountingGateway(configuredBaseUrl);
