export type OrganizationType = "INDEPENDENT_ARTIST" | "COMPANY";

export type CompanySubtype =
  | "LABEL"
  | "PRODUCER"
  | "PUBLISHER"
  | "MANAGEMENT"
  | "AGENCY"
  | "OTHER";

export interface OrganizationClassification {
  type: OrganizationType;
  companySubtype?: CompanySubtype;
}

export function assertOrganizationClassification(classification: OrganizationClassification): void {
  if (classification.type === "INDEPENDENT_ARTIST" && classification.companySubtype) {
    throw new Error("INDEPENDENT_ARTIST_CANNOT_HAVE_COMPANY_SUBTYPE");
  }

  if (classification.type === "COMPANY" && !classification.companySubtype) {
    throw new Error("COMPANY_SUBTYPE_REQUIRED");
  }
}
