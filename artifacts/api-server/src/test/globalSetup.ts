import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import {
  databaseNameFromUrl,
  deriveAdminDatabaseUrl,
  deriveTestDatabaseUrl,
} from "./testDb";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

// Provisions a disposable Postgres database for integration tests:
// 1. Connects to the real (admin) database.
// 2. Drops + recreates a `<dbname>_test` database for a clean slate.
// 3. Pushes the live Drizzle schema into it so route handlers run against
//    the same tables the app expects (catching schema/wiring mismatches).
export default async function setup() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL must be set to run integration tests");
  }

  const adminUrl = deriveAdminDatabaseUrl(raw);
  const testUrl = deriveTestDatabaseUrl(raw);
  const testDbName = databaseNameFromUrl(testUrl);

  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${testDbName}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${testDbName}"`);
  } finally {
    await admin.end();
  }

  execSync("pnpm --filter @workspace/db run push-force", {
    cwd: workspaceRoot,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });
}
