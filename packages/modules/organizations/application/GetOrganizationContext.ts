import type { MembershipRole } from "../domain/Membership";
import type { MembershipRepository } from "./ports/MembershipRepository";
import type { OrganizationRepository } from "./ports/OrganizationRepository";

export interface OrganizationContext {
  organizationId: string;
  userId: string;
  role: MembershipRole;
  organizationType: "INDEPENDENT_ARTIST" | "COMPANY";
}

export class GetOrganizationContext {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly memberships: MembershipRepository,
  ) {}

  async execute(userId: string, organizationId: string): Promise<OrganizationContext> {
    const membership = await this.memberships.findActiveByUserAndOrganization(userId, organizationId);
    if (!membership || membership.snapshot().status !== "ACTIVE") {
      throw new Error("ORGANIZATION_ACCESS_DENIED");
    }

    const organization = await this.organizations.findById(organizationId);
    if (!organization || organization.snapshot().status !== "ACTIVE") {
      throw new Error("ORGANIZATION_NOT_AVAILABLE");
    }

    return {
      organizationId,
      userId,
      role: membership.snapshot().role,
      organizationType: organization.snapshot().type,
    };
  }
}
