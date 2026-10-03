import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { ArtistIdentityController } from "./artist-identity.controller.js";
import { ArtistIdentityService } from "./artist-identity.service.js";

@Module({
  imports: [SessionModule],
  controllers: [ArtistIdentityController],
  providers: [ArtistIdentityService],
})
export class ArtistIdentityModule {}
