import { Membership } from "../domain/Membership";
import { Organization } from "../domain/Organization";
import type { CompanySubtype, OrganizationType } from "../domain/OrganizationType";
import type { MembershipRepository } from "./ports/MembershipRepository";
import type { OrganizationRepository } from "./ports/OrganizationRepository";
import type { OrganizationUnitOfWork } from "./ports/UnitOfWork";

export interface CreateOrganizationCommand {
  organizationId: string;
  ownerMembershipId: string;
  ownerUserId: string;
  type: OrganizationType;
  companySubtype?: CompanySubtype;
  displayName: string;
  legalName?: string;
  now: Date;
}

export class CreateOrganization {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly memberships: MembershipRepository,
    private readonly unitOfWork: OrganizationUnitOfWork,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<Organization> {
    const organization = Organization.create({
      id: command.organizationId,
      type: command.type,
      companySubtype: command.companySubtype ?? null,
      displayName: command.displayName,
      legalName: command.legalName ?? null,
      now: command.now,
    });

    const ownerMembership = Membership.createActiveOwner({
      id: command.ownerMembershipId,
      organizationId: command.organizationId,
      userId: command.ownerUserId,
      now: command.now,
    });

    await this.unitOfWork.transaction(async () => {
      await this.organizations.insert(organization);
      await this.memberships.insert(ownerMembership);
    });

    return organization;
  }
}
