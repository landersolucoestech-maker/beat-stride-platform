export interface DemographicBucket { label: string; percentage: string; }
export interface TerritoryMetric { label: string; metricValue: string; }
export interface DemographicsOverview {
  available: boolean;
  age: DemographicBucket[];
  gender: DemographicBucket[];
  countries: TerritoryMetric[];
  cities: TerritoryMetric[];
}

export interface TikTokMetricPoint { date: string; views: string; creations: string; }
export interface TikTokOverview {
  available: boolean;
  views: string | null;
  videoCreations: string | null;
  likes: string | null;
  shares: string | null;
  timeline: TikTokMetricPoint[];
  topTracks: Array<{ recordingId: string; title: string; views: string; creations: string }>;
}

export interface StoreMetric {
  destinationCode: string;
  destinationLabel: string;
  streams: string | null;
  saves: string | null;
  listeners: string | null;
}
export interface StoreComparisonOverview { available: boolean; items: StoreMetric[]; }

export interface ChartEntry {
  id: string;
  chartName: string;
  territoryCode: string | null;
  recordingTitle: string;
  artistName: string;
  position: number;
  previousPosition: number | null;
  observedAt: string;
}
export interface MusicChartsOverview { available: boolean; items: ChartEntry[]; }

export interface TrackerItem {
  id: string;
  label: string;
  resourceType: "RELEASE" | "RECORDING" | "ARTIST_IDENTITY";
  resourceTitle: string;
  metricType: string;
  currentValue: string | null;
  updatedAt: string | null;
  status: "ACTIVE" | "PAUSED" | "ERROR";
}
export interface TrackersOverview { available: boolean; items: TrackerItem[]; }
