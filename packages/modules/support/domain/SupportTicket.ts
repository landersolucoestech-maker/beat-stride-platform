export type SupportTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type SupportTicketStatus = "OPEN" | "WAITING_CUSTOMER" | "WAITING_INTERNAL" | "RESOLVED" | "CLOSED";

export interface SupportTicketProps {
  id: string;
  organizationId: string;
  openedByUserId: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

const allowedTransitions: Record<SupportTicketStatus, readonly SupportTicketStatus[]> = {
  OPEN: ["WAITING_CUSTOMER", "WAITING_INTERNAL", "RESOLVED", "CLOSED"],
  WAITING_CUSTOMER: ["WAITING_INTERNAL", "RESOLVED", "CLOSED"],
  WAITING_INTERNAL: ["WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
  RESOLVED: ["OPEN", "CLOSED"],
  CLOSED: [],
};

export class SupportTicket {
  private constructor(private props: SupportTicketProps) {}

  static open(input: Omit<SupportTicketProps, "status" | "createdAt" | "updatedAt"> & { now: Date }): SupportTicket {
    const subject = input.subject.trim();
    const category = input.category.trim();
    if (!subject) throw new Error("SUPPORT_TICKET_SUBJECT_REQUIRED");
    if (!category) throw new Error("SUPPORT_TICKET_CATEGORY_REQUIRED");
    if (!input.openedByUserId.trim()) throw new Error("SUPPORT_TICKET_USER_REQUIRED");
    return new SupportTicket({
      ...input,
      subject,
      category,
      openedByUserId: input.openedByUserId.trim(),
      status: "OPEN",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static restore(props: SupportTicketProps): SupportTicket {
    return new SupportTicket({ ...props });
  }

  waitOnInternal(now: Date): void { this.transitionTo("WAITING_INTERNAL", now); }
  waitOnCustomer(now: Date): void { this.transitionTo("WAITING_CUSTOMER", now); }
  resolve(now: Date): void { this.transitionTo("RESOLVED", now); }
  reopen(now: Date): void { this.transitionTo("OPEN", now); }
  close(now: Date): void { this.transitionTo("CLOSED", now); }

  snapshot(): Readonly<SupportTicketProps> {
    return { ...this.props };
  }

  private transitionTo(next: SupportTicketStatus, now: Date): void {
    if (!allowedTransitions[this.props.status].includes(next)) throw new Error("SUPPORT_TICKET_STATE_TRANSITION_INVALID");
    this.props = { ...this.props, status: next, updatedAt: now };
  }
}
