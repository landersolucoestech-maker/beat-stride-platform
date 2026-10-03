import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

@Injectable()
export class WorkerRuntimeService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(WorkerRuntimeService.name);

  onApplicationBootstrap(): void {
    this.logger.log("Worker runtime started");
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`Worker runtime stopping${signal ? ` (${signal})` : ""}`);
  }
}
