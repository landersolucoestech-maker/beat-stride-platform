import { Module } from "@nestjs/common";

import { DatabaseModule } from "../platform/database/database.module.js";
import { SessionModule } from "../session/session.module.js";
import { ProductionCutoverController } from "./production-cutover.controller.js";
import { ProductionCutoverService } from "./production-cutover.service.js";

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [ProductionCutoverController],
  providers: [ProductionCutoverService],
})
export class ProductionCutoverModule {}
