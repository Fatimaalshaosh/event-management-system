---
name: Per-officer preferences
description: How to persist per-user settings in this app despite there being no real auth.
---

# Per-officer preferences

This app has **no real auth user id**. Per-user state is scoped by `ownerKey`:
a stable per-browser UUID kept in localStorage, produced by `getOwnerKey()`
(`artifacts/presidential-protocol/src/components/dashboard/owner-key.ts`).

**Rule:** any server-side per-user data must be keyed by `ownerKey`, passed
from the client (query param for GET, body field for writes). The dashboard
profiles feature established this pattern; the `user_preferences` table
(`lib/db/src/schema/preferences.ts`, unique `owner_key`) follows it for
durable preferences like the budget warning threshold.

**Why:** without it, preferences live only in localStorage and don't survive
a cleared cache or a different device.

**How to apply:** add a column to `user_preferences` (or a new keyed table),
expose GET/PUT under `/dashboard/...` taking `ownerKey`, regenerate codegen,
and on the client read/write via the generated hooks scoped by
`getOwnerKey()`. Normalize/clamp values server-side; GET returns sensible
defaults when no row exists. Note generated zod query params use
`zod.coerce.string()`, so a missing `ownerKey` coerces to `"undefined"`
rather than 400 — don't assert 400 on missing query params.
