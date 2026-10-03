import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordHasher } from "./password-hasher.js";

@Module({
  imports: [SessionModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordHasher],
})
export class AuthModule {}
