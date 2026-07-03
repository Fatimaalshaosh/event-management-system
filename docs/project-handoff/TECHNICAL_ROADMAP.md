# Technical Roadmap — to v1.0

Milestone‑based plan from today (2026‑06‑30) to a production v1.0. Each milestone
ends with: typecheck + production build green, AR/EN verified, no regressions.

## M1 — Persistence foundation (Collaboration Hub)
Goal: turn the demo Hub into real, durable data.
- DB tables + Drizzle schema: `discussions`, `decisions`, `event_tasks`, `approvals`, `risks`, `activity`, `attachments` (scoped by `eventId`).
- OpenAPI spec + orval regen; api‑server routes (CRUD).
- Rewire the Hub `useHub` store to TanStack Query (read/write), keeping the same UI.
- Acceptance: refresh persists; multiple sections stay in sync via timeline/activity.

## M2 — Live AI services
Goal: replace templated AI with real model calls (reuse the portrait route pattern).
- api‑server `ai` endpoints: summarize discussion, generate minutes, executive brief, SITREP, identify risks, draft email.
- Wire Hub AI actions + Event Intelligence "AI Review" to these endpoints with the existing "Thinking…" UX.
- Acceptance: AI outputs are model‑generated, bilingual, context‑aware; key stays server‑side.

## M3 — Event Creation Phases 2–4
- **Phase 2 — AI Review dashboard**: reuse `EventIntelligencePanel`; add detected‑items list, risk groups (High/Med/Low), smart yes/no questions, confidence score.
- **Phase 3 — Executive Review**: read‑only briefing assembled from form + panel; "Back to Edit" / "Send for Approval".
- **Phase 4 — Approval Workflow**: AI‑suggested approver chain, drag‑drop reorder, approver cards (photo/role/load/ETA/confidence), prediction, live status (Received→Opened→Viewed→Approved/Rejected/Returned), reminders/escalation.
- **Per‑type field sets**: conditional zod schema so each event type shows only relevant fields (progressive disclosure).

## M4 — Team Formation
- After approval: assign departments + people to the event (reuse Mission Engine recommendations + `ExecutiveAvatar`).
- Workload‑aware suggestions; confirm + notify.

## M5 — Operations Room / Live Monitoring
- Event‑day live ops: real‑time status, presence, checkpoints, incident log, escalations.
- Platform notifications center (live).

## M6 — Files / Photos / Minutes
- Upload + storage; document versioning, preview, OCR, AI summary, in‑document search.
- Photos: albums, VIP recognition, captions.
- Auto Meeting Minutes from discussions (AI).

## M7 — Exports & Reporting
- Export Collaboration Hub + event as PDF / Word / Executive Brief / Minutes / Timeline / Audit report.
- Reports dashboards.

## M8 — Polish & hardening (v1.0)
- Expanded Microsoft‑365 hover card; table virtualization + column resize.
- Arabic‑field‑first DOM order in all forms; convert remaining AI chat components to pure logical CSS.
- Accessibility pass (focus, keyboard nav, contrast, screen‑reader labels).
- Performance, error states, empty states, end‑to‑end QA in AR + EN.
- Security review (key handling, authz), rotate any shared keys.

## Cross‑cutting invariants (every milestone)
Logical‑CSS RTL only; reuse `ExecutiveAvatar`/identity; portraits owned by
employeeId; orgs use icons; AI key server‑side; typecheck + build green before done.
