import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { SessionService } from "../session/session.service.js";
import { MarketingService } from "./marketing.service.js";

@ApiTags("marketing")
@ApiBearerAuth()
@Controller("marketing")
export class MarketingController {
  constructor(
    private readonly marketing: MarketingService,
    private readonly sessions: SessionService,
  ) {}

  @Get("overview")
  @ApiOperation({ summary: "Get native marketing overview for the active organization" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.marketing.getOverview(context.activeOrganization.organizationId);
  }

  @Get("smart-links")
  @ApiOperation({ summary: "List Smart Links for the active organization" })
  async smartLinks(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.marketing.getSmartLinks(context.activeOrganization.organizationId);
  }

  @Get("fans")
  @ApiOperation({ summary: "Get fan contact projection when a consented source is configured" })
  async fans(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.marketing.getFanList();
  }

  @Get("tools")
  @ApiOperation({ summary: "Get enabled native marketing tools" })
  async tools(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.marketing.getTools();
  }
}
