import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { SupportController } from "./support.controller.js";
import { SupportService } from "./support.service.js";

@Module({
  imports: [SessionModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
