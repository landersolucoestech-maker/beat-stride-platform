import type { RiskOverview } from "./risk.types";

export interface RiskGateway {
  getOverview(): Promise<RiskOverview>;
}

class HttpRiskGateway implements RiskGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<RiskOverview> {
    if (!this.baseUrl) {
      return { available: false, openCount: null, investigatingCount: null, confirmedCount: null, suspiciousUsageCount: null, alerts: [] };
    }
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/risk/overview`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`RISK_OVERVIEW_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as RiskOverview;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const riskGateway: RiskGateway = new HttpRiskGateway(configuredBaseUrl);
