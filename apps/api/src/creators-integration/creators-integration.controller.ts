import { Controller, Delete, Get, Headers, ServiceUnavailableException } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { SessionService } from "../session/session.service.js";
import { CreatorsIntegrationService } from "./creators-integration.service.js";

@ApiTags("creators-integration")
@ApiBearerAuth()
@Controller("integrations/creators")
export class CreatorsIntegrationController {
  constructor(
    private readonly creators: CreatorsIntegrationService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the Lander Creators integration projection for the active organization" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationContext(authorization, organizationId);
    return this.creators.getOverview(context.activeOrganization.organizationId);
  }

  @Delete()
  @ApiOperation({ summary: "Disconnect Lander Creators after upstream token revocation" })
  @ApiResponse({ status: 503, description: "Creators provider contract is not configured" })
  async disconnect(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ): Promise<never> {
    await this.sessions.requireOrganizationContext(authorization, organizationId);
    throw new ServiceUnavailableException({
      code: "CREATORS_PROVIDER_NOT_CONFIGURED",
      message: "Creators disconnect requires the upstream authorization provider contract",
    });
  }
}
