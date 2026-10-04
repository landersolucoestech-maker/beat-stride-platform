import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { LaunchReadinessController } from "./launch-readiness.controller.js";
import { LaunchReadinessService } from "./launch-readiness.service.js";

@Module({
  imports: [SessionModule],
  controllers: [LaunchReadinessController],
  providers: [LaunchReadinessService],
})
export class LaunchReadinessModule {}
