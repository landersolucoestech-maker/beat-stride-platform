export type RightsScope = "MASTER_DISTRIBUTION" | "MASTER_EXPLOITATION";
export type RightsDeclarationStatus = "DRAFT" | "ACTIVE" | "DISPUTED" | "REVOKED" | "EXPIRED";

export interface RightsDeclarationProps {
  id: string;
  organizationId: string;
  artistIdentityId: string | null;
  resourceType: "RELEASE" | "RECORDING";
  resourceId: string;
  scope: RightsScope;
  status: RightsDeclarationStatus;
  territoryMode: "WORLDWIDE" | "INCLUDE" | "EXCLUDE";
  territories: string[];
  evidenceReference: string | null;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RightsDeclaration {
  private constructor(private readonly props: RightsDeclarationProps) {}

  static createDraft(input: Omit<RightsDeclarationProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): RightsDeclaration {
    if (input.territoryMode !== "WORLDWIDE" && input.territories.length === 0) throw new Error("RIGHTS_TERRITORIES_REQUIRED");
    return new RightsDeclaration({ ...input, status: "DRAFT", createdAt: input.now, updatedAt: input.now });
  }

  snapshot(): Readonly<RightsDeclarationProps> { return { ...this.props, territories: [...this.props.territories] }; }
}
