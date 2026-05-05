import { UseCase } from "@/core/shared/application/UseCase";
import { ArtistRepository } from "../domain/ArtistRepository";
import { ArtistDTO, CatalogMapper } from "./CatalogMapper";

export class ListArtistsUseCase implements UseCase<void, ArtistDTO[]> {
  constructor(private readonly repo: ArtistRepository) {}

  async execute(): Promise<ArtistDTO[]> {
    const artists = await this.repo.findAll();
    return artists.map(CatalogMapper.artistToDTO);
  }
}
