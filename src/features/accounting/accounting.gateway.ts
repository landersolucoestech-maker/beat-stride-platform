import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { AccountingOverview } from "./accounting.types";

export interface AccountingGateway {
  getOverview(): Promise<AccountingOverview>;
}

class HttpAccountingGateway implements AccountingGateway {
  async getOverview(): Promise<AccountingOverview> {
    if (!isApiConfigured()) {
      return {
        available: false,
        ledgerBalanced: null,
        openReconciliationExceptions: null,
        unmatchedRoyaltyLines: null,
        lastClosedPeriod: null,
        recentPostings: [],
      };
    }

    const response = await apiRequest("/api/v1/accounting/overview");
    return (await response.json()) as AccountingOverview;
  }
}

export const accountingGateway: AccountingGateway = new HttpAccountingGateway();
