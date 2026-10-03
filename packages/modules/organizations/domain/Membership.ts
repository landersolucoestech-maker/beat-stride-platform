export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";
export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";

export interface MembershipProps {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership {
  private constructor(private readonly props: MembershipProps) {}

  static createActiveOwner(input: Omit<MembershipProps, "role" | "status" | "createdAt" | "updatedAt"> & { now: Date }): Membership {
    return new Membership({
      id: input.id,
      organizationId: input.organizationId,
      userId: input.userId,
      role: "OWNER",
      status: "ACTIVE",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: MembershipProps): Membership {
    return new Membership(props);
  }

  snapshot(): Readonly<MembershipProps> {
    return { ...this.props };
  }
}
