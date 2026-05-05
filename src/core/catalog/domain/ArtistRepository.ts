import { Artist } from "./Artist";

export interface ArtistRepository {
  findAll(): Promise<Artist[]>;
  findById(id: string): Promise<Artist | null>;
  save(artist: Artist): Promise<void>;
}
