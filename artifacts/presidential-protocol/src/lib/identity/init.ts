import { portraitService, createRemotePortraitProvider } from "./service";
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
 * shows the real portraits without a backend. */
export function initStaticDemoPortraits(map: Record<string, string>): void {
  const provider: PortraitProvider = {
    id: "static-demo",
    kind: "sync",
    generate: (r) => map[String(r.employeeId ?? r.key ?? "")] ?? "",
  };
  portraitService.setProvider(provider);
}
