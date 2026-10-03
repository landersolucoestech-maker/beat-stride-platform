import {
  assertOrganizationClassification,
  type CompanySubtype,
  type OrganizationType,
} from "./OrganizationType";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface OrganizationProps {
  id: string;
  type: OrganizationType;
  companySubtype?: CompanySubtype;
  displayName: string;
  legalName?: string;
  status: OrganizationStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private constructor(private readonly props: OrganizationProps) {}

  static create(input: Omit<OrganizationProps, "status" | "version" | "createdAt" | "updatedAt"> & { now: Date }): Organization {
    assertOrganizationClassification({ type: input.type, companySubtype: input.companySubtype });

    const displayName = input.displayName.trim();
    if (!displayName) throw new Error("ORGANIZATION_DISPLAY_NAME_REQUIRED");

    return new Organization({
      id: input.id,
      type: input.type,
      companySubtype: input.companySubtype,
      displayName,
      legalName: input.legalName?.trim() || undefined,
      status: "ACTIVE",
      version: 1,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: OrganizationProps): Organization {
    assertOrganizationClassification({ type: props.type, companySubtype: props.companySubtype });
    return new Organization(props);
  }

  snapshot(): Readonly<OrganizationProps> {
    return { ...this.props };
  }
}
