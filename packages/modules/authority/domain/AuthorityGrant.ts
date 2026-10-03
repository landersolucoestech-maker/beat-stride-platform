export type AuthorityScope = "DISTRIBUTION_SUBMIT" | "RIGHTS_DECLARE" | "PROTECTION_MANAGE" | "DIRECT_AUTHORIZATION_MANAGE" | "TAKEDOWN_REQUEST" | "TRANSFER_MANAGE";
export type AuthorityGrantStatus = "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED" | "DISPUTED";

export interface AuthorityGrantProps {
  id: string;
  artistIdentityId: string;
  organizationId: string;
  resourceType: "ARTIST" | "RELEASE" | "CATALOG";
  resourceId: string;
  scope: AuthorityScope;
  status: AuthorityGrantStatus;
  evidenceReference: string;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthorityGrant {
  private constructor(private readonly props: AuthorityGrantProps) {}

  static create(input: AuthorityGrantProps): AuthorityGrant {
    if (!input.evidenceReference.trim()) throw new Error("AUTHORITY_EVIDENCE_REQUIRED");
    return new AuthorityGrant(input);
  }

  isValidAt(instant: Date): boolean {
    return this.props.status === "ACTIVE" && this.props.validFrom <= instant && (this.props.validUntil === null || this.props.validUntil > instant);
  }

  snapshot(): Readonly<AuthorityGrantProps> { return { ...this.props }; }
}
