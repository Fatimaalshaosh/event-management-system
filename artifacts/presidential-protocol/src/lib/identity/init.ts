import { portraitService, createRemotePortraitProvider } from "./service";

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
