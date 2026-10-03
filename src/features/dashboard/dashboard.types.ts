export type DashboardDataState = "initial" | "loading" | "success" | "empty" | "error" | "refetching";

export interface DashboardRelease {
  id: string;
  title: string;
  artistName: string;
  releaseDate: string;
  statusLabel: string;
  coverUrl?: string;
}

export interface DashboardSummary {
  wallet: {
    availableAmount: string | null;
    currency: string;
  };
  recentReleases: DashboardRelease[];
  streams: {
    total: string | null;
    currentMonth: string | null;
    previousMonth: string | null;
  };
}
