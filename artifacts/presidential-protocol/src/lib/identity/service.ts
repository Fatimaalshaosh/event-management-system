/* PortraitService + PortraitCache + PortraitProvider registry.
 *
 * The UI only ever talks to `portraitService`. The default provider renders
 * deterministic vector portraits offline; calling `portraitService.setProvider`
 * with a RemotePortraitProvider connects OpenAI Images / Gemini / Flux / Azure
 * OpenAI etc. with zero UI changes. Resolved portraits are cached permanently
 * (memory + localStorage), so each person keeps one consistent face. */

import type { PortraitProvider, PortraitRequest } from "./types";
import { buildPortraitDataUri } from "./portrait";
import { buildPlaceholderDataUri, PlaceholderPortraitProvider } from "./placeholder";

export const ProceduralPortraitProvider: PortraitProvider = {
  id: "procedural-vector",
  kind: "sync",
  generate: (r) => buildPortraitDataUri(r),
};

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Default provider: deterministic, gendered, royalty-free executive headshots.
 * A real-photo stand-in until an enterprise AI portrait API is connected via
 * `createRemotePortraitProvider`. The procedural vector provider remains the
 * offline fallback (used automatically if a photo fails to load). */
export const PhotoPortraitProvider: PortraitProvider = {
  id: "photo-headshots",
  kind: "sync",
  generate(req) {
    const female = req.gender === "female";
    const idx = hash(req.key) % 100;
    return `https://randomuser.me/api/portraits/${female ? "women" : "men"}/${idx}.jpg`;
  },
};

/** Seam for an enterprise image API. Disabled until wired by `setProvider`. */
export function createRemotePortraitProvider(endpoint: string): PortraitProvider {
  return {
    id: "remote",
    kind: "async",
    async generate(r) {
      // Send only the identity fields; the api-server is the single prompt
      // engine (complete identity profile: unique features, capped realistic
      // age, nationality-matched ethnicity, attire, consistent studio), so a
      // person looks identical whether generated on-demand or in a batch.
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(r),
      });
      if (!res.ok) throw new Error("portrait provider failed");
      const j = (await res.json()) as { url: string };
      return j.url;
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Permanent, human-curated portrait overrides — keyed by employeeId.
 *
 * If an id appears here, this exact asset ALWAYS wins: it is checked before the
 * cache and before any provider, so the AI provider (OpenAI) is never called,
 * the portrait is never generated, never regenerated, and never replaced. The
 * same image is therefore used everywhere in the app (nav, sidebar, contacts,
 * hover card, mission engine, tasks, approvals, mentions, timeline, activity,
 * search, people picker, org chart, attendees, calendar, notifications, …),
 * because every Executive Identity surface resolves through portraitService.
 *
 * Files live in `public/portraits/` and are served at `/portraits/<file>`.
 * ───────────────────────────────────────────────────────────────────────── */
export const PORTRAIT_OVERRIDES: Record<string, string> = {
  // Fatima Darwish — Chief of Protocol (signed-in executive). Permanent official portrait.
  me: "/portraits/fatima-darwish.png",
};

/** The override URL for a request, if one is pinned for this employeeId/key. */
export function portraitOverride(req: Pick<PortraitRequest, "employeeId" | "key">): string | undefined {
  const id = req.employeeId ?? req.key;
  return id != null ? PORTRAIT_OVERRIDES[id] : undefined;
}

/** Whether a given id has a permanent override (used to skip it during batch
 * generation so it is never regenerated). */
export function hasPortraitOverride(id: string | number | null | undefined): boolean {
  return id != null && Object.prototype.hasOwnProperty.call(PORTRAIT_OVERRIDES, String(id));
}

/* Portrait cache version. Bump this whenever portraits are regenerated: it is
 * appended to every served portrait URL (?v=) so browsers fetch the fresh image
 * instead of an old immutable-cached one, and it is folded into the localStorage
 * namespace so stale cached URLs are dropped automatically — no manual clearing. */
export const PORTRAIT_VERSION = "2026-06-29.4";

/** Append the cache version to our served portrait assets (not data: URIs). */
function versioned(url: string): string {
  if (!/\/(api\/portraits\/files|portraits)\//.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(PORTRAIT_VERSION);
}

class PortraitCache {
  private mem = new Map<string, string>();
  private ns = "execPortrait:" + PORTRAIT_VERSION + ":";
  get(key: string): string | undefined {
    if (this.mem.has(key)) return this.mem.get(key);
    try {
      const v = localStorage.getItem(this.ns + key);
      if (v) { this.mem.set(key, v); return v; }
    } catch { /* SSR / disabled storage */ }
    return undefined;
  }
  set(key: string, url: string): void {
    this.mem.set(key, url);
    try { localStorage.setItem(this.ns + key, url); } catch { /* ignore quota */ }
  }
}

class PortraitService {
  // Real human portraits by default; the monogram placeholder is the load
  // fallback (used only if a photo fails). Swap to a real AI provider later.
  private provider: PortraitProvider = PhotoPortraitProvider;
  private cache = new PortraitCache();

  setProvider(p: PortraitProvider): void { this.provider = p; }
  activeProviderId(): string { return this.provider.id; }

  /** Offline placeholder used if a provider image fails to load. */
  fallback(req: PortraitRequest): string { return buildPlaceholderDataUri(req); }

  /** Cache key is provider-scoped, so switching providers never serves a stale
   * portrait from a previous provider. */
  private ck(req: PortraitRequest): string { return this.provider.id + ":" + (req.employeeId ?? req.key); }

  /** Immediate, never-blocking portrait: cached final, else the active sync
   * provider's URL, else a procedural face. */
  getPlaceholder(req: PortraitRequest): string {
    const override = portraitOverride(req);
    if (override) return versioned(override); // permanent curated portrait — never a provider/AI call
    const cached = this.cache.get(this.ck(req));
    if (cached) return cached;
    if (this.provider.kind === "sync") {
      try { return versioned(this.provider.generate(req) as string); } catch { /* fall through */ }
    }
    return buildPlaceholderDataUri(req);
  }

  /** Final portrait from the active provider (sync resolves instantly; a remote
   * provider fills the cache and upgrades the placeholder). */
  async resolve(req: PortraitRequest): Promise<string> {
    const override = portraitOverride(req);
    if (override) return versioned(override); // permanent curated portrait — never regenerated/replaced
    const cached = this.cache.get(this.ck(req));
    if (cached) return cached;
    const raw = this.provider.kind === "sync"
      ? (this.provider.generate(req) as string)
      : await this.provider.generate(req);
    const url = versioned(raw);
    this.cache.set(this.ck(req), url);
    return url;
  }
}

export const portraitService = new PortraitService();
