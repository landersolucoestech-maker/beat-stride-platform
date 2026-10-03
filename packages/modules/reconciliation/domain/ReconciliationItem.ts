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
  private constructor(private readonly props: ReconciliationItemProps) {}
  static create(props: ReconciliationItemProps): ReconciliationItem { return new ReconciliationItem(props); }
  snapshot(): Readonly<ReconciliationItemProps> { return { ...this.props }; }
}
