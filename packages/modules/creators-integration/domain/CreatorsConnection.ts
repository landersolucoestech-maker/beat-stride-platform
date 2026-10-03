export type CreatorsConnectionStatus = "DISCONNECTED" | "AUTHORIZATION_PENDING" | "CONNECTED" | "REAUTHORIZATION_REQUIRED" | "REVOKED";

export interface CreatorsConnectionProps {
  id: string;
  organizationId: string;
  externalOrganizationId: string | null;
  status: CreatorsConnectionStatus;
  grantedScopes: string[];
  connectedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CreatorsConnection {
  private constructor(private props: CreatorsConnectionProps) {}

  static createDisconnected(id: string, organizationId: string, now: Date): CreatorsConnection {
    return new CreatorsConnection({
      id,
      organizationId,
      externalOrganizationId: null,
      status: "DISCONNECTED",
      grantedScopes: [],
      connectedAt: null,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: CreatorsConnectionProps): CreatorsConnection {
    return new CreatorsConnection({ ...props, grantedScopes: [...props.grantedScopes] });
  }

  beginAuthorization(now: Date): void {
    if (!["DISCONNECTED", "REAUTHORIZATION_REQUIRED", "REVOKED"].includes(this.props.status)) {
      throw new Error("CREATORS_CONNECTION_STATE_TRANSITION_INVALID");
    }
    this.props = { ...this.props, status: "AUTHORIZATION_PENDING", updatedAt: now };
  }

  connect(input: { externalOrganizationId: string; grantedScopes: string[]; now: Date }): void {
    if (this.props.status !== "AUTHORIZATION_PENDING") throw new Error("CREATORS_CONNECTION_STATE_TRANSITION_INVALID");
    const externalOrganizationId = input.externalOrganizationId.trim();
    const grantedScopes = [...new Set(input.grantedScopes.map((scope) => scope.trim()).filter(Boolean))];
    if (!externalOrganizationId) throw new Error("CREATORS_EXTERNAL_ORGANIZATION_REQUIRED");
    if (grantedScopes.length === 0) throw new Error("CREATORS_CONNECTION_SCOPE_REQUIRED");
    this.props = {
      ...this.props,
      externalOrganizationId,
      grantedScopes,
      status: "CONNECTED",
      connectedAt: input.now,
      revokedAt: null,
      updatedAt: input.now,
    };
  }

  requireReauthorization(now: Date): void {
    if (this.props.status !== "CONNECTED") throw new Error("CREATORS_CONNECTION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REAUTHORIZATION_REQUIRED", updatedAt: now };
  }

  revoke(now: Date): void {
    if (!["CONNECTED", "REAUTHORIZATION_REQUIRED", "AUTHORIZATION_PENDING"].includes(this.props.status)) {
      throw new Error("CREATORS_CONNECTION_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "REVOKED",
      grantedScopes: [],
      revokedAt: now,
      updatedAt: now,
    };
  }

  hasScope(scope: string): boolean {
    return this.props.status === "CONNECTED" && this.props.grantedScopes.includes(scope);
  }

  snapshot(): Readonly<CreatorsConnectionProps> {
    return { ...this.props, grantedScopes: [...this.props.grantedScopes] };
  }
}
