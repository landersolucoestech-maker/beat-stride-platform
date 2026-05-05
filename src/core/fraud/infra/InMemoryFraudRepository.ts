import { FraudAlert } from "../domain/FraudAlert";
import { FraudRepository } from "../domain/FraudRepository";

export class InMemoryFraudRepository implements FraudRepository {
  private items: Map<string, FraudAlert> = new Map();
  async findAll() { return Array.from(this.items.values()); }
  async save(a: FraudAlert) { this.items.set(a.id.toString(), a); }
}
