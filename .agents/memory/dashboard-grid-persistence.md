---
name: Dashboard grid architecture
description: How the Presidential Protocol dashboard widget grid is laid out and why it is NOT react-grid-layout.
---

# Dashboard widget grid

The dashboard widget board is a **deterministic CSS Grid**, not react-grid-layout.

**Why:** RGL 1.5.0 positions items with `transform: translate(left,…)` (no RTL
awareness) and its `WidthProvider` mis-measured the container in this RTL app,
collapsing the responsive breakpoint so half-width widgets became a single
full-width column pinned to the RTL start (right), leaving the left half empty.
Fighting RGL's width-measurement + RTL was unreliable.

**How it works now:**
- Each widget has a fixed home column + display order: `RIGHT_COLUMN` /
  `LEFT_COLUMN` in `widget-meta.ts`. `splitColumns(visibleIds)` filters the
  visible set into those two ordered lists.
- `customizable-grid.tsx` renders `grid grid-cols-1 lg:grid-cols-2 gap-6` with
  the right column rendered first. CSS Grid mirrors for `dir` automatically:
  the primary column reads first (right in Arabic RTL, left in English LTR).
- Fallback: if one canonical column is empty for the current visible set, it
  renders a single full-width stack so the board never collapses to half width.

**How to apply:**
- To move a widget between columns or reorder within a column, edit
  `RIGHT_COLUMN`/`LEFT_COLUMN` — that is the single source of truth for layout.
- Drag-to-reorder is intentionally gone (it was RGL-only). Customization now =
  templates + hide/show + profiles. The x/y coords still stored in
  `WidgetItem`/`pairLayout` are vestigial for the renderer (only `hidden` and
  membership matter); don't reintroduce coordinate-based rendering.
- Profiles persist via `use-dashboard-layout` (per-owner key, debounced save).
  Seeding only runs when a profile list is empty, so changing `DEFAULT_VISIBLE`
  does NOT retro-apply to existing stored profiles — those re-render through the
  canonical columns, and a user "reset to default" adopts the new set.
