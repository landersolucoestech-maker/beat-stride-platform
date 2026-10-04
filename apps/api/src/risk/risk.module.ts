import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { RiskController } from "./risk.controller.js";
import { RiskService } from "./risk.service.js";

@Module({
  imports: [SessionModule],
  controllers: [RiskController],
  providers: [RiskService],
})
export class RiskModule {}
