import { Module } from "@nestjs/common";

import { SessionModule } from "../session/session.module.js";
import { SubmissionController } from "./submission.controller.js";
import { SubmissionService } from "./submission.service.js";

@Module({
  imports: [SessionModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
