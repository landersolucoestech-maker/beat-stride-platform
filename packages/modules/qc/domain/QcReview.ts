export type QcStatus = "PENDING" | "RUNNING" | "PASS" | "WARNING" | "BLOCKING_ERROR" | "MANUAL_REVIEW" | "CORRECTION_REQUIRED" | "REJECTED" | "APPROVED";
export type QcSeverity = "INFO" | "WARNING" | "BLOCKING";

export interface QcFinding {
  code: string;
  severity: QcSeverity;
  fieldPath: string | null;
  messageKey: string;
}

export interface QcReviewProps {
  id: string;
  submissionId: string;
  status: QcStatus;
  findings: QcFinding[];
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class QcReview {
  private constructor(private props: QcReviewProps) {}

  static create(id: string, submissionId: string, now: Date): QcReview {
    return new QcReview({ id, submissionId, status: "PENDING", findings: [], startedAt: null, completedAt: null, createdAt: now, updatedAt: now });
  }

  start(now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("QC_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "RUNNING", startedAt: now, updatedAt: now };
  }

  complete(status: Exclude<QcStatus, "PENDING" | "RUNNING">, findings: QcFinding[], now: Date): void {
    if (this.props.status !== "RUNNING") throw new Error("QC_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status, findings: [...findings], completedAt: now, updatedAt: now };
  }

  snapshot(): Readonly<QcReviewProps> { return { ...this.props, findings: [...this.props.findings] }; }
}
