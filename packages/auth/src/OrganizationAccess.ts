import type { AuthenticatedPrincipal } from "./AuthenticationProvider";

export interface OrganizationMembershipAccess {
  organizationId: string;
  membershipId: string;
  membershipStatus: "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";
  roleKeys: string[];
}

export interface OrganizationAccessRepository {
  listActiveMemberships(userId: string): Promise<OrganizationMembershipAccess[]>;
  findActiveMembership(userId: string, organizationId: string): Promise<OrganizationMembershipAccess | null>;
}

export async function requireOrganizationAccess(input: {
  principal: AuthenticatedPrincipal;
  organizationId: string;
  repository: OrganizationAccessRepository;
}): Promise<OrganizationMembershipAccess> {
  const membership = await input.repository.findActiveMembership(input.principal.userId, input.organizationId);
  if (!membership || membership.membershipStatus !== "ACTIVE") {
    throw new Error("ORGANIZATION_ACCESS_DENIED");
  }
  return membership;
}
