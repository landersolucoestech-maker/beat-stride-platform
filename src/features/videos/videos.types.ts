export type VideoAssetStatus = "DRAFT" | "UPLOADING" | "PROCESSING" | "READY_FOR_QC" | "QC_FAILED" | "APPROVED" | "DELIVERING" | "LIVE" | "FAILED";

export interface VideoListItem {
  id: string;
  title: string;
  artistName: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  destinationLabels: string[];
  viewCount: string | null;
  createdAt: string;
  status: VideoAssetStatus;
}

export interface VideoReferenceData {
  available: boolean;
  artistIdentities: Array<{ id: string; displayName: string }>;
  recordingOptions: Array<{ id: string; title: string; artistName: string }>;
  destinationOptions: Array<{ code: string; label: string }>;
  videoTypes: Array<{ code: string; label: string }>;
}

export interface VideoListResult {
  available: boolean;
  items: VideoListItem[];
}

export interface CreateVideoDraftInput {
  title: string;
  description: string;
  artistIdentityId: string;
  videoTypeCode: string;
  destinationCodes: string[];
  recordingId: string | null;
  explicit: boolean;
  videoFile: File;
  thumbnailFile: File | null;
}
