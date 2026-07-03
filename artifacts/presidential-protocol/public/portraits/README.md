# Permanent curated executive portraits

Files here are **human-curated, permanent** portraits that override AI generation.
They are bound to an `employeeId` in `src/lib/identity/service.ts` →
`PORTRAIT_OVERRIDES`. When an id has an override:

- the AI provider (OpenAI) is **never** called for that person,
- the portrait is **never** generated, regenerated, or replaced,
- this exact image is used **everywhere** in the app (every Executive Identity
  surface resolves through `portraitService`).

Served at `/portraits/<file>` (Vite serves `public/` at the web root).

## Required files

| employeeId | file | used for |
|---|---|---|
| `me` | `fatima-darwish.png` | Fatima Darwish — Chief of Protocol (signed-in executive) |

### `fatima-darwish.png`
- High-resolution square PNG (≥ 1024×1024 recommended; the supplied image is ~1248²).
- Cropped/centered on the face. The avatar renders with `object-fit: cover` and
  centered `object-position`, so a single high-res square file stays sharp at
  every avatar size (48 / 64 / 96 / 256 px) — physical size variants are an
  optional network optimization, not required for correct display.

## Optional size variants
If you want pre-sized files, generate `fatima-darwish-48.png`, `-64`, `-96`,
`-256` (center-cropped square). They are not referenced by default; the single
high-res file is sufficient.
