import type { DashboardSummary } from "./dashboard.types";

export interface DashboardGateway {
  getSummary(): Promise<DashboardSummary>;
}

export class DashboardUnavailableGateway implements DashboardGateway {
  async getSummary(): Promise<DashboardSummary> {
    return {
      wallet: {
        availableAmount: null,
        currency: "BRL",
      },
      recentReleases: [],
      streams: {
        total: null,
        currentMonth: null,
        previousMonth: null,
      },
    };
  }
}

export const dashboardGateway: DashboardGateway = new DashboardUnavailableGateway();
