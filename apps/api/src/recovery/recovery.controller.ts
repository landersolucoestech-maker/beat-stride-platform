import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { RecoveryService } from "./recovery.service.js";

const listSchema = z.object({ limit: z.coerce.number().int().min(1).max(200).default(100) });
const planSchema = z.object({
  exerciseType: z.enum(["BACKUP_RESTORE", "FAILOVER", "DATA_RECOVERY"]),
  environment: z.string().trim().min(1).max(120),
  restorePointAt: z.string().datetime().optional(),
  notes: z.string().trim().min(1).max(4000).optional(),
});
const transitionSchema = z.object({ expectedVersion: z.number().int().positive() });
const completeSchema = z.object({
  outcome: z.enum(["PASSED", "FAILED"]),
  expectedVersion: z.number().int().positive(),
  evidenceReference: z.string().trim().min(1).max(1000),
  notes: z.string().trim().min(1).max(4000).optional(),
  resultSummary: z.record(z.string(), z.unknown()).default({}),
});

@ApiTags("backoffice-recovery")
@ApiBearerAuth()
@Controller("backoffice/recovery")
export class RecoveryController {
  constructor(
    private readonly recovery: RecoveryService,
    private readonly sessions: SessionService,
  ) {}

  @Get("exercises")
  @ApiOperation({ summary: "List disaster recovery exercises" })
  async list(@Headers("authorization") authorization: string | undefined, @Query() query: Record<string, unknown>) {
    await this.sessions.requireSystemPermission(authorization, "recovery.exercise.read");
    const parsed = listSchema.safeParse(query);
    if (!parsed.success) this.invalid(parsed.error);
    return this.recovery.list(parsed.data.limit);
  }

  @Post("exercises")
  @ApiOperation({ summary: "Plan a disaster recovery exercise" })
  async plan(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "recovery.exercise.manage");
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.recovery.plan({
      exerciseType: parsed.data.exerciseType,
      environment: parsed.data.environment,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...(parsed.data.restorePointAt ? { restorePointAt: parsed.data.restorePointAt } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
    });
  }

  @Patch("exercises/:exerciseId/start")
  @ApiOperation({ summary: "Start a planned disaster recovery exercise" })
  async start(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("exerciseId") exerciseId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "recovery.exercise.manage");
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.recovery.start({
      exerciseId: this.uuid(exerciseId),
      expectedVersion: parsed.data.expectedVersion,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
    });
  }

  @Patch("exercises/:exerciseId/complete")
  @ApiOperation({ summary: "Complete a running disaster recovery exercise with evidence" })
  async complete(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("exerciseId") exerciseId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "recovery.exercise.manage");
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.recovery.complete({
      exerciseId: this.uuid(exerciseId),
      outcome: parsed.data.outcome,
      expectedVersion: parsed.data.expectedVersion,
      evidenceReference: parsed.data.evidenceReference,
      resultSummary: parsed.data.resultSummary,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
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
