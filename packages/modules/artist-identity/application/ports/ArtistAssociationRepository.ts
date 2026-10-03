import type { ArtistAssociation } from "../../domain/ArtistAssociation";

export interface ArtistAssociationRepository {
  insert(association: ArtistAssociation): Promise<void>;
  findActiveByOrganizationAndArtist(organizationId: string, artistIdentityId: string): Promise<ArtistAssociation | null>;
}
