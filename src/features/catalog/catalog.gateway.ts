import type { CatalogReleaseListItem } from "./catalog.types";

export interface CatalogGateway {
  listReleases(): Promise<CatalogReleaseListItem[]>;
}

class CatalogUnavailableGateway implements CatalogGateway {
  async listReleases(): Promise<CatalogReleaseListItem[]> {
    return [];
  }
}

export const catalogGateway: CatalogGateway = new CatalogUnavailableGateway();
