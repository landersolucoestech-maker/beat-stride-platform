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

const TERRITORY_CODE_PATTERN = /^[A-Z]{2}$/;

export class RightsDeclaration {
  private constructor(private props: RightsDeclarationProps) {}

  static createDraft(input: Omit<RightsDeclarationProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): RightsDeclaration {
    const territories = [...new Set(input.territories.map((value) => value.trim().toUpperCase()).filter(Boolean))];
    if (input.territoryMode === "WORLDWIDE" && territories.length > 0) throw new Error("RIGHTS_WORLDWIDE_TERRITORIES_NOT_ALLOWED");
    if (input.territoryMode !== "WORLDWIDE" && territories.length === 0) throw new Error("RIGHTS_TERRITORIES_REQUIRED");
    if (territories.some((territory) => !TERRITORY_CODE_PATTERN.test(territory))) throw new Error("RIGHTS_TERRITORY_INVALID");
    if (input.validUntil !== null && input.validUntil <= input.validFrom) throw new Error("RIGHTS_VALIDITY_INVALID");
    return new RightsDeclaration({
      ...input,
      territories,
      status: "DRAFT",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: RightsDeclarationProps): RightsDeclaration {
    return new RightsDeclaration({ ...props, territories: [...props.territories] });
  }

  activate(evidenceReference: string, now: Date): void {
    if (this.props.status !== "DRAFT") throw new Error("RIGHTS_STATE_TRANSITION_INVALID");
    const evidence = evidenceReference.trim();
    if (!evidence) throw new Error("RIGHTS_EVIDENCE_REQUIRED");
    this.props = { ...this.props, status: "ACTIVE", evidenceReference: evidence, updatedAt: now };
  }

  dispute(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("RIGHTS_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "DISPUTED", updatedAt: now };
  }

  resolveDispute(restoreActive: boolean, now: Date): void {
    if (this.props.status !== "DISPUTED") throw new Error("RIGHTS_STATE_TRANSITION_INVALID");
    const expired = this.props.validUntil !== null && this.props.validUntil <= now;
    this.props = { ...this.props, status: expired ? "EXPIRED" : restoreActive ? "ACTIVE" : "REVOKED", updatedAt: now };
  }

  revoke(now: Date): void {
    if (!["ACTIVE", "DISPUTED"].includes(this.props.status)) throw new Error("RIGHTS_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REVOKED", updatedAt: now };
  }

  expire(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("RIGHTS_STATE_TRANSITION_INVALID");
    if (this.props.validUntil === null || this.props.validUntil > now) throw new Error("RIGHTS_NOT_EXPIRED");
    this.props = { ...this.props, status: "EXPIRED", updatedAt: now };
  }

  isValidAt(instant: Date): boolean {
    return this.props.status === "ACTIVE" && this.props.validFrom <= instant && (this.props.validUntil === null || this.props.validUntil > instant);
  }

  coversTerritory(territoryCode: string): boolean {
    const territory = territoryCode.trim().toUpperCase();
    if (!TERRITORY_CODE_PATTERN.test(territory)) throw new Error("RIGHTS_TERRITORY_INVALID");
    if (this.props.territoryMode === "WORLDWIDE") return true;
    const listed = this.props.territories.includes(territory);
    return this.props.territoryMode === "INCLUDE" ? listed : !listed;
  }

  snapshot(): Readonly<RightsDeclarationProps> {
    return { ...this.props, territories: [...this.props.territories] };
  }
}
