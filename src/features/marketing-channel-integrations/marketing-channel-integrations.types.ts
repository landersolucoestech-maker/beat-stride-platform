export type MarketingChannelProvider = "META" | "TIKTOK" | "YOUTUBE";

export type MarketingChannelConnectionStatus =
  | "NOT_CONNECTED"
  | "AUTHORIZATION_PENDING"
  | "CONNECTED"
  | "REAUTH_REQUIRED"
  | "REVOKED";

export interface MarketingChannelConnectionView {
  code: MarketingChannelProvider;
  label: string;
  description: string;
  channels: string[];
  available: boolean;
  status: MarketingChannelConnectionStatus;
  externalAccountId: string | null;
  externalAccountName: string | null;
  grantedScopes: string[];
  connectedAt: string | null;
  revokedAt: string | null;
  lastErrorCode: string | null;
  connectUrl: string | null;
  manageUrl: string | null;
  unavailableReason: string | null;
}

export interface MarketingChannelIntegrationsOverview {
  providers: MarketingChannelConnectionView[];
}
