import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { MarketingController } from "./marketing.controller.js";
import { PublicMarketingController } from "./public-marketing.controller.js";
import { MarketingService } from "./marketing.service.js";

@Module({
  imports: [SessionModule],
  controllers: [MarketingController, PublicMarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
