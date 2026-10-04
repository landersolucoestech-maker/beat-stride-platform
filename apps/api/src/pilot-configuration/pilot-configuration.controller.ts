import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { PilotConfigurationService } from "./pilot-configuration.service.js";

const createSchema = z.object({
  maxActiveOrganizations: z.number().int().min(1).max(10_000),
  maxReleasesPerOrganization: z.number().int().min(1).max(100_000),
  allowedDestinations: z.array(z.string().trim().min(1).max(120)).max(200).default([]),
  allowedTerritories: z.array(z.string().trim().min(2).max(3)).max(300).default([]),
  payoutLimitAmount: z.string().regex(/^\d+(\.\d{1,8})?$/).optional(),
  payoutLimitCurrency: z.string().regex(/^[A-Za-z]{3}$/).optional(),
  manualReviewRequired: z.boolean().default(true),
  distributionEnabled: z.boolean().default(false),
  payoutsEnabled: z.boolean().default(false),
  emergencyDisable: z.boolean().default(false),
});
const transitionSchema = z.object({ expectedVersion: z.number().int().positive() });

@ApiTags("backoffice-pilot-configuration")
@ApiBearerAuth()
@Controller("backoffice/pilot-configurations")
export class PilotConfigurationController {
  constructor(
    private readonly pilotConfigurations: PilotConfigurationService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List pilot configurations" })
  async list(@Headers("authorization") authorization: string | undefined) {
    await this.sessions.requireSystemPermission(authorization, "pilot.config.read");
    return this.pilotConfigurations.list();
  }

  @Post()
  @ApiOperation({ summary: "Create a draft pilot configuration" })
  async create(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "pilot.config.manage");
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.pilotConfigurations.create({
      maxActiveOrganizations: parsed.data.maxActiveOrganizations,
      maxReleasesPerOrganization: parsed.data.maxReleasesPerOrganization,
      allowedDestinations: parsed.data.allowedDestinations,
      allowedTerritories: parsed.data.allowedTerritories,
      manualReviewRequired: parsed.data.manualReviewRequired,
      distributionEnabled: parsed.data.distributionEnabled,
      payoutsEnabled: parsed.data.payoutsEnabled,
      emergencyDisable: parsed.data.emergencyDisable,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
      ...(parsed.data.payoutLimitAmount ? { payoutLimitAmount: parsed.data.payoutLimitAmount } : {}),
      ...(parsed.data.payoutLimitCurrency ? { payoutLimitCurrency: parsed.data.payoutLimitCurrency } : {}),
    });
  }

  @Patch(":configurationId/activate")
  @ApiOperation({ summary: "Activate a pilot configuration and retire the previous active configuration" })
  async activate(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("configurationId") configurationId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "pilot.config.manage");
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.pilotConfigurations.activate({
      configurationId: this.uuid(configurationId),
      expectedVersion: parsed.data.expectedVersion,
      actorUserId: context.user.id,
      correlationId: this.uuid(correlationIdHeader),
    });
  }

  @Patch(":configurationId/emergency-disable")
  @ApiOperation({ summary: "Emergency-disable distribution and payouts for the active pilot configuration" })
  async emergencyDisable(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-correlation-id") correlationIdHeader: string | undefined,
    @Param("configurationId") configurationId: string,
    @Body() body: unknown,
  ) {
    const context = await this.sessions.requireSystemPermission(authorization, "pilot.config.manage");
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) this.invalid(parsed.error);
    return this.pilotConfigurations.emergencyDisable({
      configurationId: this.uuid(configurationId),
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
