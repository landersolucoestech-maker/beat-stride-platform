import { Injectable, OnModuleDestroy, ServiceUnavailableException } from "@nestjs/common";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

import { loadRuntimeConfig } from "../config/runtime-config.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool | null;

  constructor() {
    const config = loadRuntimeConfig();
    this.pool = config.DATABASE_URL
      ? new Pool({
          connectionString: config.DATABASE_URL,
          max: 10,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        })
      : null;
  }

  isConfigured(): boolean {
    return this.pool !== null;
  }

  async query<TRow extends QueryResultRow>(text: string, values: readonly unknown[] = []): Promise<QueryResult<TRow>> {
    if (!this.pool) {
      throw new ServiceUnavailableException({
        code: "DATABASE_NOT_CONFIGURED",
        message: "Database is not configured for this environment",
      });
    }
    return this.pool.query<TRow>(text, [...values]);
  }

  async ping(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) await this.pool.end();
  }
}
