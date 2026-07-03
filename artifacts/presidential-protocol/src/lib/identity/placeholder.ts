/* Premium role-aware placeholder portraits.
 *
 * Per the executive-identity spec: until a real AI portrait provider is
 * connected, render a dignified government placeholder rather than an incorrect
 * casual photo. Each placeholder is a department-tinted executive monogram with
 * a faceless attire silhouette derived from the employee's role (kandura/ghutra,
 * abaya/shayla, business suit, or uniform). Deterministic, unique per person
 * (initials), and clearly a "portrait pending" state — never a fake face. */

import { palette } from "@/theme";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import { toDataUri } from "./portrait";
import { portraitProfile, type SilhouetteAttire } from "./portrait-profile";
import type { PortraitProvider, PortraitRequest } from "./types";

function initialsOf(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

/** Faceless head + shoulders silhouette conveying attire, no facial features. */
function silhouette(attire: SilhouetteAttire): string {
  const shoulders = `<path d="M64,402 C64,330 130,300 200,300 C270,300 336,330 336,402 Z"/>`;
  const head = `<ellipse cx="200" cy="196" rx="54" ry="62"/>`;
  if (attire === "kandura") {
    return `${shoulders}<path d="M118,156 L102,402 L298,402 L282,156 Q200,120 118,156 Z"/>${head}<path d="M142,170 Q142,104 200,102 Q258,104 258,170 Q230,150 200,150 Q170,150 142,170 Z"/><rect x="148" y="116" width="104" height="9" rx="4"/>`;
  }
  if (attire === "abaya") {
    return `<path d="M104,150 L82,402 L318,402 L296,150 Q200,112 104,150 Z"/>${head}<path d="M130,176 Q128,104 200,102 Q272,104 270,176 Q238,150 200,150 Q162,150 130,176 Z"/>`;
  }
  // suit / security / driver — collar + lapel notch
  return `${shoulders}${head}<path d="M176,300 L200,346 L224,300 Z" fill-opacity="0.5"/>`;
}

export function buildPlaceholderSvg(req: PortraitRequest): string {
  const p = portraitProfile(req);
  const base = (req.department && DEPARTMENT_BY_KEY[req.department]?.color) || palette.mediumWood;
  const initials = initialsOf(req.name) || "•";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${base}"/></linearGradient>
    <radialGradient id="pl" cx="0.5" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffffff" stop-opacity="0.26"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#pg)"/>
  <rect width="400" height="400" fill="#0b1f17" opacity="0.22"/>
  <rect width="400" height="400" fill="url(#pl)"/>
  <g fill="#ffffff" opacity="0.14">${silhouette(p.attire)}</g>
  <text x="200" y="206" font-family="Georgia, 'Times New Roman', serif" font-size="150" font-weight="700" fill="#ffffff" fill-opacity="0.94" text-anchor="middle" dominant-baseline="central">${initials}</text>
</svg>`;
}

export function buildPlaceholderDataUri(req: PortraitRequest): string {
  return toDataUri(buildPlaceholderSvg(req));
}

/** Default provider: dignified government placeholders (no incorrect photos). */
export const PlaceholderPortraitProvider: PortraitProvider = {
  id: "placeholder-executive",
  kind: "sync",
  generate: (r) => buildPlaceholderDataUri(r),
};
