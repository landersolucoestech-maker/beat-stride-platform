export type CreatorsConnectionStatus = "NOT_CONNECTED" | "CONNECTED" | "REAUTH_REQUIRED" | "REVOKED";

export interface CreatorsConnectionView {
  available: boolean;
  status: CreatorsConnectionStatus;
  connectedOrganizationName: string | null;
  mappedOrganizationId: string | null;
  connectUrl: string | null;
  manageUrl: string | null;
  connectedAt: string | null;
}

export interface CreatorsCampaignProjection {
  externalCampaignId: string;
  releaseId: string;
  releaseTitle: string;
  statusLabel: string;
  openUrl: string | null;
  updatedAt: string;
}

export interface CreatorsIntegrationOverview {
  connection: CreatorsConnectionView;
  campaigns: CreatorsCampaignProjection[];
}
