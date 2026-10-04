import { apiRequest, isApiConfigured } from "@/lib/api-client";

import type { SupportKnowledgeBase, SupportPriority, SupportTicketOverview } from "./support.types";

export interface SupportGateway {
  listTickets(): Promise<SupportTicketOverview>;
  createTicket(input: { subject: string; description: string; priority: SupportPriority }): Promise<{ ticketId: string }>;
  getKnowledgeBase(): Promise<SupportKnowledgeBase>;
}

class HttpSupportGateway implements SupportGateway {
  async listTickets(): Promise<SupportTicketOverview> {
    if (!isApiConfigured()) return { available: false, items: [] };
    return this.getJson<SupportTicketOverview>("/api/v1/support/tickets");
  }

  async createTicket(input: { subject: string; description: string; priority: SupportPriority }): Promise<{ ticketId: string }> {
    if (!isApiConfigured()) throw new Error("SUPPORT_API_NOT_CONNECTED");
    const response = await apiRequest("/api/v1/support/tickets", { method: "POST", body: JSON.stringify(input) });
    return (await response.json()) as { ticketId: string };
  }

  async getKnowledgeBase(): Promise<SupportKnowledgeBase> {
    if (!isApiConfigured()) return { available: false, articles: [] };
    return this.getJson<SupportKnowledgeBase>("/api/v1/support/knowledge-base");
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await apiRequest(path);
    return (await response.json()) as T;
  }
}

export const supportGateway: SupportGateway = new HttpSupportGateway();
