import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

import { loadWorkerConfig } from "./worker-config.js";

@Injectable()
export class WorkerDatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const config = loadWorkerConfig();
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  query<TRow extends QueryResultRow>(text: string, values: readonly unknown[] = []): Promise<QueryResult<TRow>> {
    return this.pool.query<TRow>(text, [...values]);
  }

  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
