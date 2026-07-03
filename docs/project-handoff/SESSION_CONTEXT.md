# Session Context — Continue Without Asking

A future AI/dev should be able to continue immediately from this file.

## Where the app lives
- **Monorepo root:** `…/ReplitExport-fatimaomar21/Presidential-Protocol` (the real app).
- ⚠️ **Do NOT use** `…/Downloads/project` — that is a stale copy.
- Frontend app: `artifacts/presidential-protocol`. API: `artifacts/api-server`.
- Run: `pnpm -C <root> --filter @workspace/presidential-protocol run dev` (Vite 5173). API on :8080 from repo root (`set -a; . ./.env; set +a; PORT=8080 node ./artifacts/api-server/dist/index.mjs`). Login: Fatima / 1234.

## Architecture
- React 19 + Vite 7 + TS 5.9, Tailwind, **wouter** routing, **TanStack Query**, **react‑hook‑form + zod**, **framer‑motion**, **i18next**.
- Typed API client `@workspace/api-client-react` is **orval‑generated** from the OpenAPI spec — do not hand‑edit generated files; change the spec + regenerate.
- Express api‑server (contacts, events, reference, ai‑assistant, portraits). Postgres + Drizzle.
- Portraits: `POST /api/portraits/generate` → OpenAI `gpt-image-1` → `<root>/.portraits/<sha1(employeeId)>.png` (gitignored), served static.

## State management
- Server state: **TanStack Query** (orval hooks). Forms: **react‑hook‑form**.
- Local/feature state: React `useState`/`useReducer`. The **Collaboration Hub** uses one shared `useHub` store (demo state). The **Event Intelligence** derives everything live from `form.watch()`.
- Persistence helpers: `localStorage` for view‑mode (`contacts.view`), portrait cache namespace, language.

## Important files
- i18n / direction engine: `src/i18n/index.ts`, `src/i18n/language-context.tsx`, locales `src/i18n/locales/{en,ar}.ts`.
- Theme: `src/theme.ts` (`palette`).
- Routing: `src/App.tsx`.
- Identity: `src/lib/identity/*` (service, resolver, types, providers), components `src/components/identity/*`.
- Contacts: `src/pages/contacts.tsx`, `src/components/contacts/*`.
- Events: `src/pages/create-official-event.tsx`, `src/pages/event-detail.tsx`, `src/components/events/*`, `src/components/event-command/*` (incl. `collaboration-hub.tsx`).
- Portrait backend: `artifacts/api-server/src/routes/portraits.ts`. Batch script: `scripts/src/generate-portraits-full.ts`.

## Routes
`/` dashboard · `/events` · `/events/new` (→ CreateOfficialEvent) · `/events/:id` (event command center + Collaboration Hub tab) · `/events/:id/edit` · `/create-official-event` · `/contacts` · `/approvals` · `/vips` · `/invitations` · `/calendar` · `/reports` · `/settings` · `/family-tree` · `/fleet` · `/visits` · `/public-rsvp`.

## Design decisions (summary — see KNOWN_DECISIONS.md)
One `ExecutiveAvatar` everywhere; deterministic portraits owned by employeeId;
logical‑CSS RTL with one global engine; AI Review before Approvals; Team Formation
after approvals; Collaboration Hub via a single shared store.

## Coding conventions
- Match surrounding code style. Logical CSS only (`text-start/end`, `ms/me/ps/pe`, `start-/end-`). Never `dir`‑conditional layout swaps.
- Bilingual UI: use i18n keys, or the inline `L(lang, en, ar)` / `tl(lang,…)` helper for small new chrome.
- Verify after change: typecheck (`pnpm run typecheck`) + production build; spot‑check AR + EN in the browser.

## Government UI rules
Calm, premium, minimal, executive. No colourful/startup/WhatsApp look. Large
whitespace, thin borders, soft shadows, subtle 250ms motion. Georgia serif for
executive titles. Real human portraits for people; tinted icons for organizations.

## Color palette (`palette` in `theme.ts`)
mangrove (primary green), gold, calmTeal, teal, castleHill, mediumWood, sunset,
warmGray, border, cardBg, paperBg, alert. Card surface gradient `#FFFFFF→#FCFAF6`.

## Typography
Georgia serif for titles/names; system sans for body. Strong hierarchy: large
bold name → medium title → small muted department → muted org.

## Reusable components (always reuse, never duplicate)
`ExecutiveAvatar`, `ExecutiveHoverCard`, `AvatarGroup`, presence, badges,
`ContactAvatar`, `EventIntelligencePanel`, `EventTypeSelection`,
Collaboration Hub `ExecDrawer`/store, `ui/*` primitives.

## Existing AI modules
Portrait engine (live OpenAI); Event Intelligence (rule‑based predictions);
event‑type recommender; in‑hub AI actions (templated); `ai/contextual-copilot`
(event copilot), `ai/page-context`, ai‑assistant route.

## Existing workflows
Contacts directory; Event creation (type → form → intelligence); Event command
center tabs; Collaboration Hub (discussions→decisions/tasks/approvals/risks/
timeline); Mission Engine.

## Things that must NEVER change
- OpenAI API key only in root `.env` (gitignored); never exposed to frontend.
- Portrait ownership = `sha1(employeeId)`; organizations never get portraits.
- Fatima Darwish portrait override stays pinned.
- The single global direction engine; no per‑page RTL hacks; logical CSS only.
- Don't use the stale `Downloads/project` folder.

## Intentionally postponed
Per‑type form field sets; Collaboration Hub persistence; live AI for hub actions;
Files/Photos/Minutes backends; Phase 2–4 event‑creation dashboards; Team
Formation; Operations Room; expanded hover card; table virtualization.
