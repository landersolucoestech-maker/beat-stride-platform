import type { ContentIdOverview } from "./content-id.types";

export interface ContentIdGateway {
  getOverview(): Promise<ContentIdOverview>;
}

class HttpContentIdGateway implements ContentIdGateway {
  constructor(private readonly baseUrl: string | null) {}

  async getOverview(): Promise<ContentIdOverview> {
    if (!this.baseUrl) return { enrollments: [], allowlist: [], available: false };

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/content-id/overview`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`CONTENT_ID_OVERVIEW_REQUEST_FAILED:${response.status}`);
    const payload = (await response.json()) as Omit<ContentIdOverview, "available">;
    return { ...payload, available: true };
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const contentIdGateway: ContentIdGateway = new HttpContentIdGateway(configuredBaseUrl);
