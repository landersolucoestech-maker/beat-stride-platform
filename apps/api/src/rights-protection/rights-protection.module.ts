import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { RightsProtectionController } from "./rights-protection.controller.js";
import { RightsProtectionService } from "./rights-protection.service.js";

@Module({
  imports: [SessionModule],
  controllers: [RightsProtectionController],
  providers: [RightsProtectionService],
})
export class RightsProtectionModule {}
