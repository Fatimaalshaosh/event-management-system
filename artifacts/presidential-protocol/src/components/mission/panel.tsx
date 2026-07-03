import type { ElementType, ReactNode } from "react";
import { palette } from "@/theme";

export const C = palette;

export function Panel({ icon: Icon, title, accent, action, children }: {
  icon: ElementType; title: string; accent?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.cardBg }}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={15} strokeWidth={1.7} style={{ color: accent ?? C.castleHill }} />
          <h3 className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Pill({ label, color, soft }: { label: string; color: string; soft?: boolean }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={soft ? { background: color + "16", color } : { background: color, color: "#fff" }}>
      {label}
    </span>
  );
}

export const LEVEL_COLOR: Record<string, string> = {
  veryHigh: C.error, high: C.sunset, medium: C.mediumWood, low: C.mangrove,
};
export const PRIORITY_COLOR: Record<string, string> = {
  critical: C.error, high: C.sunset, medium: C.mediumWood, low: C.calmTeal,
};
export const STATUS_COLOR: Record<string, string> = {
  ready: C.mangrove, inProgress: C.calmTeal, blocked: C.error, notStarted: C.warmGray,
  open: C.warmGray, satisfied: C.mangrove, atRisk: C.sunset,
};
