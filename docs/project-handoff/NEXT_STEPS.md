# Next Steps — Priority Order

Status legend: ✓ done · ◐ partial · ☐ pending

## Event Creation flow
- **Phase 1 — Event Type Selection** ✓ (14 types, no default, AI recommend, drives form + AI panel)
- **Phase 1 — Smart Event Form + Live Intelligence panel** ✓ (Readiness, Digital Twin, Cost/Resource, Checklist, Timeline, What‑Next)
- **Phase 2 — Executive AI Review dashboard** ◐ (intelligence panel exists; full dashboard with detected items, risk groups, smart yes/no questions, confidence ☐)
- **Phase 3 — Executive Review (read‑only briefing) page** ☐
- **Phase 4 — Approval Workflow (drag‑drop approver chain, prediction, live status)** ☐
- **Per‑event‑type field sets** (progressive disclosure; needs conditional zod schema) ☐

## Collaboration Hub
- **Interactive hub (discussions/decisions/tasks/approvals/risks/timeline/AI/voice/archive)** ✓ (demo state)
- **Persist to DB** (tables + routes for each section; wire the store) ☐
- **Live AI** (replace templated replies with api‑server model calls) ☐
- **Files / Photos / Meeting Minutes** (upload, version, OCR, transcription, VIP recognition) ☐
- **Export** (PDF/Word/Executive Brief/Minutes/Timeline/Audit) ☐

## After approvals
- **Team Formation** ☐ (assign departments/people to the approved event — comes AFTER the approval workflow)
- **Operations Room / Live Ops** ☐ (real‑time event‑day monitoring)
- **Live Monitoring & Notifications** ☐ (presence, status, escalations across the platform)

## Platform‑wide polish
- Expanded Microsoft‑365 hover card (manager, languages, clearance, AI summary) ☐
- "Arabic field first" DOM order in every form row ☐
- Convert remaining AI chat components to pure logical CSS ☐
- Table column resize + virtualization ☐
- Wire live AI for minutes/SITREP/brief everywhere ☐

## Recommended immediate sequence
1. **Persist one Collaboration Hub section end‑to‑end** (Discussions or Decisions: DB table → api route → store) to prove the pattern, then repeat per section.
2. **Event Creation Phase 2 dashboard** (reuse `EventIntelligencePanel`; add detected‑items + risk groups + smart questions).
3. **Phase 3 review page** (read‑only briefing assembled from the form + panel).
4. **Phase 4 approval workflow** (reuse existing Approvals concepts; add drag‑drop + prediction).
5. **Team Formation** (depends on #4).
6. **Operations Room / Live Monitoring**.
