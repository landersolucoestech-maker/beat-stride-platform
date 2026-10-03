import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { ArtistIdentityListResult } from "./artist.types";

interface ArtistIdentityApiResponse {
  items: ArtistIdentityListResult["items"];
}

export interface ArtistIdentityGateway {
  list(): Promise<ArtistIdentityListResult>;
  create(input: { canonicalName: string; kind: "PERSON" | "DUO" | "GROUP" | "PROJECT" }): Promise<ArtistIdentityListResult["items"][number]>;
}

class HttpArtistIdentityGateway implements ArtistIdentityGateway {
  async list(): Promise<ArtistIdentityListResult> {
    if (!isApiConfigured()) return { items: [], available: false };

    const response = await apiRequest("/api/v1/artist-identities");
    const payload = (await response.json()) as ArtistIdentityApiResponse;
    return { items: payload.items, available: true };
  }

  async create(input: { canonicalName: string; kind: "PERSON" | "DUO" | "GROUP" | "PROJECT" }) {
    const response = await apiRequest("/api/v1/artist-identities", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return (await response.json()) as ArtistIdentityListResult["items"][number];
  }
}

export const artistIdentityGateway: ArtistIdentityGateway = new HttpArtistIdentityGateway();
