---
name: Masonry dnd dense-flow conflict
description: Why CSS grid dense packing must be disabled while drag-reordering in the dashboard customizable grid
---

# Masonry dense packing vs. dnd-kit reorder

The customizable dashboard grid packs widgets with a row-span masonry: a 12-col
CSS grid with `gridAutoRows` ~8px and each card setting `gridRowEnd: span N`
where N is derived from its measured height (`ResizeObserver` on the card). This
eliminates the large vertical gaps a plain col-span grid leaves.

**Rule:** `gridAutoFlow` must be `"row dense"` only when *viewing*, and plain
`"row"` while *editing* (drag-to-reorder active).

**Why:** dense flow lets the browser pull a later-source-order card up into an
earlier visual gap, so visual position diverges from DOM/source order. dnd-kit
reorder computes the target index from the source-order `ids` array, so dropping
onto a card under dense flow can persist an order that doesn't match what the
user visually arranged. Switching to `"row"` while editing makes visual order ==
source order, so reorders stay deterministic. Gaps during edit mode are
acceptable; tight packing only matters in the read-only executive view.

**How to apply:** keep the `gridAutoFlow: editMode ? "row" : "row dense"` toggle.
If you ever make dense packing always-on, you must also replace source-index
reorder with positional metadata + a custom sorting strategy aligned to visual
placement.
