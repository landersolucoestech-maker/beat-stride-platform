import { RoyaltyLine } from "../domain/RoyaltyLine";
import { RoyaltyRepository } from "../domain/RoyaltyRepository";

export class InMemoryRoyaltyRepository implements RoyaltyRepository {
  private items: RoyaltyLine[] = [];
  async findAll() { return [...this.items]; }
  async findByPeriod(period: string) { return this.items.filter(l => l.period === period); }
  async saveBatch(lines: RoyaltyLine[]) { this.items.push(...lines); }
}
