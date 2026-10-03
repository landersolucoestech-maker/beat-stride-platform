import { Controller, Get, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("session")
@Controller("session")
export class SessionController {
  @Get()
  @ApiOperation({ summary: "Return the authenticated user and active organization context" })
  @ApiResponse({ status: 401, description: "Authentication is required" })
  getSession(): never {
    throw new UnauthorizedException({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required",
    });
  }
}
