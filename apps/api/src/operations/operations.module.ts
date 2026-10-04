import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { OperationsController } from "./operations.controller.js";
import { OperationsService } from "./operations.service.js";

@Module({
  imports: [SessionModule],
  controllers: [OperationsController],
  providers: [OperationsService],
})
export class OperationsModule {}
