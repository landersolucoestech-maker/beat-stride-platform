import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { OperationsService } from "./operations.service.js";

const workStatusSchema = z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"]);
const listSchema = z.object({
  status: workStatusSchema.optional(),
  workType: z.string().trim().min(1).max(120).optional(),
  assignedUserId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});
const assignSchema = z.object({
  assignedUserId: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
});
const transitionSchema = z.object({
  status: workStatusSchema,
  expectedVersion: z.number().int().positive(),
  blockedReason: z.string().trim().min(1).max(2000).optional(),
  resolution: z.string().trim().min(1).max(4000).optional(),
});

@ApiTags("backoffice-operations")
@ApiBearerAuth()
@Controller("backoffice/operations")
export class OperationsController {
  constructor(
    private readonly operations: OperationsService,
    private readonly sessions: SessionService,
  ) {}

  @Get("work-items")
  @ApiOperation({ summary: "List internal operation work items" })
  async list(
    @Headers("authorization") authorization: string | undefined,
    @Query() query: Record<string, unknown>,
  ) {
    await this.sessions.requireSystemPermission(authorization, "backoffice.work.read");
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) this.invalidRequest(parsed.error);
    return this.operations.list({
      limit: parsed.data.limit,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.workType ? { workType: parsed.data.workType } : {}),
      ...(parsed.data.assignedUserId ? { assignedUserId: parsed.data.assignedUserId } : {}),
    });
  }

  @Get("work-items/:workItemId")
  @ApiOperation({ summary: "Get an internal operation work item" })
  async get(
    @Headers("authorization") authorization: string | undefined,
    @Param("workItemId") workItemId: string,
  ) {
    await this.sessions.requireSystemPermission(authorization, "backoffice.work.read");
    const id = z.string().uuid().safeParse(workItemId);
    if (!id.success) this.invalidRequest(id.error);
    return this.operations.get(id.data);
  }

  @Patch("work-items/:workItemId/assignment")
  @ApiOperation({ summary: "Assign an internal operation work item" })
  async assign(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("workItemId") workItemId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "backoffice.work.manage");
    const id = z.string().uuid().safeParse(workItemId);
    const parsed = assignSchema.safeParse(body);
    const correlationId = this.correlationId(correlationIdHeader);
    if (!id.success) this.invalidRequest(id.error);
    if (!parsed.success) this.invalidRequest(parsed.error);
    return this.operations.assign({
      workItemId: id.data,
      actorUserId: context.user.id,
      correlationId,
      ...parsed.data,
    });
  }

  @Patch("work-items/:workItemId/status")
  @ApiOperation({ summary: "Transition an internal operation work item" })
  async transition(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("workItemId") workItemId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "backoffice.work.manage");
    const id = z.string().uuid().safeParse(workItemId);
    const parsed = transitionSchema.safeParse(body);
    const correlationId = this.correlationId(correlationIdHeader);
    if (!id.success) this.invalidRequest(id.error);
    if (!parsed.success) this.invalidRequest(parsed.error);
    return this.operations.transition({
      workItemId: id.data,
      actorUserId: context.user.id,
      correlationId,
      nextStatus: parsed.data.status,
      expectedVersion: parsed.data.expectedVersion,
      ...(parsed.data.blockedReason ? { blockedReason: parsed.data.blockedReason } : {}),
      ...(parsed.data.resolution ? { resolution: parsed.data.resolution } : {}),
    });
  }

  private correlationId(value: string | undefined): string {
    const parsed = z.string().uuid().safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({ code: "CORRELATION_ID_REQUIRED", message: "A valid X-Correlation-Id header is required" });
    }
    return parsed.data;
  }

  private invalidRequest(error: z.ZodError): never {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request is invalid",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
}
