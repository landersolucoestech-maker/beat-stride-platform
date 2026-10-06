export type MarketingChannelProvider = "META" | "TIKTOK" | "YOUTUBE";

export type MarketingChannelConnectionStatus =
  | "DISCONNECTED"
  | "AUTHORIZATION_PENDING"
  | "CONNECTED"
  | "REAUTHORIZATION_REQUIRED"
  | "REVOKED";

export interface MarketingChannelConnectionProps {
  id: string;
  organizationId: string;
  provider: MarketingChannelProvider;
  externalAccountId: string | null;
  externalAccountName: string | null;
  status: MarketingChannelConnectionStatus;
  grantedScopes: string[];
  credentialSecretReference: string | null;
  connectedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MarketingChannelConnection {
  private constructor(private props: MarketingChannelConnectionProps) {}

  static createDisconnected(
    id: string,
    organizationId: string,
    provider: MarketingChannelProvider,
    now: Date,
  ): MarketingChannelConnection {
    return new MarketingChannelConnection({
      id,
      organizationId,
      provider,
      externalAccountId: null,
      externalAccountName: null,
      status: "DISCONNECTED",
      grantedScopes: [],
      credentialSecretReference: null,
      connectedAt: null,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: MarketingChannelConnectionProps): MarketingChannelConnection {
    return new MarketingChannelConnection({
      ...props,
      grantedScopes: [...props.grantedScopes],
    });
  }

  beginAuthorization(now: Date): void {
    if (!["DISCONNECTED", "REAUTHORIZATION_REQUIRED", "REVOKED"].includes(this.props.status)) {
      throw new Error("MARKETING_CHANNEL_CONNECTION_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "AUTHORIZATION_PENDING",
      updatedAt: now,
    };
  }

  connect(input: {
    externalAccountId: string;
    externalAccountName: string | null;
    grantedScopes: string[];
    credentialSecretReference: string;
    now: Date;
  }): void {
    if (this.props.status !== "AUTHORIZATION_PENDING") {
      throw new Error("MARKETING_CHANNEL_CONNECTION_STATE_TRANSITION_INVALID");
    }

    const externalAccountId = input.externalAccountId.trim();
    const credentialSecretReference = input.credentialSecretReference.trim();
    const grantedScopes = [...new Set(input.grantedScopes.map((scope) => scope.trim()).filter(Boolean))];

    if (!externalAccountId) throw new Error("MARKETING_CHANNEL_EXTERNAL_ACCOUNT_REQUIRED");
    if (!credentialSecretReference) throw new Error("MARKETING_CHANNEL_CREDENTIAL_REFERENCE_REQUIRED");
    if (grantedScopes.length === 0) throw new Error("MARKETING_CHANNEL_SCOPE_REQUIRED");

    this.props = {
      ...this.props,
      externalAccountId,
      externalAccountName: input.externalAccountName?.trim() || null,
      grantedScopes,
      credentialSecretReference,
      status: "CONNECTED",
      connectedAt: input.now,
      revokedAt: null,
      updatedAt: input.now,
    };
  }

  requireReauthorization(now: Date): void {
    if (this.props.status !== "CONNECTED") {
      throw new Error("MARKETING_CHANNEL_CONNECTION_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "REAUTHORIZATION_REQUIRED",
      updatedAt: now,
    };
  }

  revoke(now: Date): void {
    if (!["CONNECTED", "REAUTHORIZATION_REQUIRED", "AUTHORIZATION_PENDING"].includes(this.props.status)) {
      throw new Error("MARKETING_CHANNEL_CONNECTION_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: "REVOKED",
      grantedScopes: [],
      credentialSecretReference: null,
      revokedAt: now,
      updatedAt: now,
    };
  }

  hasScope(scope: string): boolean {
    return this.props.status === "CONNECTED" && this.props.grantedScopes.includes(scope);
  }

  snapshot(): Readonly<MarketingChannelConnectionProps> {
    return { ...this.props, grantedScopes: [...this.props.grantedScopes] };
  }
}
