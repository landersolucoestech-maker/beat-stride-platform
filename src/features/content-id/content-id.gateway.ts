import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { ContentIdOverview } from "./content-id.types";

export interface ContentIdGateway {
  getOverview(): Promise<ContentIdOverview>;
}

class HttpContentIdGateway implements ContentIdGateway {
  async getOverview(): Promise<ContentIdOverview> {
    if (!isApiConfigured()) return { enrollments: [], allowlist: [], available: false };
    const response = await apiRequest("/api/v1/content-id/overview");
    const payload = (await response.json()) as Omit<ContentIdOverview, "available">;
    return { ...payload, available: true };
  }
}

export const contentIdGateway: ContentIdGateway = new HttpContentIdGateway();
