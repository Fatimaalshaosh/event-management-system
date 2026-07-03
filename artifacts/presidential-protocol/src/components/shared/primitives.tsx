import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { palette } from "@/theme";

/**
 * Small presentational primitives shared by the event command center tabs
 * (previously duplicated verbatim in flights-tab and hotels-tab). Markup is
 * byte-for-byte identical to the originals so screens stay pixel-identical.
 */

export function Field({
  label,
  half,
  children,
}: {
  label: string;
  half?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${half ? "" : "md:col-span-2"}`}>
      <Label className="block text-sm text-end">{label}</Label>
      {children}
    </div>
  );
}

export function ProfileRow({
  icon: Icon,
  label,
  value,
  empty,
  ltr,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  empty?: string;
  ltr?: boolean;
  mono?: boolean;
}) {
  const has = value != null && value !== "";
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-t first:border-t-0" style={{ borderColor: palette.border }}>
      <span className={`text-xs ${has ? "text-foreground" : "text-muted-foreground italic"} ${mono ? "font-mono" : ""}`} dir={ltr && has ? "ltr" : undefined}>
        {has ? value : (empty ?? "—")}
      </span>
      <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: palette.castleHill }}>
        {label}
        <Icon size={12} strokeWidth={1.5} />
      </span>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: palette.border, background: palette.cardBg }}>
      <Inbox size={36} className="mx-auto mb-3 opacity-15" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
