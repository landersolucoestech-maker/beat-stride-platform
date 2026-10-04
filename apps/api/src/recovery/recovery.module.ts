import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { RecoveryController } from "./recovery.controller.js";
import { RecoveryService } from "./recovery.service.js";

@Module({
  imports: [SessionModule],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}
