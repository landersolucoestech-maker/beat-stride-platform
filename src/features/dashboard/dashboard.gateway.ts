import { apiRequest, isApiConfigured } from "@/lib/api-client";

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
  async getSummary(): Promise<DashboardSummary> {
    if (!isApiConfigured()) return unavailableSummary;
    const response = await apiRequest("/api/v1/dashboard/summary");
    return (await response.json()) as DashboardSummary;
  }
}

export const dashboardGateway: DashboardGateway = new HttpDashboardGateway();
