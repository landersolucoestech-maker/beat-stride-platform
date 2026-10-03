import type {
  DemographicsOverview,
  MusicChartsOverview,
  StoreComparisonOverview,
  TikTokOverview,
  TrackersOverview,
} from "./statistics.types";

export interface StatisticsGateway {
  getDemographics(): Promise<DemographicsOverview>;
  getTikTok(): Promise<TikTokOverview>;
  getStores(): Promise<StoreComparisonOverview>;
  getCharts(): Promise<MusicChartsOverview>;
  getTrackers(): Promise<TrackersOverview>;
}

class HttpStatisticsGateway implements StatisticsGateway {
  constructor(private readonly baseUrl: string | null) {}

  getDemographics(): Promise<DemographicsOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, age: [], gender: [], countries: [], cities: [] });
    return this.getJson("/api/v1/analytics/demographics");
  }

  getTikTok(): Promise<TikTokOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, views: null, videoCreations: null, likes: null, shares: null, timeline: [], topTracks: [] });
    return this.getJson("/api/v1/analytics/tiktok");
  }

  getStores(): Promise<StoreComparisonOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/stores");
  }

  getCharts(): Promise<MusicChartsOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/charts");
  }

  getTrackers(): Promise<TrackersOverview> {
    if (!this.baseUrl) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/trackers");
  }

  private async getJson<T>(path: string): Promise<T> {
    if (!this.baseUrl) throw new Error("STATISTICS_API_NOT_CONNECTED");
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`STATISTICS_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const statisticsGateway: StatisticsGateway = new HttpStatisticsGateway(configuredBaseUrl);
