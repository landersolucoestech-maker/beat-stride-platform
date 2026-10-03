export type AutomationToolInvocationStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "REJECTED";

export interface AutomationToolInvocationProps {
  id: string;
  automationRunId: string;
  toolName: string;
  reversible: boolean;
  status: AutomationToolInvocationStatus;
  requestSummary: Record<string, unknown>;
  resultSummary: Record<string, unknown> | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class AutomationToolInvocation {
  private constructor(private props: AutomationToolInvocationProps) {}

  static pending(input: Omit<AutomationToolInvocationProps, "status" | "resultSummary" | "startedAt" | "completedAt" | "createdAt"> & { now: Date }): AutomationToolInvocation {
    const toolName = input.toolName.trim();
    if (!toolName) throw new Error("AUTOMATION_TOOL_NAME_REQUIRED");
    return new AutomationToolInvocation({
      ...input,
      toolName,
      status: "PENDING",
      resultSummary: null,
      startedAt: null,
      completedAt: null,
      createdAt: input.now,
    });
  }

  static restore(props: AutomationToolInvocationProps): AutomationToolInvocation {
    return new AutomationToolInvocation({
      ...props,
      requestSummary: { ...props.requestSummary },
      resultSummary: props.resultSummary ? { ...props.resultSummary } : null,
    });
  }

  start(now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTOMATION_TOOL_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "RUNNING", startedAt: now };
  }

  succeed(resultSummary: Record<string, unknown>, now: Date): void {
    if (this.props.status !== "RUNNING") throw new Error("AUTOMATION_TOOL_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "SUCCEEDED", resultSummary: { ...resultSummary }, completedAt: now };
  }

  fail(resultSummary: Record<string, unknown>, now: Date): void {
    if (this.props.status !== "RUNNING") throw new Error("AUTOMATION_TOOL_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "FAILED", resultSummary: { ...resultSummary }, completedAt: now };
  }

  reject(resultSummary: Record<string, unknown>, now: Date): void {
    if (this.props.status !== "PENDING") throw new Error("AUTOMATION_TOOL_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "REJECTED", resultSummary: { ...resultSummary }, completedAt: now };
  }

  snapshot(): Readonly<AutomationToolInvocationProps> {
    return {
      ...this.props,
      requestSummary: { ...this.props.requestSummary },
      resultSummary: this.props.resultSummary ? { ...this.props.resultSummary } : null,
    };
  }
}
