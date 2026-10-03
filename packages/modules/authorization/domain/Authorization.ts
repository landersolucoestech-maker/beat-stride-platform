export type AuthorizationType = "ONE_TIME" | "RELEASE" | "CATALOG" | "DIRECT";
export type AuthorizationStatus = "PENDING" | "ACTIVE" | "REJECTED" | "REVOKED" | "EXPIRED";

export interface AuthorizationProps {
  id: string;
  artistIdentityId: string;
  grantorOrganizationId: string;
  granteeOrganizationId: string;
  type: AuthorizationType;
  resourceId: string | null;
  status: AuthorizationStatus;
  scope: string[];
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Authorization {
  private constructor(private props: AuthorizationProps) {}

  static request(input: Omit<AuthorizationProps, "status" | "validFrom" | "createdAt" | "updatedAt"> & { now: Date }): Authorization {
    const scope = [...new Set(input.scope.map((value) => value.trim()).filter(Boolean))];
    if (scope.length === 0) throw new Error("AUTHORIZATION_SCOPE_REQUIRED");
    if ((input.type === "ONE_TIME" || input.type === "RELEASE") && input.resourceId === null) {
      throw new Error("AUTHORIZATION_RESOURCE_REQUIRED");
    }
    return new Authorization({
      ...input,
      scope,
      status: "PENDING",
      validFrom: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: AuthorizationProps): Authorization {
    return new Authorization({ ...props, scope: [...props.scope] });
  }

  activate(validFrom: Date, validUntil: Date | null, now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    if (validUntil !== null && validUntil <= validFrom) throw new Error("AUTHORIZATION_VALIDITY_INVALID");
    this.props = { ...this.props, status: "ACTIVE", validFrom, validUntil, updatedAt: now };
  }

  reject(now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REJECTED", updatedAt: now };
  }

  revoke(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REVOKED", updatedAt: now };
  }

  expire(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    if (this.props.validUntil === null || this.props.validUntil > now) throw new Error("AUTHORIZATION_NOT_EXPIRED");
    this.props = { ...this.props, status: "EXPIRED", updatedAt: now };
  }

  isValidAt(instant: Date): boolean {
    return (
      this.props.status === "ACTIVE" &&
      this.props.validFrom !== null &&
      this.props.validFrom <= instant &&
      (this.props.validUntil === null || this.props.validUntil > instant)
    );
  }

  permits(scope: string, instant: Date): boolean {
    return this.isValidAt(instant) && this.props.scope.includes(scope);
  }

  snapshot(): Readonly<AuthorizationProps> {
    return { ...this.props, scope: [...this.props.scope] };
  }
}

export function assertDirectAuthorizationManagementAllowed(input: {
  requestingOrganizationId: string;
  activeCompanyControllerOrganizationId: string | null;
}): void {
  if (input.activeCompanyControllerOrganizationId && input.requestingOrganizationId !== input.activeCompanyControllerOrganizationId) {
    throw new Error("DIRECT_AUTHORIZATION_MANAGED_BY_ACTIVE_COMPANY_AUTHORITY");
  }
}
