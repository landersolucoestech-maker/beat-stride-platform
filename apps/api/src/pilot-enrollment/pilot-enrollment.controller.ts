import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { PilotEnrollmentService } from "./pilot-enrollment.service.js";

const inviteSchema = z.object({
  organizationId: z.string().uuid(),
  releaseLimitOverride: z.number().int().positive().max(100_000).optional(),
  notes: z.string().trim().min(1).max(8000).optional(),
});
const transitionSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "EXITED"]),
  expectedVersion: z.number().int().positive(),
  notes: z.string().trim().min(1).max(8000).optional(),
});

@ApiTags("backoffice-pilot-enrollment")
@ApiBearerAuth()
@Controller("backoffice/pilot-configurations/:configurationId/enrollments")
export class PilotEnrollmentController {
  constructor(
    private readonly enrollments: PilotEnrollmentService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List organizations enrolled in a pilot configuration" })
  async list(
    @Headers("authorization") authorization: string | undefined,
    @Param("configurationId") configurationId: string,
  ) {
    await this.sessions.requireSystemPermission(authorization, "pilot.enrollment.read");
    return this.enrollments.list(this.uuid(configurationId));
  }

  @Post()
  @ApiOperation({ summary: "Invite an organization to a pilot configuration" })
  async invite(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("configurationId") configurationId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "pilot.enrollment.manage");
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.enrollments.invite({
      configurationId: this.uuid(configurationId),
      organizationId: parsed.data.organizationId,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...(parsed.data.releaseLimitOverride ? { releaseLimitOverride: parsed.data.releaseLimitOverride } : {}),
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
    });
  }

  @Patch(":enrollmentId/status")
  @ApiOperation({ summary: "Transition a pilot organization enrollment" })
  async transition(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("configurationId") configurationId: string,
    @Param("enrollmentId") enrollmentId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "pilot.enrollment.manage");
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.enrollments.transition({
      configurationId: this.uuid(configurationId),
      enrollmentId: this.uuid(enrollmentId),
      nextStatus: parsed.data.status,
      expectedVersion: parsed.data.expectedVersion,
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
