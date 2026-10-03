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
  constructor(private readonly baseUrl: string | null) {}

  async listReleases(): Promise<CatalogReleaseListResult> {
    if (!this.baseUrl) {
      return { items: [], available: false };
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/catalog/releases`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`CATALOG_RELEASES_REQUEST_FAILED:${response.status}`);
    }

    const payload = (await response.json()) as ReleaseApiResponse;
    return { items: payload.items, available: true };
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const catalogGateway: CatalogGateway = new HttpCatalogGateway(configuredBaseUrl);
