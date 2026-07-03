# Portrait Generation Engine

The prompt engine lives in `artifacts/api-server/src/routes/portraits.ts`
(`buildServerPrompt`). It is the **single source of truth** for portrait
prompts: the frontend remote provider sends only identity fields, so on-demand
and batch generation always produce the same face for the same person.

> See also: [Architecture](./Executive-Identity-Architecture.md) ·
> [Batch Generation](./Batch-Generation.md) ·
> [Portrait Overrides](./Portrait-Overrides.md)

## Inputs

Each request carries: `employeeId`, `name`, `gender`, `nationality` (ISO code),
`department`, `role`. **Appearance is built only from these explicit fields —
never inferred from the person's name.**

## Deterministic generation

All per-person variation is seeded from the stable `employeeId` using an FNV-1a
hash, so every trait is unique **and reproducible**:

```ts
function fnv(seed: string): number { /* FNV-1a → uint32 */ }
function pick<T>(id: string, salt: string, arr: T[]): T {
  return arr[fnv(id + "|" + salt) % arr.length];
}
```

Each facial trait uses a different `salt` (e.g. `"face"`, `"jaw"`, `"nose"`),
so traits vary independently. The same `employeeId` always yields the same
combination → the same prompt → a stable face.

## employeeId ownership

The output filename is `sha1(employeeId)` (see
[Architecture › Ownership](./Executive-Identity-Architecture.md#ownership-model-and-employeeid-mapping)).
The engine receives `employeeId` and uses it both as the trait seed and the
file key, so the portrait is permanently bound to the employee.

## Portrait uniqueness (facial variation)

Deterministic pools (sampled per `employeeId`):

- **Face shape** — oval, rounded, square, rectangular, heart, diamond, oblong, long-narrow, broad, angular.
- **Jawline** — strong, soft-rounded, angular, tapered, square, broad, narrow chin.
- **Nose** — straight, aquiline, narrow bridge, rounded, refined, curved, broad, small, slightly hooked.
- **Eyebrows** — full, groomed-medium, softly arched, straight, fine, thick dark, light slim.
- **Lips** — full, medium, thin upper, wide, balanced, small.
- **Eyes** — almond, hooded, deep-set, wide-set, rounded, narrow, large; East-Asian group uses monolid / double-lid / narrow variants.
- **Skin tone** — conditioned by ethnicity group (see below).
- **Hair / beard** — male hairstyles and beard styles (clean-shaven → full beard, goatee, stubble); covered by the ghutra for Emirati men (beard still varies) and by the shayla for Emirati women.
- **Glasses** — ~14% of people, thin modern frames.

Prompt clause: *"a unique distinct individual with clearly individual features
that never resemble a sibling, twin or relative of any other employee."*
Validation across the full directory found **0 duplicate faces**.

## Nationality mapping (ethnicity)

Nationality (ISO) maps to an explicit ethnicity phrase. **Unknown nationalities
become a neutral international professional — never defaulted to European.**

| ISO | Ethnicity |
|---|---|
| AE / SA / QA / KW / BH / OM | Gulf Arab (Emirati / Saudi / Qatari / Kuwaiti / Bahraini / Omani) |
| EG | Egyptian Arab / North African |
| JO | Jordanian Levantine Arab |
| MA | Moroccan North African |
| FR / GB / DE / IT / ES / CH | European (French / British / German / Italian / Spanish / Swiss) |
| US / CA / AU | American / Canadian / Australian |
| JP / CN / KR | Japanese / Chinese / Korean (East Asian) |
| IN / PK / SG | Indian / Pakistani / Singaporean (South / Southeast Asian) |
| RU | Russian Slavic |
| (unmapped) | neutral international professional |

A broader **appearance group** (`arab`, `european`, `eastasian`, `southasian`,
`namerica`, `neutral`) drives the skin-tone and eye-shape pools.

## Gender handling

Gender is taken from the explicit `gender` field (`male`/`female`). It is never
inferred from the name; a missing gender defaults explicitly to `male`. Gender
selects pronoun, attire branch, and (for visible hair) hairstyle pools.

## Attire rules

| Person | Attire |
|---|---|
| Emirati male (AE) | Perfectly pressed pristine white kandura (premium fabric), clean white ghutra, elegant black agal, no decorations |
| Emirati female (AE) | Elegant premium black abaya + refined draped black shayla, simple executive look, minimal makeup, no jewelry beyond very subtle earrings |
| Non-AE male | Refined tailored dark navy executive business suit, white shirt, conservative tie |
| Non-AE female | Refined tailored dark formal executive business suit (hair visible) |
| Driver / chauffeur | Clean professional UAE-government chauffeur uniform, plain, no badges/insignia |
| Security / guard (non-AE) | Formal dark government security-service uniform with subtle insignia |

National dress (kandura/abaya) is applied to **UAE nationals (AE)**; other
nationalities (including foreign dignitaries) wear business attire.

## Age rules (maximum 55)

Realistic modern-government ages, role-scaled, **capped at ~55 — no elderly**.
The exact age is sampled deterministically within the band, so people of the
same role still differ.

| Role | Age band |
|---|---|
| Intern / Trainee | 22–25 |
| Coordinator | 23–30 |
| Officer | 25–35 |
| Engineer / Specialist / Analyst / Legal | 27–40 |
| Senior (specialist/analyst/…) | 32–42 |
| Team Lead / Supervisor | 35–45 |
| Manager | 38–48 |
| Senior Manager | 42–50 |
| Director | 45–52 |
| Executive Director | 47–54 |
| Director General / Chief | 48–55 |
| Chairman / Secretary General / President / Minister | 50–55 |
| Ambassador / Envoy / Diplomat | 45–55 |
| Driver / Security / Reception / Assistant / Interpreter | 28–42 |

Prompt clause: *"youthful to middle-aged adult, no wrinkles, no aged or elderly
features."*

## Government studio style, lighting, framing

- **Style:** "official government employee studio headshot photographed by one
  consistent government studio photographer, ultra-realistic photograph, high
  resolution, not fashion photography, not cinematic, no AI artifacts."
- **Background:** "Plain seamless light-grey studio backdrop only. No flags, no
  emblems, no banners, no logos, no text, no buildings, no scenery, no furniture."
- **Lighting:** "soft natural government-studio lighting with gently reduced
  contrast and no dramatic shadows."
- **Framing:** "executive headshot framing showing the head and upper shoulders
  with comfortable space around the head, not cropped too tightly, in the style
  of a corporate Microsoft 365 executive profile photo," 85mm portrait lens.

## Pose variation (subtle, deterministic)

Layered on top of the unique face, each seeded from `employeeId`:

- head tilt (straight / barely left / barely right / slight)
- shoulder rotation (squared / slight left / slight right / subtle three-quarter)
- eye direction (into lens / barely off-axis — always toward the camera)
- expression (calm neutral / quietly confident / subtly approachable / composed serious-executive)
- eyebrow position, lip tension, jaw tension

Guardrails: *"varied only extremely subtly and naturally, still looking toward
the camera, never smiling broadly, never angry, never emotional."* The goal is
that 80+ portraits read as 80 different real people, not variants of one person.

## Override system

Before any generation, the service checks `PORTRAIT_OVERRIDES` (keyed by
`employeeId`). If present, the curated asset always wins — the engine is never
called for that person. See [Portrait Overrides](./Portrait-Overrides.md).

## Organization icon rules

Organizations (`embassy`, `government`, `vendor`) are **never** given a human
portrait. `ContactAvatar` (`src/components/contacts/contact-shared.tsx`) renders
a tinted type icon for them; only people (`internal`, `external`, `vip`,
`delegation`) resolve through the portrait engine. The batch script skips all
organization types.
