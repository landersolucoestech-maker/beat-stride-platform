import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { SessionService } from "../session/session.service.js";
import { RiskService } from "./risk.service.js";

@ApiTags("risk")
@ApiBearerAuth()
@Controller("risk")
export class RiskController {
  constructor(
    private readonly risk: RiskService,
    private readonly sessions: SessionService,
  ) {}

  @Get("overview")
  @ApiOperation({ summary: "Get customer-safe anti-fraud risk overview for the active organization" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "risk.summary.read");
    return this.risk.getOverview(context.activeOrganization.organizationId);
  }
}
