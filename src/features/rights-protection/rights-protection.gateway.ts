import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { RightsProtectionResult } from "./rights-protection.types";

export interface RightsProtectionGateway {
  list(): Promise<RightsProtectionResult>;
}

class HttpRightsProtectionGateway implements RightsProtectionGateway {
  async list(): Promise<RightsProtectionResult> {
    if (!isApiConfigured()) {
      return {
        items: [],
        summary: { artistCount: 0, activeRepresentations: 0, artistsWithAuthority: 0, protectedArtists: 0 },
        available: false,
      };
    }

    const response = await apiRequest("/api/v1/rights-protection");
    const payload = (await response.json()) as Omit<RightsProtectionResult, "available">;
    return { ...payload, available: true };
  }
}

export const rightsProtectionGateway: RightsProtectionGateway = new HttpRightsProtectionGateway();
