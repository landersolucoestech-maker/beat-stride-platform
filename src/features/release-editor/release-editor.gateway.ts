import type {
  CreateReleaseDraftInput,
  CreateReleaseDraftResult,
  ReleaseEditorReferenceData,
} from "./release-editor.types";

export interface ReleaseEditorGateway {
  getReferenceData(): Promise<ReleaseEditorReferenceData>;
  createDraft(input: CreateReleaseDraftInput): Promise<CreateReleaseDraftResult>;
}

class HttpReleaseEditorGateway implements ReleaseEditorGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getReferenceData(): Promise<ReleaseEditorReferenceData> {
    if (!this.baseUrl) return { artistIdentities: [], available: false };

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/artist-identities`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`ARTIST_IDENTITIES_REQUEST_FAILED:${response.status}`);

    const payload = (await response.json()) as { items: Array<{ id: string; displayName: string }> };
    return { artistIdentities: payload.items, available: true };
  }

  async createDraft(input: CreateReleaseDraftInput): Promise<CreateReleaseDraftResult> {
    if (!this.baseUrl) throw new Error("RELEASE_API_NOT_CONNECTED");

    const formData = new FormData();
    formData.set(
      "release",
      JSON.stringify({
        title: input.title,
        artistIdentityId: input.artistIdentityId,
        type: input.type,
        releaseDate: input.releaseDate,
        primaryGenre: input.primaryGenre,
        explicit: input.explicit,
        tracks: input.tracks.map(({ id, title, explicit }) => ({ id, title, explicit })),
        splits: input.splits,
      }),
    );

    if (input.coverFile) formData.set("cover", input.coverFile);
    for (const track of input.tracks) {
      if (track.audioFile) formData.append(`track:${track.id}`, track.audioFile);
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/catalog/releases`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) throw new Error(`RELEASE_DRAFT_CREATE_FAILED:${response.status}`);
    return (await response.json()) as CreateReleaseDraftResult;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const releaseEditorGateway: ReleaseEditorGateway = new HttpReleaseEditorGateway(configuredBaseUrl);
