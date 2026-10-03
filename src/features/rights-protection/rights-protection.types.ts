export interface RightsProtectionItem {
  artistIdentityId: string;
  artistName: string;
  representation: {
    status: string;
    validFrom: string | null;
    validUntil: string | null;
  } | null;
  authorityScopes: string[];
  protection: {
    status: string;
    controllerOrganizationId: string | null;
    controlledByActiveOrganization: boolean;
  } | null;
  activeAuthorizations: number;
  activeRightsDeclarations: number;
}

export interface RightsProtectionResult {
  items: RightsProtectionItem[];
  summary: {
    artistCount: number;
    activeRepresentations: number;
    artistsWithAuthority: number;
    protectedArtists: number;
  };
  available: boolean;
}
