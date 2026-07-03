# Presidential Protocol & Events Management Platform

A UAE government luxury executive platform for senior protocol officers to manage presidential events, official visits, approvals, VIPs, and ceremonial logistics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/presidential-protocol run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run test` — run api-server unit + integration tests (integration tests provision a disposable `<dbname>_test` Postgres database and exercise the real Express app)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, wouter, framer-motion, Noto Sans Arabic
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema (events, visits, tasks, approvals, vips, calendar, invitations)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/presidential-protocol/src/` — React frontend
- `artifacts/presidential-protocol/src/index.css` — custom color palette and Noto Sans Arabic font

## Architecture decisions

- RTL-first layout (dir="rtl") for Arabic language throughout
- Custom Tailwind color palette: floral-white, castle-hill, mangrove, calm-teal, medium-wood, sunset — mapped to shadcn CSS variables
- OpenAPI-first: all types generated via Orval; frontend uses only generated hooks from `@workspace/api-client-react`
- Route handlers use Zod schemas from `@workspace/api-zod` for request validation
- Readiness categories are auto-seeded per event on creation

## Product

- **Dashboard**: KPI summary, event readiness tracker, AI insights, today's schedule
- **Events**: Full CRUD with per-category readiness breakdown
- **Official Visits**: Track incoming state delegations
- **Approvals**: Review and approve/reject protocol requests
- **VIPs**: Manage high-clearance guest profiles
- **Invitations**: Send and track event invitations with QR codes
- **Calendar**: Timeline view of all scheduled entries
- **Reports**: Quick export (PDF, Excel, CSV, Attendance)

## User preferences

- Arabic RTL interface throughout
- UAE government luxury aesthetic (calm authority, not SaaS)
- No emojis — use lucide-react icons only
- Custom color palette must be preserved: floral-white, castle-hill, mangrove, calm-teal, medium-wood, sunset

## Gotchas

- After adding new DB schema files, run `pnpm run typecheck:libs` before typechecking the API server — the composite lib build must run first
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- Route handlers must use `{ res.status(X).json(...); return; }` pattern (not `return res.status(X)`) for TypeScript to be happy with Express 5 types

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
