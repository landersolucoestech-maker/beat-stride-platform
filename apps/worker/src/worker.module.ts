import { Module } from "@nestjs/common";

import { OutboxService } from "./outbox.service.js";
import { ReleaseSubmittedHandler } from "./release-submitted.handler.js";
import { WorkerDatabaseService } from "./worker-database.service.js";
import { WorkerRuntimeService } from "./worker-runtime.service.js";

@Module({
  providers: [WorkerDatabaseService, OutboxService, ReleaseSubmittedHandler, WorkerRuntimeService],
})
export class WorkerModule {}
