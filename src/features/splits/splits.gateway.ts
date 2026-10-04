import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { SplitOverview } from "./splits.types";

export interface SplitsGateway {
  getOverview(): Promise<SplitOverview>;
}

class HttpSplitsGateway implements SplitsGateway {
  async getOverview(): Promise<SplitOverview> {
    if (!isApiConfigured()) return { available: false, items: [] };
    const response = await apiRequest("/api/v1/splits");
    return (await response.json()) as SplitOverview;
  }
}

export const splitsGateway: SplitsGateway = new HttpSplitsGateway();
