import { Module } from "@nestjs/common";

import { ContentIdController } from "./content-id.controller.js";
import { ContentIdService } from "./content-id.service.js";

@Module({
  controllers: [ContentIdController],
  providers: [ContentIdService],
})
export class ContentIdModule {}
