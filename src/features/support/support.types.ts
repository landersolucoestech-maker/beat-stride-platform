export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
export type SupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SupportTicketView {
  id: string;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketOverview {
  available: boolean;
  items: SupportTicketView[];
}

export interface SupportKnowledgeBase {
  available: boolean;
  articles: Array<{ id: string; title: string; summary: string; href: string }>;
}
