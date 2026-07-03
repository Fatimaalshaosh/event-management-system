import demoData from "./demo-data.json";

/**
 * Static demo data fallback for the backend-less Vercel deployment.
 *
 * `demo-data.json` is a snapshot of the real seeded API (contacts, events,
 * approvals, risks, tasks, logistics, dashboards, …) keyed by request path.
 * It is served ONLY when a real `/api` request fails (no backend) — see
 * `custom-fetch.ts` `setDemoFallback`, registered from `main.tsx` in production.
 *
 * Local development is unaffected: when the api-server is running, real requests
 * succeed and this fallback never runs. To refresh the snapshot, re-run the
 * snapshot script against a seeded api-server. Fully reversible: delete this
 * file + its registration in `main.tsx`.
 */
const DATA = demoData as Record<string, unknown>;

export function demoFallback(method: string, url: string, body?: unknown): unknown {
  let path: string;
  try {
    const origin = typeof location !== "undefined" ? location.origin : "http://localhost";
    const u = new URL(url, origin);
    path = u.pathname + u.search;
  } catch {
    path = url;
  }
  if (!path.startsWith("/api")) return undefined;

  if (method === "GET" || method === "HEAD") {
    if (path in DATA) return DATA[path];
    const noSearch = path.split("?")[0];
    if (noSearch in DATA) return DATA[noSearch];
    return undefined; // let the original error surface for truly unknown reads
  }

  // Writes have no backend in the static demo — echo the payload so optimistic
  // UI does not crash. Nothing is persisted.
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { /* not JSON */ }
  }
  return {};
}
