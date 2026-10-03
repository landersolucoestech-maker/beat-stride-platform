export type DeliveryStatus =
  | "PENDING"
  | "VALIDATING"
  | "SCHEDULED"
  | "SENT"
  | "DELIVERED"
  | "ACKNOWLEDGED"
  | "PROCESSING"
  | "LIVE"
  | "REJECTED"
  | "FAILED"
  | "CORRECTION_REQUIRED"
  | "UPDATE_PENDING"
  | "TAKEDOWN_REQUESTED"
  | "TAKEN_DOWN";

const allowedTransitions: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  PENDING: ["VALIDATING", "FAILED"],
  VALIDATING: ["SCHEDULED", "SENT", "CORRECTION_REQUIRED", "REJECTED", "FAILED"],
  SCHEDULED: ["SENT", "FAILED"],
  SENT: ["DELIVERED", "ACKNOWLEDGED", "PROCESSING", "REJECTED", "FAILED"],
  DELIVERED: ["ACKNOWLEDGED", "PROCESSING", "LIVE", "REJECTED", "FAILED"],
  ACKNOWLEDGED: ["PROCESSING", "LIVE", "REJECTED", "FAILED"],
  PROCESSING: ["LIVE", "CORRECTION_REQUIRED", "REJECTED", "FAILED"],
  LIVE: ["UPDATE_PENDING", "TAKEDOWN_REQUESTED"],
  REJECTED: ["CORRECTION_REQUIRED"],
  FAILED: ["PENDING", "VALIDATING", "SENT"],
  CORRECTION_REQUIRED: ["PENDING", "VALIDATING"],
  UPDATE_PENDING: ["SENT", "DELIVERED", "ACKNOWLEDGED", "PROCESSING", "LIVE", "CORRECTION_REQUIRED", "REJECTED", "FAILED", "TAKEDOWN_REQUESTED"],
  TAKEDOWN_REQUESTED: ["TAKEN_DOWN", "FAILED"],
  TAKEN_DOWN: [],
};

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
    if (input.releaseVersion < 1 || !Number.isInteger(input.releaseVersion)) {
      throw new Error("DELIVERY_RELEASE_VERSION_INVALID");
    }
    if (!input.providerCode.trim()) throw new Error("DELIVERY_PROVIDER_REQUIRED");
    if (!input.destinationCode.trim()) throw new Error("DELIVERY_DESTINATION_REQUIRED");

    return new Delivery({
      ...input,
      providerCode: input.providerCode.trim(),
      destinationCode: input.destinationCode.trim(),
      status: "PENDING",
      providerOperationId: null,
      providerStatus: null,
      lastErrorCode: null,
      version: 1,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: DeliveryProps): Delivery {
    return new Delivery({ ...props });
  }

  bindProviderOperation(providerOperationId: string, now: Date): void {
    const operationId = providerOperationId.trim();
    if (!operationId) throw new Error("DELIVERY_PROVIDER_OPERATION_REQUIRED");
    if (this.props.providerOperationId && this.props.providerOperationId !== operationId) {
      throw new Error("DELIVERY_PROVIDER_OPERATION_IMMUTABLE");
    }
    this.props = {
      ...this.props,
      providerOperationId: operationId,
      version: this.props.version + 1,
      updatedAt: now,
    };
  }

  applyProviderState(input: {
    next: DeliveryStatus;
    providerStatus: string | null;
    errorCode?: string | null;
    now: Date;
  }): void {
    if (!allowedTransitions[this.props.status].includes(input.next)) {
      throw new Error("DELIVERY_STATE_TRANSITION_INVALID");
    }

    const failed = input.next === "FAILED" || input.next === "REJECTED" || input.next === "CORRECTION_REQUIRED";
    this.props = {
      ...this.props,
      status: input.next,
      providerStatus: input.providerStatus,
      lastErrorCode: failed ? input.errorCode ?? this.props.lastErrorCode : null,
      version: this.props.version + 1,
      updatedAt: input.now,
    };
  }

  requestUpdate(now: Date): void {
    this.transitionTo("UPDATE_PENDING", now);
  }

  requestTakedown(now: Date): void {
    this.transitionTo("TAKEDOWN_REQUESTED", now);
  }

  snapshot(): Readonly<DeliveryProps> {
    return { ...this.props };
  }

  private transitionTo(next: DeliveryStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) {
      throw new Error("DELIVERY_STATE_TRANSITION_INVALID");
    }
    this.props = {
      ...this.props,
      status: next,
      lastErrorCode: null,
      version: this.props.version + 1,
      updatedAt: now,
    };
  }
}

export type ReleaseDistributionStatus = "PENDING" | "DISTRIBUTING" | "LIVE" | "PARTIALLY_LIVE" | "FAILED" | "TAKEN_DOWN";

export function deriveReleaseDistributionStatus(deliveries: ReadonlyArray<Pick<DeliveryProps, "status">>): ReleaseDistributionStatus {
  if (deliveries.length === 0) return "PENDING";

  const statuses = deliveries.map((delivery) => delivery.status);
  const takenDownCount = statuses.filter((status) => status === "TAKEN_DOWN").length;
  const liveCount = statuses.filter((status) => status === "LIVE").length;

  if (takenDownCount === statuses.length) return "TAKEN_DOWN";
  if (liveCount === statuses.length) return "LIVE";
  if (liveCount > 0 || takenDownCount > 0) return "PARTIALLY_LIVE";
  if (statuses.every((status) => status === "FAILED" || status === "REJECTED")) return "FAILED";
  return "DISTRIBUTING";
}
