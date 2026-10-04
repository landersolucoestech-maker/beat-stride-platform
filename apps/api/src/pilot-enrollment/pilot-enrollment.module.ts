import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { PilotEnrollmentController } from "./pilot-enrollment.controller.js";
import { PilotEnrollmentService } from "./pilot-enrollment.service.js";

@Module({
  imports: [SessionModule],
  controllers: [PilotEnrollmentController],
  providers: [PilotEnrollmentService],
})
export class PilotEnrollmentModule {}
