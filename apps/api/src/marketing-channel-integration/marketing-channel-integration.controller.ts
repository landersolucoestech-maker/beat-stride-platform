import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";

import { SessionService } from "../session/session.service.js";
import { MarketingChannelIntegrationService } from "./marketing-channel-integration.service.js";

const providerSchema = z.enum(["META", "TIKTOK", "YOUTUBE"]);

function parseProvider(value: string) {
  const parsed = providerSchema.safeParse(value);
  if (!parsed.success) {
    throw new BadRequestException({
      code: "INVALID_REQUEST",
      message: "provider must be META, TIKTOK or YOUTUBE",
    });
  }
  return parsed.data;
}

@ApiTags("marketing-integrations")
@ApiBearerAuth()
@Controller("integrations/marketing-channels")
export class MarketingChannelIntegrationController {
  constructor(
    private readonly integrations: MarketingChannelIntegrationService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get marketing publication channel integration state" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(
      authorization,
      organizationId,
      "marketing.integration.read",
    );
    return this.integrations.getOverview(context.activeOrganization.organizationId);
  }

  @Post(":provider/authorize")
  @ApiOperation({ summary: "Start OAuth authorization for a marketing publication provider" })
  @ApiResponse({ status: 503, description: "Provider authorization adapter is not configured" })
  async authorize(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("provider") provider: string,
  ) {
    await this.sessions.requireOrganizationPermission(
      authorization,
      organizationId,
      "marketing.integration.connect",
    );
    return this.integrations.beginAuthorization(parseProvider(provider));
  }

  @Delete(":provider")
  @ApiOperation({ summary: "Revoke a marketing publication provider connection" })
  @ApiResponse({ status: 503, description: "Provider revocation adapter is not configured" })
  async disconnect(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
    @Param("provider") provider: string,
  ) {
    await this.sessions.requireOrganizationPermission(
      authorization,
      organizationId,
      "marketing.integration.disconnect",
    );
    return this.integrations.disconnect(parseProvider(provider));
  }
}
