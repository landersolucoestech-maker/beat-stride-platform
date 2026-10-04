import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { CreatorsIntegrationController } from "./creators-integration.controller.js";
import { CreatorsIntegrationService } from "./creators-integration.service.js";

@Module({
  imports: [SessionModule],
  controllers: [CreatorsIntegrationController],
  providers: [CreatorsIntegrationService],
})
export class CreatorsIntegrationModule {}
