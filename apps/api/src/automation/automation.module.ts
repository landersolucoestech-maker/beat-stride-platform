import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { AutomationController } from "./automation.controller.js";
import { AutomationService } from "./automation.service.js";

@Module({
  imports: [SessionModule],
  controllers: [AutomationController],
  providers: [AutomationService],
})
export class AutomationModule {}
