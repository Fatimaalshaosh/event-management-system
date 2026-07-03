# Known Decisions

Durable design decisions and the reasoning behind them. Respect these unless the
product owner explicitly changes direction.

## Identity & portraits
- **Why `ExecutiveAvatar` exists / is reused everywhere.** Every person across the
  app must look identical and recognizable. One avatar component resolves a
  deterministic portrait + presence + badge from any identity input, so there is
  no duplicated avatar logic and no inconsistency between screens.
- **Why portraits are owned by `employeeId` (`sha1(employeeId)` filename).** A
  portrait must never change with name, list order, or array index — only the
  stable employee id. This eliminated a class of "wrong portrait" bugs.
- **Why organizations get icons, not portraits.** Embassies/government/vendors are
  not people; giving them human faces is wrong. People → portraits, orgs → tinted type icons.
- **Why the Fatima Darwish override exists.** The signed‑in executive uses a
  curated real photo, pinned in `PORTRAIT_OVERRIDES` and checked before any
  provider, so it is never AI‑generated or replaced.
- **Why a provider architecture + cache versioning.** The image provider is
  swappable (OpenAI today) without UI changes; `PORTRAIT_VERSION` busts browser +
  local caches on regeneration so new portraits appear without manual clearing.

## Direction (RTL/LTR)
- **Why Arabic uses logical CSS + one global engine.** Per‑page RTL fixes caused
  recurring bugs. There is one engine (`i18n` sets `<html dir/lang>`); the whole
  codebase uses logical utilities (`text-start/end`, `ms/me/ps/pe`, `start/end`).
  New UI is RTL‑correct automatically. Never add `dir`‑conditional layout swaps —
  let `dir="rtl"` mirror a single natural layout (this is why the create‑event
  column‑swap hack was removed).

## Collaboration Hub
- **Why the Hub replaced the simple chat.** An official event needs everything
  (discussions, decisions, approvals, tasks, risks, timeline, minutes) documented
  in one workspace, not a messenger.
- **Why one shared store (`useHub`).** Every action (message, decision, task,
  risk, voice note) must auto‑document itself across sections + timeline +
  notifications + activity feed. A single store makes "one action updates
  everything" trivial and avoids cross‑section coupling bugs.
- **Why Executive Drawers (not browser dialogs).** Government‑grade, on‑brand,
  animated (250ms, blurred backdrop) instead of native `alert`/`confirm`.

## Event creation
- **Why event‑type selection comes first / no default.** "Add Event" must not
  assume an Official/State Visit. The user picks one of 14 types; the choice
  drives the form's `visitType` and the Executive AI panel (complexity, cost,
  checklist, departments). Nothing is preselected.
- **Why the Executive Intelligence panel is additive (reads `form.watch()`).** It
  augments the existing react‑hook‑form without changing its schema, submit, or
  business logic — so the working form is never at risk.
- **Why AI Review comes before Approvals.** Reviewers should approve a
  machine‑checked, risk‑scored event, not raw input — AI Review raises quality and
  confidence before human approval.
- **Why Team Formation comes after approvals.** You assign departments/people to an
  event only once it is approved; forming a team for an unapproved event wastes
  effort and creates rework.

## Reuse over rebuild
- **Why Executive Identity / Intelligence panel are reused, not re‑implemented.**
  Consistency + less code + fewer bugs. New surfaces (e.g. the future Phase‑2 AI
  Review dashboard) should reuse `EventIntelligencePanel` and `ExecutiveAvatar`.
