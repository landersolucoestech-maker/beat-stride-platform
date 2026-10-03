import type { CreateVideoDraftInput, VideoListResult, VideoReferenceData } from "./videos.types";

export interface VideosGateway {
  list(): Promise<VideoListResult>;
  getReferenceData(): Promise<VideoReferenceData>;
  createDraft(input: CreateVideoDraftInput): Promise<{ videoId: string; status: "DRAFT" | "UPLOADING" }>;
}

class HttpVideosGateway implements VideosGateway {
  constructor(private readonly baseUrl: string | null) {}

  async list(): Promise<VideoListResult> {
    if (!this.baseUrl) return { available: false, items: [] };
    return this.getJson<VideoListResult>("/api/v1/videos");
  }

  async getReferenceData(): Promise<VideoReferenceData> {
    if (!this.baseUrl) {
      return { available: false, artistIdentities: [], recordingOptions: [], destinationOptions: [], videoTypes: [] };
    }
    return this.getJson<VideoReferenceData>("/api/v1/videos/reference-data");
  }

  async createDraft(input: CreateVideoDraftInput): Promise<{ videoId: string; status: "DRAFT" | "UPLOADING" }> {
    if (!this.baseUrl) throw new Error("VIDEO_API_NOT_CONNECTED");
    const form = new FormData();
    form.set("metadata", JSON.stringify({
      title: input.title,
      description: input.description,
      artistIdentityId: input.artistIdentityId,
      videoTypeCode: input.videoTypeCode,
      destinationCodes: input.destinationCodes,
      recordingId: input.recordingId,
      explicit: input.explicit,
    }));
    form.set("video", input.videoFile);
    if (input.thumbnailFile) form.set("thumbnail", input.thumbnailFile);

    const response = await fetch(this.url("/api/v1/videos"), { method: "POST", credentials: "include", body: form });
    if (!response.ok) throw new Error(`VIDEO_DRAFT_CREATE_FAILED:${response.status}`);
    return (await response.json()) as { videoId: string; status: "DRAFT" | "UPLOADING" };
  }

  private url(path: string): string {
    if (!this.baseUrl) throw new Error("VIDEO_API_NOT_CONNECTED");
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(this.url(path), { credentials: "include", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`VIDEO_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const videosGateway: VideosGateway = new HttpVideosGateway(configuredBaseUrl);
