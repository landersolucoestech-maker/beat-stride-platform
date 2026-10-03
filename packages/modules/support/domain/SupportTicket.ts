export type SupportTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type SupportTicketStatus = "OPEN" | "WAITING_ON_SUPPORT" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";

export interface SupportTicketProps {
  id: string;
  organizationId: string;
  createdByUserId: string;
  subject: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

const allowedTransitions: Record<SupportTicketStatus, readonly SupportTicketStatus[]> = {
  OPEN: ["WAITING_ON_SUPPORT", "WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"],
  WAITING_ON_SUPPORT: ["WAITING_ON_CUSTOMER", "RESOLVED", "CLOSED"],
  WAITING_ON_CUSTOMER: ["WAITING_ON_SUPPORT", "RESOLVED", "CLOSED"],
  RESOLVED: ["OPEN", "CLOSED"],
  CLOSED: [],
};

export class SupportTicket {
  private constructor(private props: SupportTicketProps) {}

  static open(input: Omit<SupportTicketProps, "status" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt"> & { now: Date }): SupportTicket {
    const subject = input.subject.trim();
    if (!subject) throw new Error("SUPPORT_TICKET_SUBJECT_REQUIRED");
    return new SupportTicket({
      ...input,
      subject,
      status: "OPEN",
      createdAt: input.now,
      updatedAt: input.now,
      resolvedAt: null,
      closedAt: null,
    });
  }

  static restore(props: SupportTicketProps): SupportTicket {
    return new SupportTicket({ ...props });
  }

  waitOnSupport(now: Date): void { this.transitionTo("WAITING_ON_SUPPORT", now); }
  waitOnCustomer(now: Date): void { this.transitionTo("WAITING_ON_CUSTOMER", now); }

  resolve(now: Date): void {
    this.transitionTo("RESOLVED", now);
    this.props = { ...this.props, resolvedAt: now, updatedAt: now };
  }

  reopen(now: Date): void {
    this.transitionTo("OPEN", now);
    this.props = { ...this.props, resolvedAt: null, closedAt: null, updatedAt: now };
  }

  close(now: Date): void {
    this.transitionTo("CLOSED", now);
    this.props = { ...this.props, closedAt: now, updatedAt: now };
  }

  snapshot(): Readonly<SupportTicketProps> {
    return { ...this.props };
  }

  private transitionTo(next: SupportTicketStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("SUPPORT_TICKET_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
