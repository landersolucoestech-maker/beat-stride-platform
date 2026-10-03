export type CreatorsConnectionStatus = "not_connected" | "pending" | "active" | "revoked" | "error";

export interface CreatorsConnectionView {
  status: CreatorsConnectionStatus;
  externalOrganizationId?: string;
  connectedAt?: string;
}

export interface CreatorsCampaignProjectionView {
  externalCampaignId: string;
  releaseId: string;
  status: string;
  paymentStatus?: string;
  packageReference?: string;
  lastSyncedAt?: string;
}

export interface CreatorsIntegrationSnapshot {
  connection: CreatorsConnectionView;
  campaigns: CreatorsCampaignProjectionView[];
}
