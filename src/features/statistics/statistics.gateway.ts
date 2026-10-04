import { apiRequest, isApiConfigured } from "@/lib/api-client";

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
  getDemographics(): Promise<DemographicsOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, age: [], gender: [], countries: [], cities: [] });
    return this.getJson("/api/v1/analytics/demographics");
  }

  getTikTok(): Promise<TikTokOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, views: null, videoCreations: null, likes: null, shares: null, timeline: [], topTracks: [] });
    return this.getJson("/api/v1/analytics/tiktok");
  }

  getStores(): Promise<StoreComparisonOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/stores");
  }

  getCharts(): Promise<MusicChartsOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/charts");
  }

  getTrackers(): Promise<TrackersOverview> {
    if (!isApiConfigured()) return Promise.resolve({ available: false, items: [] });
    return this.getJson("/api/v1/analytics/trackers");
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await apiRequest(path);
    return (await response.json()) as T;
  }
}

export const statisticsGateway: StatisticsGateway = new HttpStatisticsGateway();
