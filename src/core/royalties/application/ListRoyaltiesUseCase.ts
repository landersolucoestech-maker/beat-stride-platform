import { UseCase } from "@/core/shared/application/UseCase";
import { RoyaltyRepository } from "../domain/RoyaltyRepository";
import { RoyaltyLineDTO, RoyaltyMapper } from "./RoyaltyMapper";

export class ListRoyaltiesUseCase implements UseCase<void, RoyaltyLineDTO[]> {
  constructor(private readonly repo: RoyaltyRepository) {}
  async execute() {
    const items = await this.repo.findAll();
    return items.map(RoyaltyMapper.toDTO);
  }
}
