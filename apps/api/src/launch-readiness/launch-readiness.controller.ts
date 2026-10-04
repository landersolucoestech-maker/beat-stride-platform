import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { LaunchReadinessService } from "./launch-readiness.service.js";

const gateSchema = z.enum(["PRODUCTION_READINESS", "PILOT", "PRODUCTION"]);
const evidenceSchema = z.object({
  status: z.enum(["PENDING", "BLOCKED", "PASSED", "FAILED"]),
  evidenceReference: z.string().trim().min(1).max(2000).optional(),
  notes: z.string().trim().min(1).max(8000).optional(),
});
const decisionSchema = z.object({
  gate: z.enum(["PILOT", "PRODUCTION"]),
  decision: z.enum(["APPROVED", "REJECTED"]),
  commitSha: z.string().regex(/^[A-Fa-f0-9]{40}$/),
  migrationVersion: z.string().trim().min(1).max(120),
  providerConfigurationVersion: z.string().trim().min(1).max(240).optional(),
  acceptedRisks: z.array(z.unknown()).default([]),
  rollbackTarget: z.string().trim().min(1).max(1000),
  notes: z.string().trim().min(1).max(8000).optional(),
});
const decisionQuerySchema = z.object({ gate: z.enum(["PILOT", "PRODUCTION"]).optional() });

@ApiTags("backoffice-launch-readiness")
@ApiBearerAuth()
@Controller("backoffice/launch-readiness")
export class LaunchReadinessController {
  constructor(
    private readonly launchReadiness: LaunchReadinessService,
    private readonly sessions: SessionService,
  ) {}

  @Get("gates/:gate")
  @ApiOperation({ summary: "Get launch gate status and evidence" })
  async gate(
    @Headers("authorization") authorization: string | undefined,
    @Param("gate") gate: string,
  ) {
    await this.sessions.requireSystemPermission(authorization, "launch.readiness.read");
    const parsed = gateSchema.safeParse(gate);
    if (!parsed.success) this.invalid(parsed.error);
    return this.launchReadiness.getGate(parsed.data);
  }

  @Put("requirements/:requirementKey/evidence")
  @ApiOperation({ summary: "Record immutable launch requirement evidence" })
  async evidence(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("requirementKey") requirementKey: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "launch.readiness.manage");
    const parsed = evidenceSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.launchReadiness.recordEvidence({
      requirementKey,
      status: parsed.data.status,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...(parsed.data.evidenceReference ? { evidenceReference: parsed.data.evidenceReference } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
    });
  }

  @Get("decisions")
  @ApiOperation({ summary: "List pilot and production launch decisions" })
  async decisions(
    @Headers("authorization") authorization: string | undefined,
    @Query() query: Record<string, unknown>,
  ) {
    await this.sessions.requireSystemPermission(authorization, "launch.readiness.read");
    const parsed = decisionQuerySchema.safeParse(query);
    if (!parsed.success) this.invalid(parsed.error);
    return this.launchReadiness.listDecisions(parsed.data.gate);
  }

  @Post("decisions")
  @ApiOperation({ summary: "Approve or reject a pilot or production launch gate" })
  async decide(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "launch.decision.approve");
    const parsed = decisionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.launchReadiness.decide({
      gate: parsed.data.gate,
      decision: parsed.data.decision,
      commitSha: parsed.data.commitSha,
      migrationVersion: parsed.data.migrationVersion,
      acceptedRisks: parsed.data.acceptedRisks,
      rollbackTarget: parsed.data.rollbackTarget,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...(parsed.data.providerConfigurationVersion ? { providerConfigurationVersion: parsed.data.providerConfigurationVersion } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
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
