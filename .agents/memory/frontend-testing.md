---
name: Frontend (presidential-protocol) testing
description: How the React frontend test harness is set up and why vitest config is separate from vite config.
---

# Frontend testing (artifacts/presidential-protocol)

Test stack: vitest + jsdom + @testing-library/react. Run with
`pnpm --filter @workspace/presidential-protocol run test`. Registered as the
`test:web` validation step (the backend `test` validation stays api-server only).

## Why a separate vitest.config.ts
`vite.config.ts` **throws** at load time if `PORT` / `BASE_PATH` are unset (it
hard-requires them for the dev/preview server). Tests run without those env vars,
so vitest uses its own `vitest.config.ts` (jsdom env, `@`/`@assets` aliases,
react plugin, `src/test/setup.ts`). Do not point vitest at vite.config.ts.

## Conventions
- Test files live next to source as `*.test.ts(x)`; excluded from production
  tsconfig (so `pnpm run typecheck` stays clean).
- Component tests that read language/dir must wrap in `<LanguageProvider>` and
  set language via `i18n.changeLanguage("ar"|"en")` in a `beforeEach`.
- Prefer pure-logic tests for `event-utils.tsx` style helpers; they need no DOM.

**Why:** keeps the UI gate meaningful without coupling tests to the workflow's
runtime env wiring.

## Page-level tests (mocking generated API hooks)
- Mock `@workspace/api-client-react` with `vi.mock(..., async (importOriginal) => ({ ...actual, ...hooks }))` so the real query-key helpers (`getListEventsQueryKey`, etc.) survive while only the hooks are stubbed. Declare hook fns via `vi.hoisted`.
- Shared render helper lives in `src/test/render-page.tsx` (`renderPage` wraps QueryClientProvider w/ retry:false + LanguageProvider + PageContext + Tooltip + wouter Router via `wouter/memory-location`), plus `queryResult()` / `mutationResult()` factories.
- jsdom lacks `scrollIntoView`; the AI-assistant widget calls it in an effect. `src/test/setup.ts` polyfills `Element.prototype.scrollIntoView`, otherwise the whole dashboard render throws.

## Dashboard test gotchas
- The dashboard board is laid out by `useDashboardLayout`, which depends on dashboard-PROFILE CRUD hooks (not the data hooks). Mock the whole `@/components/dashboard/use-dashboard-layout` module to return a static layout (`items: DEFAULT_ITEMS` from widget-meta) — otherwise the grid renders zero widgets and no content appears.
- Only widgets in `DEFAULT_VISIBLE` (widget-meta) render by default — `upcomingEvents` is NOT among them; assert against visible widgets (readinessTracker, officialVisits, upcomingTasks, pendingApprovals).
- Some section titles appear twice (e.g. "official visits" is both a widget title and a smart-action link) — use `getAllByText` for those.
