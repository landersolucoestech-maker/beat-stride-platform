export interface DashboardRelease {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string;
  statusLabel: string;
  coverUrl?: string;
}

export interface DashboardTrackPerformance {
  id: string;
  title: string;
  artistName: string;
  streams: number;
  trendPercent?: number;
}

export interface DashboardArtistPerformance {
  id: string;
  name: string;
  streams: number;
}

export interface DashboardPlaylistPerformance {
  id: string;
  name: string;
  curator: string;
  streams: number;
}

export interface DashboardTerritoryPerformance {
  code: string;
  country: string;
  streams: number;
  mapId?: string;
}

export interface DashboardPlatformPerformance {
  id: string;
  name: string;
  streams: number;
}

export interface DashboardSummary {
  wallet: {
    availableAmount: string | null;
    currency: string;
  };
  recentReleases: DashboardRelease[];
  streams: {
    total: number | null;
    currentMonth: number | null;
    previousMonth: number | null;
  };
  topTracks: DashboardTrackPerformance[];
  topArtists: DashboardArtistPerformance[];
  topPlaylists: DashboardPlaylistPerformance[];
  topTerritories: DashboardTerritoryPerformance[];
  platforms: DashboardPlatformPerformance[];
}
