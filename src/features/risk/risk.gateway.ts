import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { RiskOverview } from "./risk.types";

export interface RiskGateway {
  getOverview(): Promise<RiskOverview>;
}

class HttpRiskGateway implements RiskGateway {
  async getOverview(): Promise<RiskOverview> {
    if (!isApiConfigured()) {
      return { available: false, openCount: null, investigatingCount: null, confirmedCount: null, suspiciousUsageCount: null, alerts: [] };
    }
    const response = await apiRequest("/api/v1/risk/overview");
    return (await response.json()) as RiskOverview;
  }
}

export const riskGateway: RiskGateway = new HttpRiskGateway();
