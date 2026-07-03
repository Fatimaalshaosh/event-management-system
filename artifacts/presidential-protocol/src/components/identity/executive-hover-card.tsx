import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Phone, Mail, MapPin, CalendarClock, ListChecks, MessageSquare, ClipboardCheck, CalendarPlus } from "lucide-react";
import { palette as C } from "@/theme";
import { usePortrait, portraitService, type ResolvedIdentity } from "@/lib/identity";
import { PRESENCE_COLOR } from "./presence";

/** Microsoft Teams-style executive card shown on avatar hover. */
export function ExecutiveHoverCard({ identity, children }: { identity: ResolvedIdentity; children: ReactNode }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const req = { key: identity.key, employeeId: identity.employeeId, name: identity.name, gender: identity.gender, nationality: identity.nationality, role: identity.role, department: identity.department };
  const url = usePortrait(req);

  const show = () => {
    timer.current = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const w = 300;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      const top = r.bottom + 280 > window.innerHeight ? Math.max(8, r.top - 280) : r.bottom + 8;
      setPos({ top, left });
      setOpen(true);
    }, 320);
  };
  const hide = () => { window.clearTimeout(timer.current); setOpen(false); };

  const name = lang === "ar" && identity.nameAr ? identity.nameAr : identity.name;
  const role = lang === "ar" && identity.roleAr ? identity.roleAr : identity.role;
  const rows: { icon: typeof Phone; v?: string }[] = [
    { icon: ListChecks, v: identity.tasks != null ? `${identity.tasks} ${t("identity.tasks")}` : undefined },
    { icon: CalendarClock, v: identity.nextMeeting },
    { icon: Phone, v: identity.phone },
    { icon: Mail, v: identity.email },
    { icon: MapPin, v: identity.office },
  ].filter((r) => r.v);

  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className="inline-flex">
      {children}
      {open && createPortal(
        <div className="fixed z-[130] w-[300px] rounded-2xl border shadow-2xl overflow-hidden" style={{ top: pos.top, left: pos.left, borderColor: C.border, background: C.cardBg }} dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="h-12" style={{ background: identity.deptColor }} />
          <div className="px-4 pb-4 -mt-7">
            <img src={url} onError={(e) => { (e.currentTarget as HTMLImageElement).src = portraitService.fallback(req); }} alt={name} width={60} height={60} className="rounded-full object-cover" style={{ border: "3px solid var(--card,#fff)", boxShadow: "0 2px 8px rgba(28,40,30,.2)" }} />
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-sm font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{name}</p>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: identity.deptColor + "1A", color: identity.deptColor }}>{identity.badge.glyph}</span>
            </div>
            {role && <p className="text-[11px] text-muted-foreground">{role}</p>}
            <div className="flex items-center gap-1.5 mt-2 text-[11px]" style={{ color: PRESENCE_COLOR[identity.presence] }}>
              <span className="w-2 h-2 rounded-full" style={{ background: PRESENCE_COLOR[identity.presence] }} />
              {t(`identity.${identity.presence}`)}
            </div>
            <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: C.border }}>
              {rows.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <r.icon size={12} className="shrink-0" /> <span className="truncate">{r.v}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-[11px] font-medium py-1.5 rounded-lg" style={{ background: identity.deptColor + "14", color: identity.deptColor }}>{t("identity.openProfile")}</button>
            <div className="mt-1.5 grid grid-cols-5 gap-1">
              {[
                { i: MessageSquare, l: "message", a: () => {} },
                { i: ClipboardCheck, l: "assignTask", a: () => {} },
                { i: Mail, l: "email", a: () => { if (identity.email) window.location.href = `mailto:${identity.email}`; } },
                { i: Phone, l: "call", a: () => { if (identity.phone) window.location.href = `tel:${identity.phone.replace(/\s/g, "")}`; } },
                { i: CalendarPlus, l: "schedule", a: () => {} },
              ].map((x, i) => (
                <button key={i} title={t(`identity.${x.l}`)} onClick={x.a} className="flex items-center justify-center py-1.5 rounded-lg border hover:bg-muted/40 transition-colors" style={{ borderColor: C.border, color: C.castleHill }}>
                  <x.i size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
