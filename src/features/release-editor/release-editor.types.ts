export interface ArtistIdentityOption {
  id: string;
  displayName: string;
}

export interface ReleaseEditorReferenceData {
  artistIdentities: ArtistIdentityOption[];
  available: boolean;
}

export interface ReleaseTrackDraftInput {
  id: string;
  title: string;
  explicit: boolean;
  audioFile: File | null;
}

export interface CreateReleaseDraftInput {
  title: string;
  artistIdentityId: string;
  type: "SINGLE" | "EP" | "ALBUM";
  releaseDate: string;
  primaryGenre: string;
  explicit: boolean;
  coverFile: File | null;
  tracks: ReleaseTrackDraftInput[];
}

export interface CreateReleaseDraftResult {
  releaseId: string;
  status: "DRAFT";
}
