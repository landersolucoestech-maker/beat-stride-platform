export type AutonomyMode = "AUTO" | "CONTROLLED" | "APPROVAL_GATED";
export type AutomationRunStatus = "PENDING" | "RUNNING" | "AWAITING_APPROVAL" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export interface AutomationActor {
  type: "USER" | "SERVICE" | "SYSTEM";
  id: string;
  organizationId: string | null;
}

export interface AutomationRunProps {
  id: string;
  organizationId: string | null;
  automationType: string;
  autonomyMode: AutonomyMode;
  resourceType: string | null;
  resourceId: string | null;
  status: AutomationRunStatus;
  correlationId: string;
  requestedByActor: AutomationActor;
  inputSummary: Record<string, unknown>;
  outputSummary: Record<string, unknown> | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class AutomationRun {
  private constructor(private props: AutomationRunProps) {}

  static request(input: Omit<AutomationRunProps, "status" | "outputSummary" | "startedAt" | "completedAt" | "createdAt"> & { now: Date }): AutomationRun {
    const automationType = input.automationType.trim();
    if (!automationType) throw new Error("AUTOMATION_TYPE_REQUIRED");
    if (!input.correlationId.trim()) throw new Error("AUTOMATION_CORRELATION_ID_REQUIRED");
    if (!input.requestedByActor.id.trim()) throw new Error("AUTOMATION_ACTOR_REQUIRED");
    if ((input.resourceType === null) !== (input.resourceId === null)) throw new Error("AUTOMATION_RESOURCE_INVALID");

    return new AutomationRun({
      ...input,
      automationType,
      status: "PENDING",
      outputSummary: null,
      startedAt: null,
      completedAt: null,
      createdAt: input.now,
    });
  }

  static restore(props: AutomationRunProps): AutomationRun {
    return new AutomationRun({
      ...props,
      requestedByActor: { ...props.requestedByActor },
      inputSummary: { ...props.inputSummary },
      outputSummary: props.outputSummary ? { ...props.outputSummary } : null,
    });
  }

  start(now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTOMATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "RUNNING", startedAt: now };
  }

  requireApproval(): void {
    if (this.props.status !== "RUNNING" || this.props.autonomyMode !== "APPROVAL_GATED") {
      throw new Error("AUTOMATION_APPROVAL_NOT_ALLOWED");
    }
    this.props = { ...this.props, status: "AWAITING_APPROVAL" };
  }

  approve(): void {
    if (this.props.status !== "AWAITING_APPROVAL") throw new Error("AUTOMATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "RUNNING" };
  }

  succeed(outputSummary: Record<string, unknown>, now: Date): void {
    if (this.props.status !== "RUNNING") throw new Error("AUTOMATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "SUCCEEDED", outputSummary: { ...outputSummary }, completedAt: now };
  }

  fail(outputSummary: Record<string, unknown>, now: Date): void {
    if (!["RUNNING", "AWAITING_APPROVAL"].includes(this.props.status)) throw new Error("AUTOMATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "FAILED", outputSummary: { ...outputSummary }, completedAt: now };
  }

  cancel(now: Date): void {
    if (!["PENDING", "RUNNING", "AWAITING_APPROVAL"].includes(this.props.status)) throw new Error("AUTOMATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "CANCELLED", completedAt: now };
  }

  snapshot(): Readonly<AutomationRunProps> {
    return {
      ...this.props,
      requestedByActor: { ...this.props.requestedByActor },
      inputSummary: { ...this.props.inputSummary },
      outputSummary: this.props.outputSummary ? { ...this.props.outputSummary } : null,
    };
  }
}
