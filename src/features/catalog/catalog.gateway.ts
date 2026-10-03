import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type {
  CatalogReleaseListItem,
  CatalogReleaseListResult,
  ReleaseReadinessResult,
  ReleaseSubmissionResult,
} from "./catalog.types";

interface ReleaseApiResponse {
  items: CatalogReleaseListItem[];
}

export interface CatalogGateway {
  listReleases(): Promise<CatalogReleaseListResult>;
  getRelease(releaseId: string): Promise<CatalogReleaseListItem | null>;
  getReadiness(releaseId: string): Promise<ReleaseReadinessResult>;
  submit(releaseId: string, expectedVersion: number): Promise<ReleaseSubmissionResult>;
}

class HttpCatalogGateway implements CatalogGateway {
  async listReleases(): Promise<CatalogReleaseListResult> {
    if (!isApiConfigured()) return { items: [], available: false };

    const response = await apiRequest("/api/v1/catalog/releases");
    const payload = (await response.json()) as ReleaseApiResponse;
    return { items: payload.items, available: true };
  }

  async getRelease(releaseId: string): Promise<CatalogReleaseListItem | null> {
    if (!isApiConfigured()) return null;
    const response = await apiRequest(`/api/v1/catalog/releases/${releaseId}`);
    return (await response.json()) as CatalogReleaseListItem;
  }

  async getReadiness(releaseId: string): Promise<ReleaseReadinessResult> {
    if (!isApiConfigured()) {
      return {
        releaseId,
        status: "DRAFT",
        version: 0,
        ready: false,
        blockers: [],
        available: false,
      };
    }
    const response = await apiRequest(`/api/v1/catalog/releases/${releaseId}/readiness`);
    const payload = (await response.json()) as Omit<ReleaseReadinessResult, "available">;
    return { ...payload, available: true };
  }

  async submit(releaseId: string, expectedVersion: number): Promise<ReleaseSubmissionResult> {
    const response = await apiRequest(`/api/v1/catalog/releases/${releaseId}/submit`, {
      method: "POST",
      body: JSON.stringify({ expectedVersion }),
    });
    return (await response.json()) as ReleaseSubmissionResult;
  }
}

export const catalogGateway: CatalogGateway = new HttpCatalogGateway();
