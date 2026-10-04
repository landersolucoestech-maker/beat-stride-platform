import { Module } from "@nestjs/common";

import { CreatorsIntegrationController } from "./creators-integration.controller.js";
import { CreatorsIntegrationService } from "./creators-integration.service.js";

@Module({
  controllers: [CreatorsIntegrationController],
  providers: [CreatorsIntegrationService],
})
export class CreatorsIntegrationModule {}
