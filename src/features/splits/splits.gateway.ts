import type { SplitOverview } from "./splits.types";

export interface SplitsGateway {
  getOverview(): Promise<SplitOverview>;
}

class HttpSplitsGateway implements SplitsGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<SplitOverview> {
    if (!this.baseUrl) return { available: false, items: [] };
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/splits`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`SPLITS_OVERVIEW_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as SplitOverview;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const splitsGateway: SplitsGateway = new HttpSplitsGateway(configuredBaseUrl);
