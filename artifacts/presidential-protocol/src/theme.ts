/**
 * Single source of truth for the luxury UAE palette + elevation tokens.
 *
 * Historically these values were copy-pasted as a local `const T/C/P = {…}`
 * block in ~32 files. This module centralizes them. To keep every screen
 * pixel-identical, it intentionally exposes **synonym keys** that different
 * files used for the same value (e.g. `mangrove`/`green`, `calmTeal`/`teal`,
 * `floralWhite`/`bg`/`pageBg`). Files that used a divergent value for a key
 * (e.g. a lighter `border`, or a one-off `shadow`) spread `palette` and
 * override just that key locally — so no color changes.
 */
export const palette = {
  // ── Brand ─────────────────────────────────────────────
  mangrove: "#67835C",
  green: "#67835C",
  mediumWood: "#AD8965",
  gold: "#AD8965",
  calmTeal: "#97B2B1",
  teal: "#97B2B1",
  castleHill: "#95837A",
  secondary: "#95837A",
  sub: "#95837A",
  sunset: "#EBCCAD",
  goldLight: "#EBCCAD",
  sunsetLight: "#EDD9BC",
  warmGray: "#8A7A70",
  textPrimary: "#4B4038",
  text: "#4B4038",

  // ── Surfaces ──────────────────────────────────────────
  floralWhite: "#FCF7EE",
  floral: "#FCF7EE",
  bg: "#FCF7EE",
  pageBg: "#FCF7EE",
  cardBg: "#FEFCF9",
  card: "#FFFDF9",
  cream: "#FFFDF9",
  paperBg: "#FFFDF9",
  cardSpouse: "#F8F3EE",

  // ── Borders / dividers ────────────────────────────────
  border: "rgba(103,90,81,0.18)",
  borderSoft: "rgba(103,90,81,0.10)",
  borderStrong: "rgba(103,90,81,0.22)",
  borderSolid: "#E2D8CC",
  connector: "#CEC0AF",

  // ── Accents / status ──────────────────────────────────
  alert: "#C0623D",
  error: "#C84B38",

  // ── Elevation ─────────────────────────────────────────
  shadowMd: "0 4px 20px rgba(61,53,41,0.12)",
  shadowLg: "0 8px 32px rgba(61,53,41,0.14), 0 2px 8px rgba(61,53,41,0.07)",
  shadowHover: "0 8px 28px rgba(61,53,41,0.16)",
  shadowGold: "0 6px 24px rgba(173,137,101,0.22), 0 2px 8px rgba(173,137,101,0.12)",
} as const;

export type Palette = typeof palette;
