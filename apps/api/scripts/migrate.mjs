import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const migrationsDirectory = process.env.MIGRATIONS_DIR
  ? path.resolve(process.env.MIGRATIONS_DIR)
  : path.resolve(process.cwd(), "../../packages/database/migrations");

const advisoryLockId = 82374612;
const client = new Client({ connectionString: databaseUrl });

function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function run() {
  await client.connect();
  await client.query("SELECT pg_advisory_lock($1)", [advisoryLockId]);

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        migration_name text PRIMARY KEY,
        checksum_sha256 char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((file) => /^\d+_.+\.sql$/.test(file))
      .sort((left, right) => left.localeCompare(right));

    for (const file of files) {
      const sql = await readFile(path.join(migrationsDirectory, file), "utf8");
      const hash = checksum(sql);
      const existing = await client.query(
        "SELECT checksum_sha256 FROM schema_migrations WHERE migration_name = $1",
        [file],
      );

      if (existing.rows[0]) {
        if (existing.rows[0].checksum_sha256 !== hash) {
          throw new Error(`MIGRATION_CHECKSUM_MISMATCH:${file}`);
        }
        process.stdout.write(`skip ${file}\n`);
        continue;
      }

      process.stdout.write(`apply ${file}\n`);
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (migration_name, checksum_sha256) VALUES ($1, $2)",
        [file, hash],
      );
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [advisoryLockId]).catch(() => undefined);
    await client.end();
  }
}

await run();
