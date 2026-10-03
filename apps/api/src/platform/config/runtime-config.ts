import { z } from "zod";

const runtimeConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(24),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

export function loadRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const parsed = runtimeConfigSchema.safeParse(environment);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`RUNTIME_CONFIG_INVALID: ${details}`);
  }

  if (parsed.data.NODE_ENV === "production" && !parsed.data.DATABASE_URL) {
    throw new Error("RUNTIME_CONFIG_INVALID: DATABASE_URL is required in production");
  }

  return parsed.data;
}

export function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
