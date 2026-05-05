import { Artist } from "../domain/Artist";
import { ArtistRepository } from "../domain/ArtistRepository";

/**
 * Repositório in-memory para o protótipo. Substituível por adapter HTTP/Postgres.
 */
export class InMemoryArtistRepository implements ArtistRepository {
  private items: Map<string, Artist> = new Map();

  async findAll() { return Array.from(this.items.values()); }
  async findById(id: string) { return this.items.get(id) ?? null; }
  async save(artist: Artist) { this.items.set(artist.id.toString(), artist); }
}
