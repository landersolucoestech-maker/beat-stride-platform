export type OperationWorkItemStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";

export interface OperationWorkItemProps {
  id: string;
  organizationId: string | null;
  workType: string;
  resourceType: string;
  resourceId: string;
  status: OperationWorkItemStatus;
  assignedUserId: string | null;
  dueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<OperationWorkItemStatus, readonly OperationWorkItemStatus[]> = {
  OPEN: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "OPEN", "CANCELLED"],
  IN_PROGRESS: ["BLOCKED", "COMPLETED", "CANCELLED"],
  BLOCKED: ["IN_PROGRESS", "ASSIGNED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class OperationWorkItem {
  private constructor(private props: OperationWorkItemProps) {}

  static open(input: Omit<OperationWorkItemProps, "status" | "assignedUserId" | "createdAt" | "updatedAt"> & { now: Date }): OperationWorkItem {
    const workType = input.workType.trim();
    const resourceType = input.resourceType.trim();
    const resourceId = input.resourceId.trim();
    if (!workType) throw new Error("OPERATION_WORK_TYPE_REQUIRED");
    if (!resourceType || !resourceId) throw new Error("OPERATION_RESOURCE_REQUIRED");
    return new OperationWorkItem({
      ...input,
      workType,
      resourceType,
      resourceId,
      status: "OPEN",
      assignedUserId: null,
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: OperationWorkItemProps): OperationWorkItem {
    return new OperationWorkItem({ ...props });
  }

  assign(userId: string, now: Date): void {
    const assignedUserId = userId.trim();
    if (!assignedUserId) throw new Error("OPERATION_ASSIGNEE_REQUIRED");
    if (!["OPEN", "BLOCKED"].includes(this.props.status)) throw new Error("OPERATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "ASSIGNED", assignedUserId, updatedAt: now };
  }

  unassign(now: Date): void {
    if (this.props.status !== "ASSIGNED") throw new Error("OPERATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: "OPEN", assignedUserId: null, updatedAt: now };
  }

  start(now: Date): void { this.transitionTo("IN_PROGRESS", now); }
  block(now: Date): void { this.transitionTo("BLOCKED", now); }
  complete(now: Date): void { this.transitionTo("COMPLETED", now); }
  cancel(now: Date): void { this.transitionTo("CANCELLED", now); }

  isOverdue(at: Date): boolean {
    return this.props.dueAt !== null && this.props.dueAt < at && !["COMPLETED", "CANCELLED"].includes(this.props.status);
  }

  snapshot(): Readonly<OperationWorkItemProps> {
    return { ...this.props };
  }

  private transitionTo(next: OperationWorkItemStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("OPERATION_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
