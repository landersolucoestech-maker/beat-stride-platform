export type ChangeRequestType = "UPDATE" | "TAKEDOWN";
export type ChangeRequestStatus = "REQUESTED" | "VALIDATING" | "APPROVED" | "SENT" | "COMPLETED" | "REJECTED" | "FAILED";

export interface ChangeRequestProps {
  id: string;
  organizationId: string;
  releaseId: string;
  deliveryId: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  reason: string;
  requestedByActorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChangeRequest {
  private constructor(private readonly props: ChangeRequestProps) {}
  static request(input: Omit<ChangeRequestProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): ChangeRequest {
    if (!input.reason.trim()) throw new Error("CHANGE_REQUEST_REASON_REQUIRED");
    return new ChangeRequest({ ...input, status: "REQUESTED", createdAt: input.now, updatedAt: input.now });
  }
  snapshot(): Readonly<ChangeRequestProps> { return { ...this.props }; }
}
