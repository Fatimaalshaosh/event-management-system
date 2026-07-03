---
name: Favorite events always render
description: Why the Favorite Events section (Events page) and My Favorite Events widget (dashboard) render unconditionally with empty states.
---

# Favorite/Pinned events: render unconditionally

The Events-page "Favorite Events" section (PinnedSection) and the dashboard "My Favorite Events" widget (TopPinnedWidget) must render **even when no events are pinned**, falling back to their built-in empty states ("No pinned events yet…").

**Why:** The user previously perceived the pin feature as "missing/not working" when these were gated on `events.some(e => e.pinned)` — with zero pins there was no visible affordance telling them the feature existed. Always showing the section (with guidance to use the star) keeps it discoverable.

**How to apply:** Do not re-add a `.some(e => e.pinned)` guard around these two components. The Watched/SmartMonitoring counterparts stay conditional (they are a secondary feature). Pin accent color is the app-wide brand `#AD8965` (centralized as `T.gold` in event-utils.tsx, matching login/family-tree/fleet pages) — not the old `#C9A24B`.

# Pin toggle on Event Details must patch TWO caches

The Event Details page reads from `useGetEvent(id)` (key `getGetEventQueryKey(id)`), a **different** query key than the list (`getListEventsQueryKey()`) that feeds the Events page, the dashboard widget, and the favorites section. A pin toggle on the detail page (`EventFavoriteButton` in event-card.tsx) must optimistically update **both** caches and invalidate both on settle, or the surfaces drift out of sync until refresh. The list-only `PinWatchControls` (used on cards) only needs the list cache because cards never read the single-event query.

**Why:** Optimistically patching only one cache leaves the other showing stale `pinned` state with no reload — the user's whole requirement was instant cross-page sync.

**How to apply:** For correctness under rapid clicks, derive `next` from the latest cache (`qc.getQueryData(detailKey)?.pinned`) not the render-captured prop, `cancelQueries` both keys before the optimistic write, snapshot+rollback both on error, and `disabled={update.isPending}`.
