import { Release, type ReleaseType } from "../domain/Release";
import type { CatalogRepository } from "./ports/CatalogRepository";

export interface CreateDraftReleaseCommand {
  id: string;
  organizationId: string;
  title: string;
  type: ReleaseType;
  now: Date;
}

export class CreateDraftRelease {
  constructor(private readonly catalog: CatalogRepository) {}

  async execute(command: CreateDraftReleaseCommand): Promise<Release> {
    const release = Release.createDraft(command);
    await this.catalog.insertRelease(release);
    return release;
  }
}
