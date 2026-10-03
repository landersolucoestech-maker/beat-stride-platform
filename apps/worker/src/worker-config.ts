import { z } from "zod";

const workerConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().min(250).max(60_000).default(1_000),
  OUTBOX_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(50).default(5),
});

export type WorkerConfig = z.infer<typeof workerConfigSchema>;

export function loadWorkerConfig(environment: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const parsed = workerConfigSchema.safeParse(environment);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`WORKER_CONFIG_INVALID: ${details}`);
  }
  return parsed.data;
}
