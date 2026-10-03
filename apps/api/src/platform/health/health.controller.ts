import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiResponse, ApiTags } from "@nestjs/swagger";

import { DatabaseService } from "../database/database.service.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get("live")
  @ApiOkResponse({ description: "Process is alive." })
  live(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  @ApiOkResponse({ description: "Application and required dependencies are ready." })
  @ApiResponse({ status: 503, description: "A required dependency is not ready." })
  async ready(): Promise<{ status: "ok"; dependencies: { database: "ok" } }> {
    if (!this.database.isConfigured()) {
      throw new ServiceUnavailableException({
        code: "DATABASE_NOT_CONFIGURED",
        message: "Database is required for readiness",
      });
    }

    if (!(await this.database.ping())) {
      throw new ServiceUnavailableException({
        code: "DATABASE_UNAVAILABLE",
        message: "Database is unavailable",
      });
    }

    return { status: "ok", dependencies: { database: "ok" } };
  }
}
