import { Module } from "@nestjs/common";

import { ArtistIdentityModule } from "./artist-identity/artist-identity.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { CatalogModule } from "./catalog/catalog.module.js";
import { DatabaseModule } from "./platform/database/database.module.js";
import { HealthModule } from "./platform/health/health.module.js";
import { RightsProtectionModule } from "./rights-protection/rights-protection.module.js";
import { SessionModule } from "./session/session.module.js";
import { SubmissionModule } from "./submission/submission.module.js";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    SessionModule,
    AuthModule,
    ArtistIdentityModule,
    CatalogModule,
    RightsProtectionModule,
    SubmissionModule,
  ],
})
export class AppModule {}
