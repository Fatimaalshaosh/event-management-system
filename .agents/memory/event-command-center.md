---
name: Event Command Center
description: Durable architecture decisions and conventions for the event detail "command center" and the public RSVP flow.
---

# Event Command Center

The event detail page is a **tabbed command center**, not a single page. Add new event-scoped
features as new tabs rather than growing the detail page. Tab panels live in their own components.

## Public RSVP — security model
**Why:** guests must respond without an account; the link itself is the credential.
**How to apply:** the public RSVP route is registered **outside** the auth wrapper, and the
backend RSVP endpoints have **no auth middleware** — the unguessable random `publicToken` is the
only guard. Never add auth to these endpoints; never make the token guessable/sequential.

## Delegation RSVP consistency
**Why:** a delegation that accepts with members and later declines must not leave orphaned member rows.
**How to apply:** on RSVP submit, clear the invitation's guest members whenever the payload carries
members OR the response is "declined"; only re-insert members on an accepted response with a non-empty list.

## RSVP data capture is a hard requirement
**Why:** a code review rejected Phase 1 because the public form omitted email/job-title (individual)
and several fields for delegation members, even though the backend accepted them.
**How to apply:** when touching the RSVP form, keep the visible inputs in sync with the full set of
fields the submit schema accepts for BOTH individual and each delegation member — a field the API
supports but the form hides counts as a scope miss.

## Event readiness has two sources — don't let tasks zero it
**Why:** `events.readinessPercent` is seeded from category readiness, but the Tasks tab also drives it
via impact-weighted task completion (`recomputeEventReadiness` in tasks route). A naive recompute zeroed
readiness whenever an event had no tasks (totalImpact=0 → 0%), wiping the category-based value.
**How to apply:** only overwrite `readinessPercent` when tasks actually contribute impact (totalImpact>0);
otherwise update `pendingTasksCount` only and leave the existing readiness untouched.

## Ops-room alert severities are critical|high|medium|low
**Why:** a code review caught the Live Ops alert styler only handling `critical`/`warning`, so high/medium/low
all rendered with one default style. The backend ops-room endpoint never emits `warning`.
**How to apply:** any UI that styles `ops.alerts[].severity` (and risk severity generally) must map all four
of `critical|high|medium|low` distinctly; there is no `warning` severity in this app.

## Bilingual / RTL — use LOGICAL CSS, never hardcoded physical sides
**Why:** the product is true Arabic-RTL/English-LTR. Direction is driven by `document.documentElement.dir`
(set in `i18n/language-context.tsx`); the whole app must flip with it, not just translate text. Earlier code
hardcoded `text-right`/`textAlign:"right"`/`pl-`/`ml-`, which forced RTL and broke English (and vice-versa).
**How to apply:** for new UI prefer logical Tailwind/CSS that auto-flips with `dir`:
`text-start`/`text-end` (not text-left/right), `ms-`/`me-`/`ps-`/`pe-` (not ml/mr/pl/pr),
`start-N`/`end-N` (not left-N/right-N), `border-s`/`border-e`, `rounded-s`/`rounded-e`; inline styles use
`textAlign:"start"|"end"`, `marginInlineStart/End`, `insetInlineStart/End`. Do NOT flip `flex-row`
(flex already respects dir). Keep `dir="ltr"` only on intrinsically-LTR inputs (passport, email, phone, IDs).
**Gotcha:** in shadcn primitives, absolute indicator/icon positions must stay paired with their padding —
if item padding is logical (`ps-8`/`pe-8`) the indicator must be logical too (`start-2`/`end-2`), else it
mismatches in RTL.
**How to apply (i18n):** every new string needs a key in both locale files with identical nested structure;
choose `*Ar` vs base fields and text direction from the language context.
**Known debt:** the Overview tab + event-detail header were extracted verbatim from the original
page and still hardcode some Arabic labels/date locale — not fully bilingual yet.
