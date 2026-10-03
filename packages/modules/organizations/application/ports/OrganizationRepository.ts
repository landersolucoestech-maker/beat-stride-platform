import type { Organization } from "../../domain/Organization";

export interface OrganizationRepository {
  insert(organization: Organization): Promise<void>;
  findById(id: string): Promise<Organization | null>;
}
