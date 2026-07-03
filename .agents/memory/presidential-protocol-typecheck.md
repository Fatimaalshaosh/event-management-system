---
name: Presidential Protocol typecheck
description: Pre-existing typecheck noise in the frontend and the lib build-order gotcha.
---

`pnpm --filter @workspace/presidential-protocol run typecheck` currently reports pre-existing errors that are NOT caused by feature work and should be ignored unless the task is specifically to fix them:
- `dashboard.tsx`: missing `queryKey` on a useQuery options object; `ReadinessCategory.completed` / `.total` do not exist on the generated type.
- `event-detail.tsx`: missing `queryKey` on two useQuery options objects.

**Why:** These stem from generated react-query hook option typing and a stale/mismatched ReadinessCategory shape, predating recent feature work. Treat a clean run as "no NEW errors beyond these."

**Lib build order:** After editing `lib/*` (e.g. db schema), run `pnpm run typecheck:libs` BEFORE the artifact typecheck — composite lib declarations must rebuild first or you get phantom "missing export" errors.

**Codegen quirk:** `pnpm --filter @workspace/api-spec run codegen` runs a typecheck step that can fail on an unrelated `integrations-openai-ai-server` image client error, but orval still emits the generated files successfully.
