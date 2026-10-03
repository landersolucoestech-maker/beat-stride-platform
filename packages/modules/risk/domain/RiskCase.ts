export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskCaseStatus = "OPEN" | "UNDER_REVIEW" | "ACTION_REQUIRED" | "CLEARED" | "CONFIRMED" | "MITIGATED" | "CLOSED";

export interface RiskCaseProps {
  id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  reasonCode: string;
  severity: RiskSeverity;
  status: RiskCaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<RiskCaseStatus, readonly RiskCaseStatus[]> = {
  OPEN: ["UNDER_REVIEW", "ACTION_REQUIRED", "CLEARED"],
  UNDER_REVIEW: ["ACTION_REQUIRED", "CLEARED", "CONFIRMED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "CLEARED", "CONFIRMED"],
  CLEARED: ["CLOSED"],
  CONFIRMED: ["MITIGATED", "CLOSED"],
  MITIGATED: ["UNDER_REVIEW", "CLOSED"],
  CLOSED: [],
};

export class RiskCase {
  private constructor(private props: RiskCaseProps) {}

  static open(input: Omit<RiskCaseProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): RiskCase {
    const reasonCode = input.reasonCode.trim();
    if (!reasonCode) throw new Error("RISK_REASON_REQUIRED");
    if (!input.resourceType.trim() || !input.resourceId.trim()) throw new Error("RISK_RESOURCE_REQUIRED");
    return new RiskCase({ ...input, reasonCode, status: "OPEN", createdAt: input.now, updatedAt: input.now });
  }

  static restore(props: RiskCaseProps): RiskCase {
    return new RiskCase({ ...props });
  }

  startReview(now: Date): void { this.transitionTo("UNDER_REVIEW", now); }
  requireAction(now: Date): void { this.transitionTo("ACTION_REQUIRED", now); }
  clear(now: Date): void { this.transitionTo("CLEARED", now); }
  confirm(now: Date): void { this.transitionTo("CONFIRMED", now); }
  mitigate(now: Date): void { this.transitionTo("MITIGATED", now); }
  close(now: Date): void { this.transitionTo("CLOSED", now); }

  blocksSensitiveOperations(): boolean {
    return this.props.severity === "CRITICAL" && !["CLEARED", "CLOSED"].includes(this.props.status);
  }

  snapshot(): Readonly<RiskCaseProps> {
    return { ...this.props };
  }

  private transitionTo(next: RiskCaseStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("RISK_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
