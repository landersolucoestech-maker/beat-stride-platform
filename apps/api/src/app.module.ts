import { Module } from "@nestjs/common";

import { DatabaseModule } from "./platform/database/database.module.js";
import { HealthModule } from "./platform/health/health.module.js";
import { SessionModule } from "./session/session.module.js";

@Module({
  imports: [DatabaseModule, HealthModule, SessionModule],
})
export class AppModule {}
