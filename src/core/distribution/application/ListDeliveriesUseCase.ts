import { UseCase } from "@/core/shared/application/UseCase";
import { DeliveryRepository } from "../domain/DeliveryRepository";
import { DeliveryDTO, DistributionMapper } from "./DistributionMapper";

export class ListDeliveriesUseCase implements UseCase<void, DeliveryDTO[]> {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute() {
    const items = await this.repo.findAll();
    return items.map(DistributionMapper.toDTO);
  }
}
