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
    if (input.scope.length === 0) throw new Error("AUTHORIZATION_SCOPE_REQUIRED");
    return new Authorization({ ...input, status: "PENDING", validFrom: null, createdAt: input.now, updatedAt: input.now });
  }

  activate(validFrom: Date, validUntil: Date | null, now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "ACTIVE", validFrom, validUntil, updatedAt: now };
  }

  revoke(now: Date): void {
    if (this.props.status !== "ACTIVE") throw new Error("AUTHORIZATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REVOKED", updatedAt: now };
  }

  snapshot(): Readonly<AuthorizationProps> { return { ...this.props, scope: [...this.props.scope] }; }
}

export function assertDirectAuthorizationManagementAllowed(input: {
  requestingOrganizationId: string;
  activeCompanyControllerOrganizationId: string | null;
}): void {
  if (input.activeCompanyControllerOrganizationId && input.requestingOrganizationId !== input.activeCompanyControllerOrganizationId) {
    throw new Error("DIRECT_AUTHORIZATION_MANAGED_BY_ACTIVE_COMPANY_AUTHORITY");
  }
}
