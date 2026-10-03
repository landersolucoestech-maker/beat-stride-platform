export type ExternalCampaignStatus = "CREATED" | "PENDING_PAYMENT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface ExternalCampaignReferenceProps {
  id: string;
  organizationId: string;
  releaseId: string;
  externalCampaignId: string;
  externalOrganizationId: string;
  status: ExternalCampaignStatus;
  externalUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const terminalStatuses = new Set<ExternalCampaignStatus>(["COMPLETED", "CANCELLED"]);

export class ExternalCampaignReference {
  private constructor(private props: ExternalCampaignReferenceProps) {}

  static create(props: ExternalCampaignReferenceProps): ExternalCampaignReference {
    if (!props.releaseId.trim()) throw new Error("CREATORS_RELEASE_REFERENCE_REQUIRED");
    if (!props.externalCampaignId.trim()) throw new Error("CREATORS_CAMPAIGN_REFERENCE_REQUIRED");
    if (!props.externalOrganizationId.trim()) throw new Error("CREATORS_EXTERNAL_ORGANIZATION_REQUIRED");
    return new ExternalCampaignReference({ ...props });
  }

  static restore(props: ExternalCampaignReferenceProps): ExternalCampaignReference {
    return new ExternalCampaignReference({ ...props });
  }

  applyExternalStatus(status: ExternalCampaignStatus, externalUpdatedAt: Date, now: Date): void {
    if (externalUpdatedAt < this.props.externalUpdatedAt) return;
    if (terminalStatuses.has(this.props.status) && status !== this.props.status) {
      throw new Error("CREATORS_CAMPAIGN_TERMINAL_STATE_REGRESSION");
    }
    this.props = { ...this.props, status, externalUpdatedAt, updatedAt: now };
  }

  snapshot(): Readonly<ExternalCampaignReferenceProps> {
    return { ...this.props };
  }
}
