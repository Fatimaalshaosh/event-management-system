/* Deterministic vector executive portraits.
 *
 * This is the default, offline PortraitProvider rendering: an editorial
 * government-headshot — Emirati kandura + ghutra, abaya + shayla, or business
 * suit — varied by skin tone, hair, beard, glasses and age, on a soft studio
 * background. Fully deterministic from the identity signature, so the same
 * person always gets the exact same face. Swap in a real AI image provider
 * later without changing any consumer. */

import type { PortraitRequest } from "./types";

/* ── deterministic RNG ───────────────────────────────── */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── palettes ────────────────────────────────────────── */
const SKIN = ["#EBB98F", "#DCA877", "#CA9160", "#B67A4C", "#9E6539", "#80502D"];
const HAIR = ["#15110D", "#241A12", "#36271A", "#4A3525"];
const GRAY = ["#6B6B6B", "#8C8C8C", "#A6A6A6"];
const BG = [["#EDF0F3", "#D6DCE2"], ["#ECE8E2", "#D3CCC3"], ["#E7EBEE", "#CDD5DB"], ["#F0EBE6", "#D9D1C8"]];
const TIE = ["#7E2D34", "#243B53", "#1F5C4C", "#5A4A2E"];
const GHUTRA_RED = "#B23A33";

const pick = <T,>(arr: T[], r: number): T => arr[Math.floor(r * arr.length) % arr.length];

function suit(rng: () => number, tie: string, female: boolean): string {
  const coat = pick(["#222936", "#2A2E35", "#283042"], rng());
  if (female) {
    return `
      <path d="M68,400 C68,332 132,302 200,302 C268,302 332,332 332,400 Z" fill="${coat}"/>
      <path d="M176,302 L200,360 L224,302 Z" fill="#F3EEE6"/>
      <path d="M176,302 L150,360 L150,400 L172,400 L200,360 Z" fill="${coat}"/>
      <path d="M224,302 L250,360 L250,400 L228,400 L200,360 Z" fill="${coat}"/>`;
  }
  return `
    <path d="M66,400 C66,330 130,300 200,300 C270,300 334,330 334,400 Z" fill="${coat}"/>
    <path d="M176,300 L200,344 L224,300 Z" fill="#FAFAF7"/>
    <path d="M192,300 L208,300 L212,372 L200,386 L188,372 Z" fill="${tie}"/>
    <path d="M176,300 L150,332 L168,360 L184,318 Z" fill="${coat}"/>
    <path d="M224,300 L250,332 L232,360 L216,318 Z" fill="${coat}"/>`;
}

function hairTop(rng: () => number, hair: string, female: boolean): string {
  if (female) {
    return `
      <path d="M132,158 Q134,92 200,92 Q266,92 268,158 Q244,118 200,116 Q156,118 132,158 Z" fill="${hair}"/>
      <path d="M134,150 L120,286 L150,286 L158,176 Z" fill="${hair}"/>
      <path d="M266,150 L280,286 L250,286 L242,176 Z" fill="${hair}"/>`;
  }
  return rng() > 0.5
    ? `<path d="M138,156 Q142,100 200,100 Q258,100 262,156 Q240,122 200,120 Q160,122 138,156 Z" fill="${hair}"/>`
    : `<path d="M134,160 Q132,94 200,94 Q268,94 266,160 Q258,126 200,124 Q142,126 134,160 Z" fill="${hair}"/>`;
}

/* ── main ────────────────────────────────────────────── */
export function buildPortraitSvg(req: PortraitRequest): string {
  const rng = mulberry32(hashString(req.key || req.name));
  const emirati = (req.nationality || "AE").toUpperCase() === "AE";
  const female = req.gender === "female";

  const skin = pick(SKIN, rng());
  const ageGray = rng() > 0.78;
  const hair = ageGray ? pick(GRAY, rng()) : pick(HAIR, rng());
  const bg = pick(BG, rng());
  const tie = pick(TIE, rng());
  const beard = !female && (emirati ? rng() > 0.35 : rng() > 0.6);
  const glasses = rng() > 0.66;
  const smile = (rng() - 0.5) * 8;
  const eyeY = 174;

  let attireBehind = "";
  let crown = "";
  if (emirati && !female) {
    const cloth = rng() > 0.62 ? GHUTRA_RED : "#FCFCFA";
    attireBehind = `
      <path d="M112,150 L92,360 Q200,378 308,360 L288,150 Q200,120 112,150 Z" fill="${cloth}"/>
      <path d="M70,400 C70,332 132,300 200,300 C268,300 330,332 330,400 Z" fill="#FBFBF8"/>
      <path d="M200,300 L200,352" stroke="#E4E1DA" stroke-width="3"/>
      <circle cx="200" cy="330" r="3.4" fill="#D8D3C8"/>`;
    crown = `
      <path d="M126,168 Q126,96 200,94 Q274,96 274,168 Q240,150 200,150 Q160,150 126,168 Z" fill="${cloth}"/>
      <rect x="126" y="104" width="148" height="11" rx="5.5" fill="#171717"/>
      <rect x="126" y="121" width="148" height="11" rx="5.5" fill="#222222"/>`;
  } else if (emirati && female) {
    attireBehind = `
      <path d="M104,150 L86,362 Q200,382 314,362 L296,150 Q200,114 104,150 Z" fill="#16161A"/>
      <path d="M64,400 C64,330 130,300 200,300 C270,300 336,330 336,400 Z" fill="#16161A"/>
      <path d="M118,150 Q116,250 150,304 L120,348 L94,206 Z" fill="#1B1B20"/>
      <path d="M282,150 Q284,250 250,304 L280,348 L306,206 Z" fill="#1B1B20"/>`;
    crown = `<path d="M120,172 Q118,92 200,90 Q282,92 280,172 Q244,142 200,142 Q156,142 120,172 Z" fill="#1B1B20"/>`;
  } else {
    attireBehind = suit(rng, tie, female);
    crown = hairTop(rng, hair, female);
  }

  const beardFrag = beard
    ? `<path d="M142,170 Q150,250 200,256 Q250,250 258,170 Q248,214 200,216 Q152,214 142,170 Z" fill="${hair}" opacity="0.9"/>`
    : "";
  const glassesFrag = glasses
    ? `<g stroke="#2C2C2C" stroke-width="3.4" fill="none">
         <rect x="160" y="${eyeY - 11}" width="34" height="24" rx="9"/>
         <rect x="206" y="${eyeY - 11}" width="34" height="24" rx="9"/>
         <path d="M194,${eyeY} h12"/>
       </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <rect width="400" height="400" fill="url(#halo)"/>
  ${attireBehind}
  <path d="M178,232 h44 v60 q-22,14 -44,0 Z" fill="${skin}"/>
  <path d="M178,260 q22,12 44,0 v18 q-22,12 -44,0 Z" fill="#000" opacity="0.06"/>
  <ellipse cx="200" cy="166" rx="66" ry="78" fill="${skin}"/>
  <path d="M236,118 q34,48 0,96 q18,-48 0,-96 Z" fill="#000" opacity="0.07"/>
  ${crown}
  <rect x="162" y="159" width="26" height="5" rx="2.5" fill="${hair}"/>
  <rect x="212" y="159" width="26" height="5" rx="2.5" fill="${hair}"/>
  <ellipse cx="177" cy="${eyeY}" rx="8" ry="5.4" fill="#fff"/>
  <ellipse cx="223" cy="${eyeY}" rx="8" ry="5.4" fill="#fff"/>
  <circle cx="178" cy="${eyeY}" r="3.6" fill="#2A211A"/>
  <circle cx="222" cy="${eyeY}" r="3.6" fill="#2A211A"/>
  <path d="M200,178 l-7,22 q7,5 14,0 Z" fill="#000" opacity="0.06"/>
  <path d="M184,212 q16,${10 + smile} 32,0" stroke="#7A4B43" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  ${beardFrag}
  ${glassesFrag}
</svg>`;
}

export function toDataUri(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/%20/g, " ");
}

export function buildPortraitDataUri(req: PortraitRequest): string {
  return toDataUri(buildPortraitSvg(req));
}
