import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { ContentIdController } from "./content-id.controller.js";
import { ContentIdService } from "./content-id.service.js";

@Module({
  imports: [SessionModule],
  controllers: [ContentIdController],
  providers: [ContentIdService],
})
export class ContentIdModule {}
