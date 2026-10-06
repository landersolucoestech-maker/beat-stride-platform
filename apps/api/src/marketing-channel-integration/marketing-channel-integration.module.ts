import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { MarketingChannelIntegrationController } from "./marketing-channel-integration.controller.js";
import { MarketingChannelIntegrationService } from "./marketing-channel-integration.service.js";

@Module({
  imports: [SessionModule],
  controllers: [MarketingChannelIntegrationController],
  providers: [MarketingChannelIntegrationService],
})
export class MarketingChannelIntegrationModule {}
