# Executive Identity — Architecture

The Executive Identity system gives every person in the platform a single,
consistent, recognizable portrait (plus presence and badge), resolved through
one service so the same identity is reused on every surface (top navigation,
sidebar, Contacts, profile, hover card, Mission Engine, Tasks, Approvals,
mentions, timeline, activity feed, search, people picker, org chart, attendees,
calendar, notifications).

## Related documents
- [Portrait Generation Engine](./Portrait-Generation-Engine.md)
- [Batch Generation](./Batch-Generation.md)
- [Portrait Overrides](./Portrait-Overrides.md)
- [Maintenance](./Maintenance.md)
- [Final Implementation Report](./Final-Implementation-Report.md)

## Code map

| Layer | Location |
|---|---|
| Identity library | `artifacts/presidential-protocol/src/lib/identity/` |
| UI components | `artifacts/presidential-protocol/src/components/identity/` |
| Backend route | `artifacts/api-server/src/routes/portraits.ts` |
| Batch script | `scripts/src/generate-portraits-full.ts` |
| Generated portraits | `<repo-root>/.portraits/` (gitignored) |
| Curated override assets | `artifacts/presidential-protocol/public/portraits/` |

### Identity library (`src/lib/identity/`)
- `types.ts` — `IdentityInput`, `ResolvedIdentity`, `PortraitProvider`, `PortraitRequest`, `Gender`, `Presence`.
- `resolver.ts` — `resolveIdentity(input)` → deterministic identity (gender default, dept color, badge, presence, `portraitUrl`, `coverUrl`, initials, stable `key`, `employeeId`).
- `service.ts` — `portraitService` singleton, the provider registry, `PortraitCache`, `PORTRAIT_OVERRIDES`, and `PORTRAIT_VERSION` (cache versioning).
- `portrait-identity.ts` / `portrait-profile.ts` — explicit attire/ethnicity/age helpers used for stored identity fields and silhouettes.
- `init.ts` — `initPortraitProvider()` activates the remote (OpenAI) provider when `VITE_PORTRAITS=openai`.
- `current-user.ts` — `CURRENT_USER` (Fatima Darwish, employeeId `"me"`).

### UI components (`src/components/identity/`)
`ExecutiveAvatar` (sizes xs–xl, presence dot, optional dept ring + badge + hover
card), `executive-hover-card.tsx`, `avatar-group.tsx`, `presence.tsx`,
`executive-badge.tsx`. Every avatar renders the URL with `object-fit: cover`
(face-centered) and an `onError` fallback to the offline placeholder.

## Portrait pipeline

```
ExecutiveAvatar
  └─ resolveIdentity(input)                 // src/lib/identity/resolver.ts
       └─ portraitService.getPlaceholder()  // sync, never blocks
            1. portraitOverride(req)?  ──► return versioned(override)   // wins first
            2. cache hit (localStorage, versioned namespace)? ──► return it
            3. async provider → resolve() upgrades the image and caches it
                 └─ POST /api/portraits/generate  (remote provider)
                      └─ buildServerPrompt(identity)      // api-server: the prompt engine
                           └─ OpenAI gpt-image-1 (1024×1024)
                                └─ save <repo-root>/.portraits/<sha1(employeeId)>.png
            ◄── { url: "/api/portraits/files/<hash>.png" }
       └─ versioned(url) ──► "/api/portraits/files/<hash>.png?v=<PORTRAIT_VERSION>"
GET /api/portraits/files/<hash>.png  (express.static, immutable)
```

Key properties:
- The frontend sends **only identity fields** to the backend (no prompt). The
  api-server's `buildServerPrompt` is the **single prompt engine**, so a person
  looks identical whether generated on demand or in a batch.
- The provider is **swappable** (`PORTRAIT_PROVIDER` env on the server) without
  any UI change. OpenAI Images is the current provider.
- If a portrait file already exists, the route returns it (`cached: true`) and
  **never regenerates** — generation happens once per employee.

## Ownership model and employeeId mapping

A portrait is owned by the **stable `employeeId`**, never by array index, list
order, name, or generation order.

- **Filename:** `sha1(employeeId)` truncated to 32 hex chars + `.png`.
  - Backend: `routes/portraits.ts` → `stableName(b.employeeId ?? b.key)`.
  - Script/clients: `sha1(String(id)).slice(0,32) + ".png"`.
- **Cache key:** `provider.id + ":" + (employeeId ?? key)` — provider-scoped so
  switching providers never serves a stale image.
- The current signed-in user uses employeeId `"me"`; directory employees use
  their numeric contact id.

This guarantees: one employee ↔ exactly one portrait file, reproducible forever.

## Cache flow

Two cache layers:

1. **Frontend `PortraitCache`** (`service.ts`) — in-memory `Map` + `localStorage`,
   namespace `execPortrait:<PORTRAIT_VERSION>:`. Stores the resolved (versioned)
   URL per cache key. Permanent per person until the version changes.
2. **Browser HTTP cache** — `/api/portraits/files/*` is served `immutable`
   (`max-age 30d`). The `?v=<PORTRAIT_VERSION>` query makes each version a
   distinct cache entry.

Because the filename is `sha1(employeeId)` (stable), a regenerated portrait
reuses the same filename — so the **version query** is what forces browsers to
fetch the new image. See [Versioning strategy](#versioning-strategy).

## Versioning strategy

`PORTRAIT_VERSION` is a single constant in `src/lib/identity/service.ts`
(currently `"2026-06-29.4"`). It is used in two places:

- **Appended to every served portrait URL** as `?v=<PORTRAIT_VERSION>` (via the
  internal `versioned()` helper) — busts the browser's immutable HTTP cache.
- **Folded into the localStorage namespace** (`execPortrait:<version>:`) — drops
  stale cached URLs automatically.

**Bump `PORTRAIT_VERSION` whenever portraits are regenerated.** A bump causes
every browser to fetch fresh images and the frontend cache to re-resolve — no
manual cache clearing required. See [Maintenance](./Maintenance.md) and
[Batch Generation](./Batch-Generation.md).
