import { ArtistAssociation } from "../domain/ArtistAssociation";
import { ArtistIdentity, type ArtistIdentityKind } from "../domain/ArtistIdentity";
import type { ArtistAssociationRepository } from "./ports/ArtistAssociationRepository";
import type { ArtistIdentityRepository } from "./ports/ArtistIdentityRepository";

export interface CreateArtistIdentityCommand {
  artistIdentityId: string;
  associationId: string;
  organizationId: string;
  canonicalName: string;
  kind: ArtistIdentityKind;
  now: Date;
}

export class CreateArtistIdentity {
  constructor(
    private readonly identities: ArtistIdentityRepository,
    private readonly associations: ArtistAssociationRepository,
  ) {}

  async execute(command: CreateArtistIdentityCommand): Promise<ArtistIdentity> {
    const identity = ArtistIdentity.create({
      id: command.artistIdentityId,
      canonicalName: command.canonicalName,
      kind: command.kind,
      now: command.now,
    });

    const association = ArtistAssociation.create({
      id: command.associationId,
      organizationId: command.organizationId,
      artistIdentityId: command.artistIdentityId,
      now: command.now,
    });

    await this.identities.insert(identity);
    await this.associations.insert(association);
    return identity;
  }
}
