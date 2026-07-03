/**
 * Local development PostgreSQL via embedded-postgres.
 *
 * Downloads a real PostgreSQL binary (first run only) and runs it from a local
 * `.pgdata` folder — no system install, no Docker, no cloud. Prints the
 * DATABASE_URL and stays alive so the API server / drizzle-kit can connect.
 *
 *   pnpm --filter @workspace/scripts run pg:dev
 *
 * Stop with Ctrl-C. Data persists in scripts/.pgdata between runs.
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", ".pgdata");
const PORT = Number(process.env.PG_PORT ?? 5433);
const DB_NAME = "presidential";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
  // Force UTF-8 + C locale so the cluster can store Arabic, Latin accents, etc.
  // (Windows' default Arabic locale would otherwise pick WIN1256.)
  initdbFlags: ["--encoding=UTF8", "--no-locale"],
});

async function main() {
  const isFresh = !fs.existsSync(DATA_DIR);
  if (isFresh) {
    console.log("Initialising PostgreSQL data dir (first run, downloading binary)…");
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
  } catch {
    /* database already exists — fine */
  }
  const url = `postgres://postgres:postgres@localhost:${PORT}/${DB_NAME}`;
  console.log("EMBEDDED_PG_READY " + url);

  const stop = async () => {
    try { await pg.stop(); } catch { /* noop */ }
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  // Keep the process (and the DB) alive — an active timer holds the event loop
  // open even when stdin is not a TTY (e.g. running detached in the background).
  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
