import type { DashboardSummary } from "./dashboard.types";

export interface DashboardGateway {
  getSummary(): Promise<DashboardSummary>;
}

const unavailableSummary: DashboardSummary = {
  wallet: { availableAmount: null, currency: "BRL" },
  recentReleases: [],
  streams: { total: null, currentMonth: null, previousMonth: null },
  topTracks: [],
  topArtists: [],
  topPlaylists: [],
  topTerritories: [],
  platforms: [],
};

class HttpDashboardGateway implements DashboardGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getSummary(): Promise<DashboardSummary> {
    if (!this.baseUrl) return unavailableSummary;

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/dashboard/summary`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`DASHBOARD_SUMMARY_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as DashboardSummary;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const dashboardGateway: DashboardGateway = new HttpDashboardGateway(configuredBaseUrl);
