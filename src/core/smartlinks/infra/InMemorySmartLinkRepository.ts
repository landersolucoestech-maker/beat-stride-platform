import { SmartLink } from "../domain/SmartLink";
import { SmartLinkRepository } from "../domain/SmartLinkRepository";

export class InMemorySmartLinkRepository implements SmartLinkRepository {
  private items: Map<string, SmartLink> = new Map();
  async findAll() { return Array.from(this.items.values()); }
  async findByReleaseId(id: string) {
    return Array.from(this.items.values()).filter(s => s.releaseId === id);
  }
  async save(s: SmartLink) { this.items.set(s.id.toString(), s); }
}
