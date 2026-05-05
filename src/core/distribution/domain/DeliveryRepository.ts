import { Delivery } from "./Delivery";

export interface DeliveryRepository {
  findAll(): Promise<Delivery[]>;
  findByReleaseId(releaseId: string): Promise<Delivery[]>;
  save(delivery: Delivery): Promise<void>;
}
