import { Controller, Get, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { SessionService, type SessionContext } from "./session.service.js";

@ApiTags("session")
@ApiBearerAuth()
@Controller("session")
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  @Get()
  @ApiOperation({ summary: "Return the authenticated user and organization memberships" })
  @ApiResponse({ status: 200, description: "Current authenticated session context" })
  @ApiResponse({ status: 401, description: "Authentication is required" })
  getSession(@Headers("authorization") authorization: string | undefined): Promise<SessionContext> {
    return this.sessions.requireContext(authorization);
  }
}
