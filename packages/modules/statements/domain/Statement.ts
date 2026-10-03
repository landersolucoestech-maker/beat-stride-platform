export type StatementStatus = "RECEIVED" | "PARSING" | "NORMALIZING" | "MATCHING" | "EXCEPTIONS" | "RECONCILING" | "POSTED" | "CLOSED";

export interface StatementProps {
  id: string;
  organizationId: string | null;
  providerCode: string;
  sourceReference: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  status: StatementStatus;
  fileAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Statement {
  private constructor(private props: StatementProps) {}
  static receive(input: Omit<StatementProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): Statement {
    return new Statement({ ...input, status: "RECEIVED", createdAt: input.now, updatedAt: input.now });
  }
  moveTo(status: StatementStatus, now: Date): void {
    if (this.props.status === "CLOSED") throw new Error("STATEMENT_CLOSED");
    this.props = { ...this.props, status, updatedAt: now };
  }
  snapshot(): Readonly<StatementProps> { return { ...this.props }; }
}
