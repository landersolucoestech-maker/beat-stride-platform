import type { ArtistIdentity } from "../../domain/ArtistIdentity";

export interface ArtistIdentityRepository {
  insert(identity: ArtistIdentity): Promise<void>;
  findById(id: string): Promise<ArtistIdentity | null>;
  findByCanonicalName(canonicalName: string): Promise<ArtistIdentity[]>;
}
