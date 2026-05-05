import { Delivery } from "../domain/Delivery";
import { DeliveryRepository } from "../domain/DeliveryRepository";

export class InMemoryDeliveryRepository implements DeliveryRepository {
  private items: Map<string, Delivery> = new Map();
  async findAll() { return Array.from(this.items.values()); }
  async findByReleaseId(releaseId: string) {
    return Array.from(this.items.values()).filter(d => d.releaseId === releaseId);
  }
  async save(d: Delivery) { this.items.set(d.id.toString(), d); }
}
