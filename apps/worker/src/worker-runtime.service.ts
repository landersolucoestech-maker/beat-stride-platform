import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { OutboxService } from "./outbox.service.js";
import { ReleaseSubmittedHandler } from "./release-submitted.handler.js";
import { loadWorkerConfig } from "./worker-config.js";

@Injectable()
export class WorkerRuntimeService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(WorkerRuntimeService.name);
  private readonly config = loadWorkerConfig();
  private stopped = false;
  private loopPromise: Promise<void> | null = null;

  constructor(
    private readonly outbox: OutboxService,
    private readonly releaseSubmitted: ReleaseSubmittedHandler,
  ) {}

  onApplicationBootstrap(): void {
    this.logger.log("Worker runtime started");
    this.loopPromise = this.runLoop();
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.stopped = true;
    this.logger.log(`Worker runtime stopping${signal ? ` (${signal})` : ""}`);
    await this.loopPromise;
  }

  private async runLoop(): Promise<void> {
    while (!this.stopped) {
      const event = await this.outbox.claimNext();
      if (!event) {
        await this.sleep(this.config.WORKER_POLL_INTERVAL_MS);
        continue;
      }

      try {
        if (this.releaseSubmitted.supports(event)) {
          await this.releaseSubmitted.handle(event);
        } else {
          throw new Error(`OUTBOX_EVENT_HANDLER_NOT_FOUND:${event.eventType}:v${event.eventVersion}`);
        }
        await this.outbox.markProcessed(event.id);
      } catch (error) {
        await this.outbox.markFailed(event, error);
      }
    }
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
