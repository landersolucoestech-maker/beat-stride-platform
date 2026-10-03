export type ExternalEntityType = "ORGANIZATION" | "ARTIST_IDENTITY" | "RELEASE" | "TRACK" | "PROJECT";

export interface ExternalEntityMappingProps {
  id: string;
  integrationCode: "MUSIC_OS_360";
  organizationId: string;
  entityType: ExternalEntityType;
  internalEntityId: string;
  externalEntityId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ExternalEntityMapping {
  private constructor(private readonly props: ExternalEntityMappingProps) {}
  static create(props: ExternalEntityMappingProps): ExternalEntityMapping {
    if (!props.externalEntityId.trim()) throw new Error("EXTERNAL_ENTITY_ID_REQUIRED");
    return new ExternalEntityMapping(props);
  }
  snapshot(): Readonly<ExternalEntityMappingProps> { return { ...this.props }; }
}
