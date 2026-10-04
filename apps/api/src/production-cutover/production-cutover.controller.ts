import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { ProductionCutoverService } from "./production-cutover.service.js";

const prepareSchema = z.object({
  launchDecisionId: z.string().uuid(),
  configurationVersion: z.string().trim().min(1).max(240),
});
const transitionSchema = z.object({ expectedVersion: z.number().int().positive() });
const terminationSchema = transitionSchema.extend({
  action: z.enum(["ABORT", "ROLLBACK"]),
  reason: z.string().trim().min(1).max(4000),
});

@ApiTags("backoffice-production-cutover")
@ApiBearerAuth()
@Controller("backoffice/production-cutovers")
export class ProductionCutoverController {
  constructor(
    private readonly cutovers: ProductionCutoverService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List production cutovers" })
  async list(@Headers("authorization") authorization: string | undefined) {
    await this.sessions.requireSystemPermission(authorization, "production.cutover.read");
    return this.cutovers.list();
  }

  @Post()
  @ApiOperation({ summary: "Prepare a production cutover from an approved production decision" })
  async prepare(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "production.cutover.manage");
    const parsed = prepareSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.cutovers.prepare({
      launchDecisionId: parsed.data.launchDecisionId,
      configurationVersion: parsed.data.configurationVersion,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
    });
  }

  @Post(":cutoverId/activate")
  @ApiOperation({ summary: "Activate a prepared production cutover" })
  async activate(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("cutoverId") cutoverId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "production.cutover.manage");
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.cutovers.activate({
      cutoverId: this.uuid(cutoverId),
      expectedVersion: parsed.data.expectedVersion,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
    });
  }

  @Post(":cutoverId/terminate")
  @ApiOperation({ summary: "Abort a prepared cutover or roll back an active cutover" })
  async terminate(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("cutoverId") cutoverId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "production.cutover.manage");
    const parsed = terminationSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.cutovers.terminate({
      cutoverId: this.uuid(cutoverId),
      action: parsed.data.action,
      reason: parsed.data.reason,
      expectedVersion: parsed.data.expectedVersion,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
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
