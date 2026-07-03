import { toDataUri } from "./portrait";

/** Deterministic executive cover banner, tinted by the person's department.
 * A stand-in for AI-generated role covers (operations center, palace, studio…)
 * — swap the generator without changing consumers. */
export function buildCoverDataUri(color: string, glyph: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" width="1200" height="300">
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}"/></linearGradient>
      <radialGradient id="cl" cx="0.18" cy="0.2" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="300" fill="url(#cg)"/>
    <rect width="1200" height="300" fill="#000000" opacity="0.16"/>
    <rect width="1200" height="300" fill="url(#cl)"/>
    <g fill="#ffffff" opacity="0.07"><circle cx="1040" cy="64" r="170"/><circle cx="160" cy="330" r="190"/></g>
    <text x="1070" y="232" font-size="210" opacity="0.10" fill="#ffffff" text-anchor="middle">${glyph}</text>
  </svg>`;
  return toDataUri(svg);
}
