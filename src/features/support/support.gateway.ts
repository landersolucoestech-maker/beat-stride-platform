import type { SupportKnowledgeBase, SupportPriority, SupportTicketOverview } from "./support.types";

export interface SupportGateway {
  listTickets(): Promise<SupportTicketOverview>;
  createTicket(input: { subject: string; description: string; priority: SupportPriority }): Promise<{ ticketId: string }>;
  getKnowledgeBase(): Promise<SupportKnowledgeBase>;
}

class HttpSupportGateway implements SupportGateway {
  constructor(private readonly baseUrl: string | null) {}

  async listTickets(): Promise<SupportTicketOverview> {
    if (!this.baseUrl) return { available: false, items: [] };
    return this.getJson<SupportTicketOverview>("/api/v1/support/tickets");
  }

  async createTicket(input: { subject: string; description: string; priority: SupportPriority }): Promise<{ ticketId: string }> {
    if (!this.baseUrl) throw new Error("SUPPORT_API_NOT_CONNECTED");
    const response = await fetch(this.url("/api/v1/support/tickets"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`SUPPORT_TICKET_CREATE_FAILED:${response.status}`);
    return (await response.json()) as { ticketId: string };
  }

  async getKnowledgeBase(): Promise<SupportKnowledgeBase> {
    if (!this.baseUrl) return { available: false, articles: [] };
    return this.getJson<SupportKnowledgeBase>("/api/v1/support/knowledge-base");
  }

  private url(path: string): string {
    if (!this.baseUrl) throw new Error("SUPPORT_API_NOT_CONNECTED");
    return `${this.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(this.url(path), { credentials: "include", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`SUPPORT_REQUEST_FAILED:${response.status}`);
    return (await response.json()) as T;
  }
}

const configuredBaseUrl = typeof import.meta.env.VITE_API_BASE_URL === "string" && import.meta.env.VITE_API_BASE_URL.length > 0
  ? import.meta.env.VITE_API_BASE_URL
  : null;

export const supportGateway: SupportGateway = new HttpSupportGateway(configuredBaseUrl);
