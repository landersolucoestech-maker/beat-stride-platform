import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { SessionService } from "../session/session.service.js";
import { RightsProtectionService } from "./rights-protection.service.js";

@ApiTags("rights-protection")
@ApiBearerAuth()
@Controller("rights-protection")
export class RightsProtectionController {
  constructor(
    private readonly rightsProtection: RightsProtectionService,
    private readonly sessions: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Return rights, representation, authority, protection and authorization state for the active organization" })
  @ApiResponse({ status: 200, description: "Organization rights and protection read model" })
  async list(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "rights.read");
    return this.rightsProtection.listForOrganization(context.activeOrganization.organizationId);
  }
}
