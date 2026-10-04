import { BadRequestException, Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { SupportService } from "./support.service.js";

const createTicketSchema = z.object({
  subject: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(10_000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

@ApiTags("support")
@ApiBearerAuth()
@Controller("support")
export class SupportController {
  constructor(
    private readonly support: SupportService,
    private readonly sessions: SessionService,
  ) {}

  @Get("tickets")
  @ApiOperation({ summary: "List support tickets for the active organization" })
  async listTickets(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.support.listTickets(context.activeOrganization.organizationId);
  }

  @Post("tickets")
  @ApiOperation({ summary: "Create a support ticket for the active organization" })
  @ApiResponse({ status: 201, description: "Support ticket created" })
  async createTicket(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Body() body: unknown,
  ) {
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: "INVALID_REQUEST",
        message: "Request body is invalid",
        details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }

    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.support.createTicket({
      organizationId: context.activeOrganization.organizationId,
      userId: context.user.id,
      ...parsed.data,
    });
  }

  @Get("knowledge-base")
  @ApiOperation({ summary: "Get published support knowledge base articles" })
  async knowledgeBase(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    await this.sessions.requireOrganizationContext(authorization, organizationId);
    return { available: false, articles: [] };
  }
}
