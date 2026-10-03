import type { Membership } from "../../domain/Membership";

export interface MembershipRepository {
  insert(membership: Membership): Promise<void>;
  findActiveByUserAndOrganization(userId: string, organizationId: string): Promise<Membership | null>;
}
