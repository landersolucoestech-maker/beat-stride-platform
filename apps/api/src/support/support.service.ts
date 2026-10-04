import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import type { QueryResultRow } from "pg";

import { DatabaseService } from "../platform/database/database.service.js";

interface SupportTicketRow extends QueryResultRow {
  id: string;
  subject: string;
  description: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "OPEN" | "WAITING_CUSTOMER" | "WAITING_INTERNAL" | "RESOLVED" | "CLOSED";
  created_at: Date;
  updated_at: Date;
}

type PortalPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

@Injectable()
export class SupportService {
  constructor(private readonly database: DatabaseService) {}

  async listTickets(organizationId: string) {
    const result = await this.database.query<SupportTicketRow>(
      `SELECT
         ticket.id,
         ticket.subject,
         first_message.body AS description,
         ticket.priority,
         ticket.status,
         ticket.created_at,
         ticket.updated_at
       FROM support_tickets ticket
       LEFT JOIN LATERAL (
         SELECT message.body
         FROM support_ticket_messages message
         WHERE message.ticket_id = ticket.id
         ORDER BY message.created_at ASC, message.id ASC
         LIMIT 1
       ) first_message ON TRUE
       WHERE ticket.organization_id = $1
       ORDER BY ticket.updated_at DESC, ticket.id DESC`,
      [organizationId],
    );

    return {
      available: true,
      items: result.rows.map((row) => ({
        id: row.id,
        subject: row.subject,
        description: row.description ?? "",
        priority: row.priority === "NORMAL" ? "MEDIUM" : row.priority,
        status: row.status === "WAITING_INTERNAL" ? "IN_PROGRESS" : row.status,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      })),
    };
  }

  async createTicket(input: {
    organizationId: string;
    userId: string;
    subject: string;
    description: string;
    priority: PortalPriority;
  }) {
    const ticketId = randomUUID();
    const now = new Date();
    const storedPriority = input.priority === "MEDIUM" ? "NORMAL" : input.priority;

    await this.database.transaction(async (client) => {
      await client.query(
        `INSERT INTO support_tickets
          (id, organization_id, opened_by_user_id, subject, category, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'GENERAL', $5, 'OPEN', $6, $6)`,
        [ticketId, input.organizationId, input.userId, input.subject, storedPriority, now],
      );

      await client.query(
        `INSERT INTO support_ticket_messages (id, ticket_id, author_user_id, body, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), ticketId, input.userId, input.description, now],
      );
    });

    return { ticketId };
  }
}
