---
name: i18n locale nesting trap
description: Why newly-added i18n keys can render raw despite a passing typecheck in this app's large en.ts/ar.ts locale objects.
---

# i18n locale nesting trap

When adding a new translation block to `artifacts/presidential-protocol/src/i18n/locales/en.ts` and `ar.ts`, the block can silently land at the wrong nesting level (e.g. as a child of `pages` instead of `pages.commandCenter`). The locale files use **inconsistent indentation** and the objects are huge, so a closing `},` that visually looks like it closes a sibling section may actually be closing the parent section.

**Symptom:** UI shows raw keys like `pages.commandCenter.flights.title` instead of translated text, even though `pnpm run typecheck` passes — the object is still valid TypeScript, just shaped wrong.

**Why:** TypeScript only checks that braces balance, not that a key ended up at the intended path. i18next returns the key string when a path is missing.

**How to apply:** After inserting/moving a locale block, verify by **runtime path resolution**, not by eyeballing indentation. Quick check: a tiny tsx script that imports `{ en }` / `{ ar }` and reduces over `"pages.commandCenter.<section>.<key>".split(".")` to confirm it resolves to a string (and that the wrong path, e.g. `pages.<section>`, is `undefined`). Run it via `pnpm --filter @workspace/scripts exec tsx <file>` with imports relative to `scripts/`. The `runTest` e2e agent also catches this — it explicitly reports visible raw `pages.*` keys.
