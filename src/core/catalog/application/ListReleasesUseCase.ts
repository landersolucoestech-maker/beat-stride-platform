import { UseCase } from "@/core/shared/application/UseCase";
import { ReleaseRepository } from "../domain/ReleaseRepository";
import { CatalogMapper, ReleaseDTO } from "./CatalogMapper";

export class ListReleasesUseCase implements UseCase<void, ReleaseDTO[]> {
  constructor(private readonly repo: ReleaseRepository) {}

  async execute(): Promise<ReleaseDTO[]> {
    const releases = await this.repo.findAll();
    return releases.map(CatalogMapper.releaseToDTO);
  }
}
