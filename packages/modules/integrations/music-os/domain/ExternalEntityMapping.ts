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
  private constructor(private props: ExternalEntityMappingProps) {}

  static create(props: ExternalEntityMappingProps): ExternalEntityMapping {
    const organizationId = props.organizationId.trim();
    const internalEntityId = props.internalEntityId.trim();
    const externalEntityId = props.externalEntityId.trim();
    if (!organizationId) throw new Error("EXTERNAL_MAPPING_ORGANIZATION_REQUIRED");
    if (!internalEntityId) throw new Error("INTERNAL_ENTITY_ID_REQUIRED");
    if (!externalEntityId) throw new Error("EXTERNAL_ENTITY_ID_REQUIRED");
    return new ExternalEntityMapping({ ...props, organizationId, internalEntityId, externalEntityId });
  }

  static restore(props: ExternalEntityMappingProps): ExternalEntityMapping {
    return new ExternalEntityMapping({ ...props });
  }

  relinkExternalEntity(externalEntityId: string, now: Date): void {
    const value = externalEntityId.trim();
    if (!value) throw new Error("EXTERNAL_ENTITY_ID_REQUIRED");
    if (value === this.props.externalEntityId) return;
    this.props = { ...this.props, externalEntityId: value, updatedAt: now };
  }

  matchesInternal(entityType: ExternalEntityType, internalEntityId: string): boolean {
    return this.props.entityType === entityType && this.props.internalEntityId === internalEntityId;
  }

  snapshot(): Readonly<ExternalEntityMappingProps> {
    return { ...this.props };
  }
}
