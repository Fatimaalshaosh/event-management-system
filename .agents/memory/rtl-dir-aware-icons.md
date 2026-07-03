---
name: RTL dir-aware icons
description: How directional icons work in this bilingual app and the one trap that reverses them.
---

# Direction-aware icons (RTL/LTR)

`src/components/dir-icon.tsx` exports icons (ChevronEnd/Start, ArrowEnd/Start, ArrowUpEnd) that pick the lucide glyph from the **global** app direction via `useLanguage().dir`. Use them for chevrons/arrows that should flip with the UI language (back arrows, "see more" chevrons, list affordances).

**The trap:** do NOT use these dir-aware icons inside an element that has an explicit `dir="ltr"` (or `dir="rtl"`) override. They follow the *global* language direction, not the local container's, so e.g. an `ArrowEnd` inside a forced `dir="ltr"` flight route row (`origin → destination`) points **left** in Arabic and reverses the visual route. In an explicit dir-override subcontainer, use a **fixed** lucide icon (`ArrowRight`/`ArrowLeft`) matching that container's direction instead.

**Why:** explicit `dir="ltr"` is used for inherently-LTR content (flight numbers, dates, latin names, route rows). Such content reads left→right regardless of UI language, so its directional icons must be fixed, not language-flipped.

**How to apply:** when swapping a static directional icon for a dir-aware one, check it is not nested inside a `dir="ltr"`/`dir="rtl"` element. Self-closing `<Input dir="ltr">`/`<Label dir="ltr">` siblings are fine — only nesting the icon *inside* the override is the bug. Physical `text-right`/`text-left` should likewise be logical `text-end`/`text-start`; flex `justify-end`/`items-end` auto-flip with dir and are not bugs.
