import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { CatalogController } from "./catalog.controller.js";
import { CatalogService } from "./catalog.service.js";

@Module({
  imports: [SessionModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
