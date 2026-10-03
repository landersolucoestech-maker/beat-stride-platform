export type CatalogReleaseStatus = "draft" | "review" | "scheduled" | "live" | "rejected" | "correction_required";

export interface CatalogReleaseListItem {
  id: string;
  title: string;
  artistName: string;
  type: "single" | "ep" | "album";
  status: CatalogReleaseStatus;
  releaseDate: string | null;
  coverUrl?: string;
}
