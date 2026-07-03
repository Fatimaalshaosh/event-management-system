# Project Status — Presidential Protocol Operations Platform

_Last updated: 2026-06-30_

## Overview
A bilingual (Arabic RTL / English LTR) government executive platform for managing
official events, protocol operations, VIP visits, contacts, approvals and an
Executive Identity system. Design language: calm, premium, government‑grade,
Microsoft‑365 quality, warm‑beige palette. Built as a pnpm monorepo.

## Tech stack
- **Frontend** (`artifacts/presidential-protocol`): React 19, Vite 7, TypeScript 5.9, Tailwind CSS, wouter (routing), TanStack Query, react‑hook‑form + zod, framer‑motion, i18next.
- **API server** (`artifacts/api-server`): Express 5; routes for contacts, events, reference, AI assistant, portraits.
- **DB** (`lib/db` / `@workspace/db`): PostgreSQL + Drizzle ORM.
- **Shared**: `@workspace/reference` (countries/airports), `@workspace/api-client-react` (orval‑generated client), `scripts` (seed + portrait generation).
- **AI**: OpenAI (`gpt-image-1` for portraits; chat assistant route). Key only in root `.env`.

## Completed features
- **Contacts Directory** (`/contacts`): premium executive cards + **3 view modes** (Executive Cards / Compact / Table) with persisted choice; sortable enterprise table with multi‑select + CSV export; role‑based covers, rank hierarchy, presence chips, premium badges.
- **Executive Identity System**: deterministic AI portraits for **87 employees** (OpenAI), `sha1(employeeId)` ownership, swappable providers, cache versioning, curated overrides (Fatima Darwish). `ExecutiveAvatar` / `ExecutiveHoverCard` / presence reused platform‑wide.
- **Mission Engine**: orchestration command‑center tab (DNA, blueprint, relationships, readiness, graph, cockpit).
- **Event Collaboration Hub** (event tab): Discussions, Decisions, Tasks, Approvals, Risks, Timeline, AI Assistant, Voice Notes, Archive — interactive (Executive Drawers for create‑task/decision/approval/risk/follow‑up, multi‑emoji reactions, inline replies, escalation, smart suggestions, activity feed, Run Live Demo).
- **Event Creation**: **event‑type selection gate** (14 types, no default) → adaptive form + **Executive Intelligence panel** (Readiness Meter, Digital Twin/Executive Summary, Cost & Resource prediction, AI Checklist, Executive Timeline, What‑Happens‑Next).
- **Global RTL/LTR direction system** (logical‑CSS‑only; single engine).
- Reference module (countries/airports + flags), org structure, seed data.

## In progress / partial
- **Event Creation Phases 2–4**: the Intelligence panel covers part of the "AI Review"; the full Phase‑2 AI dashboard, Phase‑3 Executive Review page, and Phase‑4 drag‑drop approval workflow are **not built**.
- **Collaboration Hub**: fully interactive but **client‑side/demo state** (not persisted to DB); AI replies are **templated**, not live model calls.

## Remaining roadmap (high level)
See `TECHNICAL_ROADMAP.md` and `NEXT_STEPS.md`. Headlines: persist Collaboration Hub, Event Creation AI‑Review/Review/Approval phases, Team Formation, Operations Room, Live Monitoring, real AI wiring.

## Known issues / technical debt
- Collaboration Hub + Event Intelligence are **demo state** (reset on reload).
- AI responses are templated; only **portraits** call a live model.
- `ai/contextual-copilot.tsx` + `ai/compact-reply.tsx` use inline `dir`‑branch styles (functional, not pure logical CSS).
- Event Creation form uses one fixed zod schema → cannot yet hide required fields per event type (needs conditional schema).
- Files/Photos/Meeting‑Minutes sections in the Hub are scaffolds (no upload/OCR/transcription backend).
- `pages/events-new.tsx` (legacy `EventForm` create page) is orphaned/deprecated (kept for its test; `EventForm` still used by edit).

## Pending UI improvements
- Per‑event‑type form field sets (progressive disclosure).
- "Arabic field first" enforced in every form row (DOM order).
- Expanded Microsoft‑365‑style hover card (manager/languages/clearance/AI summary).
- Table column resize + row virtualization for very large lists.

## AI capabilities — implemented
- Deterministic AI **portrait** generation (OpenAI gpt‑image‑1) with per‑person prompt engine (ethnicity, attire, age cap, pose variation).
- Executive **readiness / cost / resource / checklist** prediction (rule‑based, live).
- Smart **event‑type recommendation** from a free‑text brief.
- In‑hub AI actions (summarize, minutes, brief, SITREP, risks, approvals) — templated, context‑aware.

## AI capabilities — planned
- Live model calls for hub AI actions + meeting minutes + SITREP (reuse the api‑server pattern used by portraits).
- Invitation/document extraction (PDF/Word/image → event fields).
- Natural‑language event creation.

## Architecture summary
Frontend (Vite) ↔ `/api` proxy → Express api‑server → Postgres (Drizzle). orval
generates the typed React Query client from the OpenAPI spec. Portraits are
generated server‑side and served as static files. i18n sets `<html dir/lang>`
globally. See `SESSION_CONTEXT.md`.

## Database status
PostgreSQL via Drizzle; schema pushed; seeded with ~136 contacts (87 people +
orgs), departments, events, tasks, risks, delegations. Local dev DB:
`postgres://postgres:postgres@localhost:5433/presidential`.

## Components created (highlights)
`ExecutiveAvatar`, `ExecutiveHoverCard`, `AvatarGroup`, presence, `ExecutiveBadge`;
Contacts: `ContactCard`, `CompactCard`, `ContactTable`, `ContactAvatar`, shared
helpers; Events: `EventIntelligencePanel`, `EventTypeSelection`,
`EventCollaborationHub` (+ `ExecDrawer`, RecordDrawer); Mission Engine views.

## Shared reusable components
`ExecutiveAvatar` (the one avatar everywhere), `ExecutiveHoverCard`, presence
system, identity resolver + PortraitService, `EventIntelligencePanel`, the
Collaboration Hub store pattern, `ui/*` primitives.

## Design system status
Stable. Warm‑beige/white palette, Georgia serif for executive titles, thin
borders, soft shadows, premium hover (250ms). Logical‑CSS only.

## RTL/LTR implementation status
**Complete & architectural.** Single global engine (`i18n/index.ts` +
`i18n/language-context.tsx`) sets `<html dir/lang>`. Codebase is logical‑CSS only
(0 physical margin/padding/text‑align/position utilities). Verified across all
key pages flipping RTL↔LTR. See `docs/executive-identity` is separate; RTL details
in `KNOWN_DECISIONS.md`.

## Executive Identity implementation status
**Complete.** 87 portraits generated + validated, employeeId‑owned, overrides
pinned, cache‑versioned, reused everywhere. Full docs in
`docs/executive-identity/`.
