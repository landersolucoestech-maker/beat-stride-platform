import { Release } from "../domain/Release";
import { ReleaseRepository } from "../domain/ReleaseRepository";

export class InMemoryReleaseRepository implements ReleaseRepository {
  private items: Map<string, Release> = new Map();

  async findAll() { return Array.from(this.items.values()); }
  async findById(id: string) { return this.items.get(id) ?? null; }
  async findByArtistId(artistId: string) {
    return Array.from(this.items.values()).filter(r => r.artistId === artistId);
  }
  async save(release: Release) { this.items.set(release.id.toString(), release); }
}
