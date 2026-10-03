export type ArtistIdentityKind = "PERSON" | "DUO" | "GROUP" | "PROJECT";
export type ArtistIdentityStatus = "ACTIVE" | "INACTIVE";

export interface ArtistIdentityProps {
  id: string;
  canonicalName: string;
  kind: ArtistIdentityKind;
  status: ArtistIdentityStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ArtistIdentity {
  private constructor(private readonly props: ArtistIdentityProps) {}

  static create(input: Omit<ArtistIdentityProps, "status" | "version" | "createdAt" | "updatedAt"> & { now: Date }): ArtistIdentity {
    const canonicalName = input.canonicalName.trim();
    if (!canonicalName) throw new Error("ARTIST_IDENTITY_NAME_REQUIRED");

    return new ArtistIdentity({
      id: input.id,
      canonicalName,
      kind: input.kind,
      status: "ACTIVE",
      version: 1,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: ArtistIdentityProps): ArtistIdentity {
    return new ArtistIdentity(props);
  }

  snapshot(): Readonly<ArtistIdentityProps> {
    return { ...this.props };
  }
}
