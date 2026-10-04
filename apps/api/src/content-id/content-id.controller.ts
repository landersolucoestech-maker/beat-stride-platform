import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { SessionService } from "../session/session.service.js";
import { ContentIdService } from "./content-id.service.js";

@ApiTags("content-id")
@ApiBearerAuth()
@Controller("content-id")
export class ContentIdController {
  constructor(
    private readonly contentId: ContentIdService,
    private readonly sessions: SessionService,
  ) {}

  @Get("overview")
  @ApiOperation({ summary: "Get Content ID enrollments and UGC allowlist for the active organization" })
  @ApiResponse({ status: 200, description: "Content ID overview" })
  async overview(
    @Headers("authorization") authorization: string | undefined,
    @Headers("x-organization-id") organizationId: string | undefined,
  ) {
    const context = await this.sessions.requireOrganizationPermission(authorization, organizationId, "content_id.read");
    return this.contentId.getOverview(context.activeOrganization.organizationId);
  }
}
