import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { CreateReleaseDraftInput, CreateReleaseDraftResult, ReleaseEditorReferenceData } from "./release-editor.types";

export interface ReleaseEditorGateway {
  getReferenceData(): Promise<ReleaseEditorReferenceData>;
  createDraft(input: CreateReleaseDraftInput): Promise<CreateReleaseDraftResult>;
}

class HttpReleaseEditorGateway implements ReleaseEditorGateway {
  async getReferenceData(): Promise<ReleaseEditorReferenceData> {
    if (!isApiConfigured()) return { artistIdentities: [], available: false };

    const response = await apiRequest("/api/v1/artist-identities");
    const payload = (await response.json()) as { items: Array<{ id: string; displayName: string }> };
    return { artistIdentities: payload.items, available: true };
  }

  async createDraft(input: CreateReleaseDraftInput): Promise<CreateReleaseDraftResult> {
    if (!isApiConfigured()) throw new Error("RELEASE_API_NOT_CONNECTED");

    const pendingTrackAssets = input.tracks.flatMap((track, trackIndex) =>
      track.audioFile
        ? [{
            trackIndex,
            fileName: track.audioFile.name,
            contentType: track.audioFile.type || "application/octet-stream",
            byteSize: track.audioFile.size,
          }]
        : [],
    );

    const response = await apiRequest("/api/v1/catalog/releases", {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        type: input.type,
        primaryArtistIdentityId: input.artistIdentityId,
        releaseDate: input.releaseDate,
        primaryGenre: input.primaryGenre,
        explicit: input.explicit,
        tracks: input.tracks.map((track) => ({ title: track.title, explicit: track.explicit })),
        pendingAssets: {
          artwork: input.coverFile
            ? {
                fileName: input.coverFile.name,
                contentType: input.coverFile.type || "application/octet-stream",
                byteSize: input.coverFile.size,
              }
            : null,
          tracks: pendingTrackAssets,
        },
      }),
    });

    const payload = (await response.json()) as { id: string; status: "DRAFT" };
    return { releaseId: payload.id, status: payload.status };
  }
}

export const releaseEditorGateway: ReleaseEditorGateway = new HttpReleaseEditorGateway();
