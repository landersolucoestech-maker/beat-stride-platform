import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { PilotConfigurationController } from "./pilot-configuration.controller.js";
import { PilotConfigurationService } from "./pilot-configuration.service.js";

@Module({
  imports: [SessionModule],
  controllers: [PilotConfigurationController],
  providers: [PilotConfigurationService],
})
export class PilotConfigurationModule {}
