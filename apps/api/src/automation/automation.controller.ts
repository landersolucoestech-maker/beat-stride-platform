import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { AutomationService } from "./automation.service.js";

const statusSchema = z.enum(["PENDING", "RUNNING", "AWAITING_APPROVAL", "SUCCEEDED", "FAILED", "CANCELLED"]);
const listSchema = z.object({ status: statusSchema.optional(), limit: z.coerce.number().int().min(1).max(200).default(100) });
const requestSchema = z.object({
  organizationId: z.string().uuid().nullable().default(null),
  automationType: z.string().trim().min(1).max(160),
  autonomyMode: z.enum(["AUTO", "CONTROLLED", "APPROVAL_GATED"]),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  resourceType: z.string().trim().min(1).max(120).nullable().default(null),
  resourceId: z.string().uuid().nullable().default(null),
  inputSummary: z.record(z.string(), z.unknown()).default({}),
});
const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().min(1).max(4000),
  expectedVersion: z.number().int().positive(),
});
const cancelSchema = z.object({ expectedVersion: z.number().int().positive() });

@ApiTags("backoffice-automation")
@ApiBearerAuth()
@Controller("backoffice/automation")
export class AutomationController {
  constructor(
    private readonly automation: AutomationService,
    private readonly sessions: SessionService,
  ) {}

  @Get("runs")
  @ApiOperation({ summary: "List controlled automation runs" })
  async list(@Headers("authorization") authorization: string | undefined, @Query() query: Record<string, unknown>) {
    await this.sessions.requireSystemPermission(authorization, "automation.run.read");
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) this.invalid(parsed.error);
    return this.automation.list({
      limit: parsed.data.limit,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    });
  }

  @Get("runs/:runId")
  @ApiOperation({ summary: "Get an automation run with approval and tool history" })
  async get(@Headers("authorization") authorization: string | undefined, @Param("runId") runId: string) {
    await this.sessions.requireSystemPermission(authorization, "automation.run.read");
    return this.automation.get(this.uuid(runId));
  }

  @Post("runs")
  @ApiOperation({ summary: "Request a controlled automation run without executing an external AI provider" })
  async request(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "automation.run.manage");
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.automation.request({
      ...parsed.data,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
    });
  }

  @Patch("runs/:runId/approval")
  @ApiOperation({ summary: "Approve or reject an approval-gated automation run" })
  async decide(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("runId") runId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "automation.run.approve");
    const parsed = decisionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.automation.decide({
      runId: this.uuid(runId),
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...parsed.data,
    });
  }

  @Patch("runs/:runId/cancel")
  @ApiOperation({ summary: "Cancel a pending or active automation run" })
  async cancel(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("runId") runId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "automation.run.manage");
    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.automation.cancel({
      runId: this.uuid(runId),
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      expectedVersion: parsed.data.expectedVersion,
    });
  }

  private uuid(value: string | undefined): string {
    const parsed = z.string().uuid().safeParse(value);
    if (!parsed.success) throw new BadRequestException({ code: "INVALID_UUID", message: "A valid UUID is required" });
    return parsed.data;
  }

  private invalid(error: z.ZodError): never {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "Request is invalid",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
}
