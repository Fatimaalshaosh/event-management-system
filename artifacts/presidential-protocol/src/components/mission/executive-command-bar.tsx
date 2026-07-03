import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { ShieldCheck, ShieldAlert, ShieldX, Search, Pencil } from "lucide-react";
import { CountryFlag } from "@/components/reference/country-flag";
import type { Mission } from "@/lib/mission";
import { C } from "./panel";

/** Layer 1 — the always-visible executive command bar. Condenses the mission's
 * decisive numbers into one sticky row so executives never scroll to find them. */
export function ExecutiveCommandBar({ mission, onEditBrief, onPalette }: {
  mission: Mission; onEditBrief: () => void; onPalette: () => void;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const v = mission.verdict.level;
  const tone = v === "blocked" ? C.error : v === "atRisk" ? C.sunset : C.mangrove;
  const VIcon = v === "blocked" ? ShieldX : v === "atRisk" ? ShieldAlert : ShieldCheck;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);
  const k = mission.cockpit;
  const waiting = mission.presence.filter((p) => p.waitingOn).length;
  const b = "missionEngine.nav.bar";

  const stats: { l: string; v: string; c: string }[] = [
    { l: t(`${b}.readiness`), v: `${k.readiness}%`, c: k.readiness >= 85 ? C.mangrove : C.sunset },
    { l: t(`${b}.projected`), v: `${mission.countdown.projectedReadiness}%`, c: C.mangrove },
    { l: t(`${b}.countdown`), v: L(mission.countdown.label), c: C.castleHill },
    { l: t(`${b}.criticalPath`), v: `${mission.criticalPath.length} ${t(`${b}.steps`)}`, c: C.error },
    { l: t(`${b}.decisions`), v: String(mission.decisions.length), c: C.mediumWood },
    { l: t(`${b}.alerts`), v: String(k.criticalRisks), c: C.error },
    { l: t(`${b}.waiting`), v: String(waiting), c: C.sunset },
  ];

  return (
    <div className="rounded-2xl border shadow-sm px-3 sm:px-4 py-2 flex items-center gap-x-3 gap-y-2 flex-wrap" style={{ borderColor: C.border, background: C.cardBg }}>
      {/* Identity */}
      <div className="flex items-center gap-2 pe-3 border-e min-w-0" style={{ borderColor: C.border }}>
        {mission.dna.countryCode && <CountryFlag value={mission.dna.countryCode} size={14} />}
        <p className="text-xs font-semibold truncate max-w-[150px]" style={{ fontFamily: "Georgia, serif" }}>{lang === "en" ? mission.ctx.nameEn : mission.ctx.nameAr}</p>
      </div>

      {/* Verdict */}
      <div className="flex items-center gap-2 pe-3 border-e" style={{ borderColor: C.border }}>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: tone + "18", color: tone }}><VIcon size={16} strokeWidth={1.8} /></span>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none">{t(`missionEngine.verdict.${v}`)}</p>
          <p className="text-sm font-bold leading-tight" style={{ color: tone, fontFamily: "Georgia, serif" }}>{L(mission.verdict.headline)}</p>
        </div>
      </div>

      {/* Decisive numbers */}
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap flex-1">
        {stats.map((s, i) => (
          <div key={i} className="text-center min-w-[44px]">
            <p className="text-sm font-bold leading-none" style={{ color: s.c }}>{s.v}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 ms-auto">
        <button onClick={onPalette} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border hover:bg-muted/30 transition-colors" style={{ borderColor: C.border, color: C.castleHill }}>
          <Search size={12} /> {t(`${b}.search`)}
          <kbd className="text-[9px] px-1 py-px rounded border font-sans" style={{ borderColor: C.border }}>Ctrl K</kbd>
        </button>
        <button onClick={onEditBrief} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border hover:bg-muted/30 transition-colors" style={{ borderColor: C.border, color: C.castleHill }}>
          <Pencil size={12} /> <span className="hidden sm:inline">{t(`${b}.editBrief`)}</span>
        </button>
      </div>
    </div>
  );
}
