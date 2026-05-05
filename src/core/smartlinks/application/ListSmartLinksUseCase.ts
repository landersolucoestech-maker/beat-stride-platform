import { UseCase } from "@/core/shared/application/UseCase";
import { SmartLinkRepository } from "../domain/SmartLinkRepository";
import { SmartLinkDTO, SmartLinkMapper } from "./SmartLinkMapper";

export class ListSmartLinksUseCase implements UseCase<void, SmartLinkDTO[]> {
  constructor(private readonly repo: SmartLinkRepository) {}
  async execute() {
    return (await this.repo.findAll()).map(SmartLinkMapper.toDTO);
  }
}
