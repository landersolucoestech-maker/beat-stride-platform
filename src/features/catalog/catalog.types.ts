export type CatalogReleaseStatus =
  | "DRAFT"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED"
  | "VALIDATING"
  | "CORRECTION_REQUIRED"
  | "RESUBMITTED"
  | "AUTHORIZATION_REQUIRED"
  | "MANUAL_REVIEW"
  | "REJECTED"
  | "APPROVED"
  | "SCHEDULED"
  | "DISTRIBUTING"
  | "LIVE"
  | "PARTIALLY_LIVE"
  | "DISTRIBUTION_FAILED";

export interface CatalogReleaseListItem {
  id: string;
  title: string;
  artistName: string;
  type: "SINGLE" | "EP" | "ALBUM";
  releaseDate: string | null;
  coverUrl: string | null;
  status: CatalogReleaseStatus;
}

export interface CatalogReleaseListResult {
  items: CatalogReleaseListItem[];
  available: boolean;
}
