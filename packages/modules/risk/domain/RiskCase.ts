export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskCaseStatus = "OPEN" | "UNDER_REVIEW" | "ACTION_REQUIRED" | "RESOLVED" | "DISMISSED";

export interface RiskCaseProps {
  id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  category: string;
  severity: RiskSeverity;
  status: RiskCaseStatus;
  openedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<RiskCaseStatus, readonly RiskCaseStatus[]> = {
  OPEN: ["UNDER_REVIEW", "ACTION_REQUIRED", "RESOLVED", "DISMISSED"],
  UNDER_REVIEW: ["ACTION_REQUIRED", "RESOLVED", "DISMISSED"],
  ACTION_REQUIRED: ["UNDER_REVIEW", "RESOLVED", "DISMISSED"],
  RESOLVED: [],
  DISMISSED: [],
};

export class RiskCase {
  private constructor(private props: RiskCaseProps) {}

  static open(input: Omit<RiskCaseProps, "status" | "openedAt" | "resolvedAt" | "createdAt" | "updatedAt"> & { now: Date }): RiskCase {
    const category = input.category.trim();
    if (!category) throw new Error("RISK_CATEGORY_REQUIRED");
    if (!input.resourceType.trim() || !input.resourceId.trim()) throw new Error("RISK_RESOURCE_REQUIRED");
    return new RiskCase({
      ...input,
      category,
      status: "OPEN",
      openedAt: input.now,
      resolvedAt: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: RiskCaseProps): RiskCase {
    return new RiskCase({ ...props });
  }

  startReview(now: Date): void { this.transitionTo("UNDER_REVIEW", now); }
  requireAction(now: Date): void { this.transitionTo("ACTION_REQUIRED", now); }

  resolve(now: Date): void {
    this.transitionTo("RESOLVED", now);
    this.props = { ...this.props, resolvedAt: now, updatedAt: now };
  }

  dismiss(now: Date): void {
    this.transitionTo("DISMISSED", now);
    this.props = { ...this.props, resolvedAt: now, updatedAt: now };
  }

  blocksSensitiveOperations(): boolean {
    return this.props.severity === "CRITICAL" && !["RESOLVED", "DISMISSED"].includes(this.props.status);
  }

  snapshot(): Readonly<RiskCaseProps> {
    return { ...this.props };
  }

  private transitionTo(next: RiskCaseStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("RISK_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
