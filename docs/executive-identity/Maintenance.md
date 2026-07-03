# Maintenance

Operational guide for keeping the Executive Identity portrait system healthy.

> See also: [Architecture](./Executive-Identity-Architecture.md) ·
> [Batch Generation](./Batch-Generation.md) ·
> [Portrait Overrides](./Portrait-Overrides.md)

## How to update portraits

**Regenerate one or more people** (e.g. after improving the engine, or fixing a
specific person):

1. Start the api-server on `:8080` from the repo root with the key (see below).
2. Delete the target portrait file(s) in `<repo-root>/.portraits/`
   (`sha1(employeeId).png`).
3. Run the script — `ONLY_IDS=<ids>` for specific people, or `BATCH_INDEX=N`
   for a batch. See [Batch Generation](./Batch-Generation.md).
4. **Bump `PORTRAIT_VERSION`** and restart the frontend.

**Pin a fixed photo instead of AI** — add an entry to `PORTRAIT_OVERRIDES`
([Portrait Overrides](./Portrait-Overrides.md)).

## How to rotate the API key

The OpenAI key lives only in the server environment — never in the frontend
bundle, never in `public/`. Environment variables (in the repo-root `.env`):

| Variable | Purpose |
|---|---|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key (server only) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | e.g. `https://api.openai.com/v1` |
| `PORTRAIT_PROVIDER` | image provider (`openai`) |
| `VITE_PORTRAITS` | frontend flag (`openai` to enable the remote provider) — set in `artifacts/presidential-protocol/.env.local` |

To rotate:

1. Replace `AI_INTEGRATIONS_OPENAI_API_KEY` in `.env`.
2. Restart the api-server (it reads env at startup):
   ```bash
   # from repo root
   set -a; . ./.env; set +a
   PORT=8080 node ./artifacts/api-server/dist/index.mjs
   ```
3. No frontend change is needed — the key is never exposed to the client.

> The key is only ever read server-side. If a key was shared in plaintext, rotate it.

## Bumping `PORTRAIT_VERSION`

`PORTRAIT_VERSION` is a single constant in
`artifacts/presidential-protocol/src/lib/identity/service.ts`
(currently `"2026-06-29.4"`).

```ts
export const PORTRAIT_VERSION = "2026-06-29.4"; // bump after every regeneration
```

After bumping:

1. Restart the frontend dev server (a clean restart is more reliable than HMR
   for this constant — see Troubleshooting).
2. Every browser fetches fresh images (`?v=` changes) and the frontend cache
   re-resolves (namespace changes) — **no manual cache clearing**.

Use any monotonic value (date-based works well: `2026-06-29.5`, `2026-07-01`,
etc.).

## How browser cache works

- `/api/portraits/files/*` is served `immutable, max-age 30d`.
- Filenames are stable (`sha1(employeeId)`), so a regenerated image reuses the
  same filename.
- The `?v=<PORTRAIT_VERSION>` query is what makes each version a distinct cache
  entry, so bumping the version is the supported way to surface new images.
- The frontend also caches the resolved URL in `localStorage`
  (`execPortrait:<version>:` namespace); the version is part of the namespace,
  so old entries are dropped on a bump.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Regenerated portrait still shows the old image | Browser served the immutable cached file; version not bumped | Bump `PORTRAIT_VERSION`, restart the frontend |
| New `?v=` not applied after editing `PORTRAIT_VERSION` | Dev-server HMR applied the change inconsistently | Stop and restart the preview/dev server (don't rely on HMR for this constant) |
| Portrait route returns `503` | No API key configured | Set `AI_INTEGRATIONS_OPENAI_API_KEY` + `AI_INTEGRATIONS_OPENAI_BASE_URL`, restart api-server |
| Portrait route returns `502` | Provider error (e.g. billing limit) | Check the OpenAI account/credits; inspect server logs |
| api-server boots but `/api/portraits/files/...` is 404 | Old build running, or wrong cwd | Rebuild (`pnpm --filter @workspace/api-server run build`) and start from the **repo root** so `.portraits/` resolves |
| Avatars show monogram/initials instead of photos | `VITE_PORTRAITS` not `openai`, or provider failed to load image (`onError` fallback) | Set `VITE_PORTRAITS=openai` in `.env.local`, restart frontend; confirm `:8080` reachable via the `/api` proxy |
| Person shows the wrong face | (Should be impossible — ownership is `sha1(employeeId)`.) Never assign by array index | Verify the file equals `sha1(employeeId)`; regenerate that id with `ONLY_IDS` |
| An organization shows a human face | Type misclassified | Organizations must be `embassy`/`government`/`vendor`; only people resolve portraits |

## Invariants to preserve

- Portrait ownership is always `sha1(employeeId)` — never index/order/name.
- Organizations never receive portraits (icons only).
- The API key stays server-side only.
- Bump `PORTRAIT_VERSION` on every regeneration.
- Override ids are never regenerated.
