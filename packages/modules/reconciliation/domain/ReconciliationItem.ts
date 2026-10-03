export type ReconciliationStatus = "UNMATCHED" | "MATCHED" | "EXCEPTION" | "RESOLVED" | "POSTED";

export interface ReconciliationItemProps {
  id: string;
  statementId: string;
  royaltyLineId: string;
  status: ReconciliationStatus;
  releaseId: string | null;
  recordingId: string | null;
  splitVersionId: string | null;
  exceptionCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ReconciliationItem {
  private constructor(private props: ReconciliationItemProps) {}

  static create(input: Omit<ReconciliationItemProps, "status" | "exceptionCode" | "createdAt" | "updatedAt"> & { now: Date }): ReconciliationItem {
    return new ReconciliationItem({
      ...input,
      status: input.releaseId || input.recordingId ? "MATCHED" : "UNMATCHED",
      exceptionCode: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: ReconciliationItemProps): ReconciliationItem {
    return new ReconciliationItem({ ...props });
  }

  match(input: { releaseId?: string | null; recordingId?: string | null; splitVersionId?: string | null; now: Date }): void {
    if (this.props.status === "POSTED") throw new Error("RECONCILIATION_ITEM_POSTED");
    const releaseId = input.releaseId ?? this.props.releaseId;
    const recordingId = input.recordingId ?? this.props.recordingId;
    if (!releaseId && !recordingId) throw new Error("RECONCILIATION_MATCH_TARGET_REQUIRED");

    this.props = {
      ...this.props,
      releaseId,
      recordingId,
      splitVersionId: input.splitVersionId ?? this.props.splitVersionId,
      status: "MATCHED",
      exceptionCode: null,
      updatedAt: input.now,
    };
  }

  markException(exceptionCode: string, now: Date): void {
    if (this.props.status === "POSTED") throw new Error("RECONCILIATION_ITEM_POSTED");
    const code = exceptionCode.trim();
    if (!code) throw new Error("RECONCILIATION_EXCEPTION_CODE_REQUIRED");
    this.props = { ...this.props, status: "EXCEPTION", exceptionCode: code, updatedAt: now };
  }

  resolve(now: Date): void {
    if (this.props.status !== "EXCEPTION") throw new Error("RECONCILIATION_STATE_TRANSITION_INVALID");
    if (!this.props.releaseId && !this.props.recordingId) throw new Error("RECONCILIATION_MATCH_TARGET_REQUIRED");
    this.props = { ...this.props, status: "RESOLVED", exceptionCode: null, updatedAt: now };
  }

  post(now: Date): void {
    if (!["MATCHED", "RESOLVED"].includes(this.props.status)) {
      throw new Error("RECONCILIATION_STATE_TRANSITION_INVALID");
    }
    if (!this.props.splitVersionId) throw new Error("RECONCILIATION_SPLIT_VERSION_REQUIRED");
    this.props = { ...this.props, status: "POSTED", updatedAt: now };
  }

  snapshot(): Readonly<ReconciliationItemProps> {
    return { ...this.props };
  }
}
