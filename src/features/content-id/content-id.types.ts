export type ContentIdEnrollmentStatus =
  | "DRAFT"
  | "ELIGIBILITY_CHECK"
  | "INELIGIBLE"
  | "AUTHORIZATION_REQUIRED"
  | "READY"
  | "SUBMITTED"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED"
  | "DEACTIVATION_PENDING"
  | "DEACTIVATED";

export interface ContentIdEnrollmentListItem {
  id: string;
  recordingId: string;
  recordingTitle: string;
  artistName: string;
  status: ContentIdEnrollmentStatus;
  providerCode: string | null;
}

export interface UgcAllowlistListItem {
  id: string;
  recordingId: string;
  recordingTitle: string;
  platformCode: string;
  channelReference: string;
  status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";
}

export interface ContentIdOverview {
  enrollments: ContentIdEnrollmentListItem[];
  allowlist: UgcAllowlistListItem[];
  available: boolean;
}
