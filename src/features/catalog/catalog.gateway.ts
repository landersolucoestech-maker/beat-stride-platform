import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { CatalogReleaseListItem, CatalogReleaseListResult } from "./catalog.types";

interface ReleaseApiResponse {
  items: Array<{
    id: string;
    title: string;
    artistName: string;
    type: CatalogReleaseListItem["type"];
    releaseDate: string | null;
    coverUrl: string | null;
    status: CatalogReleaseListItem["status"];
  }>;
}

export interface CatalogGateway {
  listReleases(): Promise<CatalogReleaseListResult>;
}

class HttpCatalogGateway implements CatalogGateway {
  async listReleases(): Promise<CatalogReleaseListResult> {
    if (!isApiConfigured()) return { items: [], available: false };

    const response = await apiRequest("/api/v1/catalog/releases");
    const payload = (await response.json()) as ReleaseApiResponse;
    return { items: payload.items, available: true };
  }
}

export const catalogGateway: CatalogGateway = new HttpCatalogGateway();
