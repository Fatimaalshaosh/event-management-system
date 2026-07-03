---
name: Events calendar date keys
description: Why calendar grouping/filtering must normalize event dates instead of using the raw date string.
---

The events `date` column is a Postgres `text` field. Seed/list data is currently date-only ("2026-06-08"), but the create flow can write `YYYY-MM-DDTHH:mm`. Any code that groups or filters events by day/month must normalize first.

**Rule:** Use the helpers in `components/events/event-utils.tsx`:
- `eventDateKey(e)` → `yyyy-MM-dd`
- `eventMonthKey(e)` → `yyyy-MM`
- `eventTimeMinutes(e)` → minutes-from-midnight (handles ar ص/م + en am/pm; 9999 = no time)

Never key a Map or do `e.date.startsWith(...)` / `e.date.localeCompare(...)` directly — datetime strings break Month/Week/Day cell lookups and month counters.

**Why:** Calendar views (Month/Week/Day) build `format(parseISO(e.date),'yyyy-MM-dd')` lookup keys; if grouping uses raw `e.date` they silently won't match and events vanish from cells.

**How to apply:** Whenever adding new calendar views, KPIs, or "this month / today" counts for events, route through these helpers.
