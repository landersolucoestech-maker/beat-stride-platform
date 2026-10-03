import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./platform/database/database.module.js";
import { HealthModule } from "./platform/health/health.module.js";
import { SessionModule } from "./session/session.module.js";

@Module({
  imports: [DatabaseModule, HealthModule, SessionModule, AuthModule],
})
export class AppModule {}
