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

export interface ReleaseReadinessBlocker {
  code: string;
  message: string;
}

export interface ReleaseReadinessResult {
  releaseId: string;
  status: CatalogReleaseStatus;
  version: number;
  ready: boolean;
  blockers: ReleaseReadinessBlocker[];
  available: boolean;
}

export interface ReleaseSubmissionResult {
  releaseId: string;
  submissionId: string;
  qcReviewId: string;
  status: "SUBMITTED";
  version: number;
}
