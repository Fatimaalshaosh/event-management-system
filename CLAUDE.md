# CLAUDE.md — Permanent Project Memory

**Read this file before making any change.** It is the source of truth for how to
work on the Presidential Protocol platform. Detailed handoff lives in
`docs/project-handoff/` and `docs/executive-identity/`.

---

## Project vision
A bilingual (Arabic RTL / English LTR) **government executive platform** for
official events, protocol operations, VIP visits, contacts, approvals and an
Executive Identity system. It must feel **calm, premium, minimal, government‑grade,
Microsoft‑365 quality** — built as if originally designed for Arabic government
executives. Never startup/colourful/messenger‑style.

## Architecture
- pnpm monorepo. **Frontend** `artifacts/presidential-protocol` (React 19, Vite 7,
  TS 5.9, Tailwind, wouter, TanStack Query, react‑hook‑form + zod, framer‑motion,
  i18next). **API** `artifacts/api-server` (Express 5). **DB** Postgres + Drizzle
  (`@workspace/db`). Shared: `@workspace/reference`, `@workspace/api-client-react`
  (orval‑generated — never hand‑edit; change the OpenAPI spec + regenerate).
- Portraits: `POST /api/portraits/generate` → OpenAI `gpt-image-1` →
  `<root>/.portraits/<sha1(employeeId)>.png` (gitignored), served static.
- Direction: `src/i18n/index.ts` + `src/i18n/language-context.tsx` set
  `<html dir/lang>` globally — the single direction engine.

## Coding standards
- Match surrounding code; minimal, focused diffs. TypeScript strict.
- **Logical CSS only**: `text-start/end`, `ms/me/ps/pe`, `start-/end-`,
  `rounded-s/e`, `border-s/e`. **Never** `ml/mr/pl/pr`, `text-left/right`,
  `left-/right-` for directional layout, or `dir`‑conditional column swaps.
- Bilingual: i18n keys, or inline `L(lang, en, ar)` / `tl(lang,…)` for small new chrome.
- After any change: `pnpm run typecheck` + production build green; spot‑check
  **both** Arabic and English in the browser. Don't claim done without verifying.

## UI principles
Large whitespace, thin borders, soft shadows, premium 250ms motion, strong
typographic hierarchy. Real human portraits for people; tinted icons for orgs.
Drawers (not browser dialogs) for create/edit flows.

## Government design principles
Authority, restraint, luxury, clarity. No exaggerated animation, no broad smiles
in portraits, no bright dashboards. Arabic is a first‑class native experience.

## Color palette (`palette` in `src/theme.ts`)
mangrove (primary green), gold, calmTeal, teal, castleHill, mediumWood, sunset,
warmGray, border, cardBg, paperBg, alert. Card surface `#FFFFFF → #FCFAF6`.

## Typography
Georgia serif for executive titles/names; system sans for body. Hierarchy: large
bold name → medium title → small muted department → muted organization.

## Components that must ALWAYS be reused (never duplicate)
`ExecutiveAvatar`, `ExecutiveHoverCard`, `AvatarGroup`, presence system, badges,
`ContactAvatar`, `EventIntelligencePanel`, `EventTypeSelection`, the Collaboration
Hub store + `ExecDrawer`, identity resolver / `portraitService`, `ui/*` primitives.

## Things that must NEVER be refactored / changed
- OpenAI API key only in root `.env` (gitignored); never exposed to the frontend.
- Portrait ownership = `sha1(employeeId)`; organizations never receive portraits.
- The Fatima Darwish portrait **override** stays pinned (never AI‑generated).
- The single global direction engine; **no per‑page RTL hacks**; logical‑CSS only.
- Don't use the stale `…/Downloads/project` folder — only the monorepo above.
- Don't hand‑edit orval‑generated API client files.

## Current roadmap (see docs/project-handoff/TECHNICAL_ROADMAP.md)
M1 persist Collaboration Hub → M2 live AI → M3 Event Creation Phases 2–4 →
M4 Team Formation → M5 Operations Room / Live Monitoring → M6 Files/Photos/Minutes →
M7 Exports/Reporting → M8 polish + v1.0.

## Important implementation decisions (see KNOWN_DECISIONS.md)
One `ExecutiveAvatar` everywhere; portraits owned by employeeId; logical‑CSS RTL;
event‑type selection first (no default); AI Review before Approvals; Team Formation
after approvals; Collaboration Hub via one shared store; Intelligence panel is
additive (reads `form.watch()`).

## Current known limitations
- Collaboration Hub + Event Intelligence are **demo state** (reset on reload; not persisted).
- AI replies are **templated** except portraits (live OpenAI).
- Event form uses one fixed zod schema → no per‑type field hiding yet.
- Files/Photos/Meeting‑Minutes Hub sections are scaffolds (no upload/OCR/transcription).
- `ai/contextual-copilot.tsx` + `ai/compact-reply.tsx` still use inline `dir`‑branch styles (functional).
- `pages/events-new.tsx` legacy create page is deprecated/orphaned (kept for its test).
