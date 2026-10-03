export type DeliveryStatus = "PENDING" | "VALIDATING" | "SCHEDULED" | "SENT" | "DELIVERED" | "ACKNOWLEDGED" | "PROCESSING" | "LIVE" | "REJECTED" | "FAILED" | "CORRECTION_REQUIRED" | "UPDATE_PENDING" | "TAKEDOWN_REQUESTED" | "TAKEN_DOWN";

const TERMINAL_FAILURES = new Set<DeliveryStatus>(["REJECTED", "FAILED"]);

export interface DeliveryProps {
  id: string;
  organizationId: string;
  releaseId: string;
  releaseVersion: number;
  providerCode: string;
  destinationCode: string;
  status: DeliveryStatus;
  providerOperationId: string | null;
  providerStatus: string | null;
  lastErrorCode: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Delivery {
  private constructor(private props: DeliveryProps) {}

  static create(input: Omit<DeliveryProps, "status" | "providerOperationId" | "providerStatus" | "lastErrorCode" | "version" | "createdAt" | "updatedAt"> & { now: Date }): Delivery {
    return new Delivery({ ...input, status: "PENDING", providerOperationId: null, providerStatus: null, lastErrorCode: null, version: 1, createdAt: input.now, updatedAt: input.now });
  }

  applyProviderState(next: DeliveryStatus, providerStatus: string | null, now: Date): void {
    if (this.props.status === "TAKEN_DOWN") throw new Error("DELIVERY_TERMINAL_STATE");
    if (this.props.status === "LIVE" && TERMINAL_FAILURES.has(next)) throw new Error("DELIVERY_STATE_REGRESSION_DENIED");
    this.props = { ...this.props, status: next, providerStatus, version: this.props.version + 1, updatedAt: now };
  }

  snapshot(): Readonly<DeliveryProps> { return { ...this.props }; }
}

export type ReleaseDistributionStatus = "PENDING" | "DISTRIBUTING" | "LIVE" | "PARTIALLY_LIVE" | "FAILED";

export function deriveReleaseDistributionStatus(deliveries: ReadonlyArray<Pick<DeliveryProps, "status">>): ReleaseDistributionStatus {
  if (deliveries.length === 0) return "PENDING";
  const statuses = deliveries.map((delivery) => delivery.status);
  const liveCount = statuses.filter((status) => status === "LIVE").length;
  if (liveCount === statuses.length) return "LIVE";
  if (liveCount > 0) return "PARTIALLY_LIVE";
  if (statuses.every((status) => status === "FAILED" || status === "REJECTED")) return "FAILED";
  return "DISTRIBUTING";
}
