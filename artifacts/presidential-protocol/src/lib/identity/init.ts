import { portraitService, createRemotePortraitProvider } from "./service";
import { buildPlaceholderDataUri } from "./placeholder";
import type { PortraitProvider } from "./types";

/* Opt-in activation of an external portrait provider.
 *
 * OFF by default: with no `VITE_PORTRAITS` set, the current photo/placeholder
 * provider stays in place and nothing hits the backend. Set `VITE_PORTRAITS=openai`
 * (and provide the server-side API key) to route portraits through
 * POST /api/portraits/generate. The API key is never read here — only the flag. */
export function initPortraitProvider(): void {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const mode = (env.VITE_PORTRAITS ?? "").toLowerCase();
  if (mode === "openai" || mode === "remote") {
    portraitService.setProvider(createRemotePortraitProvider("/api/portraits/generate"));
  }
}

/* Static demo portraits — for the backend-less Vercel build. Resolves each
 * person's avatar directly to a bundled image (from the employeeId→image map)
 * with no /api call. Overrides any provider set above, so the deployed demo
 * shows the real portraits without a backend.
 *
 * Resolution order for each person:
 *   1. `idMap` by contactId / employeeId — the primary key Contacts uses.
 *   2. `nameMap` by normalized name — bridges identities that share a person
 *      but use a different id-space (e.g. the Mission Engine's directory
 *      employees keyed `EMP-###`, whose name matches a Contacts `nameEn`), so
 *      they resolve to the SAME deployed portrait Contacts already shows.
 *   3. Deterministic offline vector portrait — last resort for a person who has
 *      no contact photo at all, so `src` is never empty (no broken images). */
const normalizeName = (s: string | undefined): string =>
  (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");

export function initStaticDemoPortraits(
  idMap: Record<string, string>,
  nameMap: Record<string, string> = {},
): void {
  const provider: PortraitProvider = {
    id: "static-demo",
    kind: "sync",
    generate: (r) =>
      idMap[String(r.employeeId ?? r.key ?? "")] ||
      nameMap[normalizeName(r.name)] ||
      buildPlaceholderDataUri(r),
  };
  portraitService.setProvider(provider);
}
