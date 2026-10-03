import type { ArtistIdentityListResult } from "./artist.types";

interface ArtistIdentityApiResponse {
  items: ArtistIdentityListResult["items"];
}

export interface ArtistIdentityGateway {
  list(): Promise<ArtistIdentityListResult>;
}

class HttpArtistIdentityGateway implements ArtistIdentityGateway {
  constructor(private readonly baseUrl: string | null) {}

  async list(): Promise<ArtistIdentityListResult> {
    if (!this.baseUrl) return { items: [], available: false };

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/v1/artist-identities`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`ARTIST_IDENTITIES_REQUEST_FAILED:${response.status}`);
    const payload = (await response.json()) as ArtistIdentityApiResponse;
    return { items: payload.items, available: true };
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const artistIdentityGateway: ArtistIdentityGateway = new HttpArtistIdentityGateway(configuredBaseUrl);
