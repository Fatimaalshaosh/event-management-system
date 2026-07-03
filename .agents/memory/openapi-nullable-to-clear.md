---
name: OpenAPI nullable-to-clear pattern
description: To clear an optional field via PATCH in this OpenAPI-first repo, the field must be nullable in the Input/Update schema, not just the entity schema.
---

# Clearing a field via PATCH requires nullability on the Update schema

When a field can be set AND cleared from the UI (e.g. an event's `colorTag`),
making it nullable only on the read/entity schema (`Event`) is not enough. The
`*Input` and `*Update` schemas must also declare it nullable
(`type: ["string", "null"]` in `lib/api-spec/openapi.yaml`), otherwise the
generated client/zod types only allow `string | undefined`.

**Why:** PATCH semantics treat `undefined` as "leave unchanged", so sending
`undefined` cannot clear a value — you must send explicit `null`. If the Update
type isn't nullable, TypeScript rejects the `null` you need to clear it.

**How to apply:** Any time a field is toggleable/clearable from the UI, set it
nullable on all three schemas (entity, Input, Update), then run
`pnpm --filter @workspace/api-spec run codegen`. The codegen step ends with a
`typecheck:libs` that fails on a *pre-existing* integrations-openai image-client
error — orval still emits the updated types before that failure, so the
regenerated types are valid; verify them directly rather than trusting the exit code.
