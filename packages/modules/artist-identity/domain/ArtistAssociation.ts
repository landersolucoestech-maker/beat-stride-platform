export type ArtistAssociationStatus = "ACTIVE" | "INACTIVE";

export interface ArtistAssociationProps {
  id: string;
  organizationId: string;
  artistIdentityId: string;
  status: ArtistAssociationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ArtistAssociation {
  private constructor(private readonly props: ArtistAssociationProps) {}

  static create(input: Omit<ArtistAssociationProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): ArtistAssociation {
    return new ArtistAssociation({
      id: input.id,
      organizationId: input.organizationId,
      artistIdentityId: input.artistIdentityId,
      status: "ACTIVE",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: ArtistAssociationProps): ArtistAssociation {
    return new ArtistAssociation(props);
  }

  snapshot(): Readonly<ArtistAssociationProps> {
    return { ...this.props };
  }
}
