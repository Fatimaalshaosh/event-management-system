---
name: API server testing
description: How unit tests are set up for the api-server artifact and why logic lives in pure helpers.
---

# API server testing

Unit tests run with **vitest** (root devDependency). The api-server has a `test`
script (`vitest run`); run it with `pnpm --filter @workspace/api-server run test`.
Tests are co-located as `*.test.ts` next to the code under test in
`artifacts/api-server/src/lib/`.

**Convention:** put business logic (readiness recompute, ops-room aggregation,
alert derivation) in **pure helper modules** under `src/lib/` that take plain
data and return plain data. Route handlers stay thin and just do DB I/O + call
the helper.

**Why:** route files import `@workspace/db`, which opens a Postgres pool on
import and needs `DATABASE_URL`. Importing a route into a test would require a
live DB. Pure helpers have no db import, so tests stay fast and DB-free. When
adding new testable logic, extract it to `src/lib/` rather than testing the
route directly.

## Integration tests (DB-backed)

`vitest.config.ts` defines two projects so `vitest run` runs both:
- **unit** — `src/**/*.test.ts` (excludes integration), no DB.
- **integration** — `src/**/*.integration.test.ts`, runs the real Express app
  via `supertest` against a disposable Postgres DB.

The disposable DB is `<dbname>_test` (e.g. `heliumdb_test`). A `globalSetup`
script connects to the real DB (admin), DROP+CREATE the `_test` DB, then runs
`drizzle-kit push-force` to install the live Drizzle schema into it. The
integration project sets `test.env.DATABASE_URL` to the `_test` URL so the app's
pool binds to it. `test.env` only affects test workers, NOT the main process
that runs config + globalSetup — so globalSetup still sees the real admin URL
and derives both URLs itself (helpers in `src/test/testDb.ts`, idempotent).

**Why this matters:** pushing the actual schema means a route referencing a
table/column that doesn't exist surfaces as a 500 → test failure. Pure-logic
tests cannot catch such schema/wiring mismatches.

**Gotchas:** call `pool.end()` in `afterAll` to avoid a hanging handle. Request
bodies must satisfy the generated Zod schemas (e.g. `CreateTaskBody` requires
`priority`). Needs `DATABASE_URL` set and CREATE DATABASE privilege (works on
Replit's local `helium` Postgres).
