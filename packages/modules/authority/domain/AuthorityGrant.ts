export type AuthorityScope =
  | "DISTRIBUTION_SUBMIT"
  | "RIGHTS_DECLARE"
  | "PROTECTION_MANAGE"
  | "DIRECT_AUTHORIZATION_MANAGE"
  | "TAKEDOWN_REQUEST"
  | "TRANSFER_MANAGE";

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
  private constructor(private props: AuthorityGrantProps) {}

  static create(input: AuthorityGrantProps): AuthorityGrant {
    const evidenceReference = input.evidenceReference.trim();
    if (!evidenceReference) throw new Error("AUTHORITY_EVIDENCE_REQUIRED");
    if (input.validUntil !== null && input.validUntil <= input.validFrom) {
      throw new Error("AUTHORITY_VALIDITY_INVALID");
    }
    return new AuthorityGrant({ ...input, evidenceReference });
  }

  static restore(props: AuthorityGrantProps): AuthorityGrant {
    return new AuthorityGrant({ ...props });
  }

  suspend(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "SUSPENDED", updatedAt: now };
  }

  resume(now: Date): void {
    if (this.props.status !== "SUSPENDED") throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    if (this.props.validUntil !== null && this.props.validUntil <= now) {
      this.props = { ...this.props, status: "EXPIRED", updatedAt: now };
      throw new Error("AUTHORITY_EXPIRED");
    }
    this.props = { ...this.props, status: "ACTIVE", updatedAt: now };
  }

  dispute(now: Date): void {
    if (!["ACTIVE", "SUSPENDED"].includes(this.props.status)) {
      throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "DISPUTED", updatedAt: now };
  }

  resolveDispute(restoreActive: boolean, now: Date): void {
    if (this.props.status !== "DISPUTED") throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    const expired = this.props.validUntil !== null && this.props.validUntil <= now;
    this.props = {
      ...this.props,
      status: expired ? "EXPIRED" : restoreActive ? "ACTIVE" : "SUSPENDED",
      updatedAt: now,
    };
  }

  revoke(now: Date): void {
    if (["REVOKED", "EXPIRED"].includes(this.props.status)) {
      throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "REVOKED", updatedAt: now };
  }

  expire(now: Date): void {
    if (this.props.validUntil === null || this.props.validUntil > now) {
      throw new Error("AUTHORITY_NOT_EXPIRED");
    }
    if (this.props.status === "REVOKED") throw new Error("AUTHORITY_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "EXPIRED", updatedAt: now };
  }

  isValidAt(instant: Date): boolean {
    return (
      this.props.status === "ACTIVE" &&
      this.props.validFrom <= instant &&
      (this.props.validUntil === null || this.props.validUntil > instant)
    );
  }

  permits(scope: AuthorityScope, instant: Date): boolean {
    return this.props.scope === scope && this.isValidAt(instant);
  }

  snapshot(): Readonly<AuthorityGrantProps> {
    return { ...this.props };
  }
}
