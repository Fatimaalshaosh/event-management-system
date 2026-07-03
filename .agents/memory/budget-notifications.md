---
name: Budget notification feed
description: How proactive budget alerts become persistent, deduplicated in-app notifications.
---

# Budget notification feed

The app has an in-app notification feed (topbar bell) whose only producer today
is budget alerts. It is generated on-demand, not by a scheduler.

## How notifications are produced
**Rule:** a notification is created only when an event ESCALATES into a worse
budget state (none→warning, warning→over, none→over), keyed by `ownerKey`. The
notifications endpoint (`GET /dashboard/notifications`) computes current budget
alerts (reuses `buildBudgetAlerts`), diffs them against the per-(ownerKey,eventId)
last-known status stored in `budget_alert_states`, inserts feed rows for
escalations, and upserts state.
**Why:** officers must not be re-notified on every dashboard refresh (dedup). The
GET is intentionally a poll-with-side-effect; repeated calls with unchanged budget
state insert nothing, so it stays idempotent.
**How to apply:** de-escalation/recovery updates stored state SILENTLY (no feed
row) so a later re-crossing notifies again. The pure escalation logic lives in
`src/lib/budget-notifications.ts` (testable, no db); the route does the I/O.

## Owner scoping, not real users
This app has no auth user id — everything user-scoped uses `ownerKey` (a
per-browser UUID from `components/dashboard/owner-key.ts`). Notifications, like
dashboard profiles, are scoped by `ownerKey`. There is no email channel; "notify"
means the in-app feed.

## Generated query-param Zod coerces missing values
**Gotcha:** Orval generates required string query params as `zod.coerce.string()`.
A MISSING param coerces to the literal string `"undefined"` and PASSES validation
(no 400). Do not write tests asserting a 400 for a missing `ownerKey`-style query
param — the shared codegen will not reject it. Add an explicit guard only if you
truly need one.
