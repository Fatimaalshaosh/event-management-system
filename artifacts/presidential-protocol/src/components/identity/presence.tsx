import type { Presence } from "@/lib/identity";

export const PRESENCE_COLOR: Record<Presence, string> = {
  available: "#2E7D54",
  busy: "#C98A1B",
  meeting: "#C0392B",
  offline: "#9AA0A6",
  leave: "#8B5CF6",
};

/** Live presence dot, anchored to the bottom-trailing edge of an avatar. */
export function PresenceDot({ presence, size = 12 }: { presence: Presence; size?: number }) {
  const c = PRESENCE_COLOR[presence];
  return (
    <span className="absolute rounded-full" style={{ width: size, height: size, bottom: 0, insetInlineEnd: 0, background: c, boxShadow: "0 0 0 2px var(--card, #fff)" }}>
      {presence === "available" && (
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: c, opacity: 0.45 }} />
      )}
    </span>
  );
}
