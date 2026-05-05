import { Release } from "./Release";

export interface ReleaseRepository {
  findAll(): Promise<Release[]>;
  findById(id: string): Promise<Release | null>;
  findByArtistId(artistId: string): Promise<Release[]>;
  save(release: Release): Promise<void>;
}
