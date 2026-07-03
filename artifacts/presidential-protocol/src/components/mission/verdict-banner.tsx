import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import type { Bi, Mission, VerdictLevel } from "@/lib/mission";
import { C } from "./panel";

const META: Record<VerdictLevel, { color: string; icon: typeof ShieldCheck }> = {
  ready: { color: C.mangrove, icon: ShieldCheck },
  atRisk: { color: C.sunset, icon: ShieldAlert },
  blocked: { color: C.error, icon: ShieldX },
};

export function VerdictBanner({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  const v = mission.verdict;
  const meta = META[v.level];
  const Icon = meta.icon;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const waiting = mission.presence.filter((p) => p.waitingOn).length;

  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: meta.color + "66", background: `linear-gradient(135deg, ${meta.color}14, ${C.cardBg} 55%)` }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* Verdict */}
        <div className="p-5 lg:border-e" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: meta.color + "1F", color: meta.color }}>
              <Icon size={26} strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("missionEngine.cockpit")}</p>
              <h2 className="text-2xl font-bold leading-tight" style={{ color: meta.color, fontFamily: "Georgia, serif" }}>{L(v.headline)}</h2>
            </div>
          </div>
          <p className="text-sm text-foreground mt-3 leading-relaxed">{L(v.reason)}</p>
          <div className="mt-3 rounded-xl p-3" style={{ background: meta.color + "0F", border: `1px solid ${meta.color}44` }}>
            <p className="text-[11px] font-medium mb-0.5" style={{ color: meta.color }}>{t("missionEngine.verdict.requiredAction")}</p>
            <p className="text-sm font-medium text-foreground flex items-start gap-1.5"><Arrow size={15} className="mt-0.5 shrink-0" style={{ color: meta.color }} /> {L(v.action)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{t("missionEngine.verdict.expectedImpact")}: {L(v.impact)}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl p-2.5" style={{ background: C.mangrove + "0D" }}>
            <Clock size={16} style={{ color: C.mangrove }} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.startsIn")}</p>
              <p className="text-base font-bold text-foreground">{L(mission.countdown.label)}</p>
            </div>
            <div className="text-end">
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.countdown.projectedOnArrival")}</p>
              <p className="text-base font-bold" style={{ color: C.calmTeal }}>{mission.countdown.projectedReadiness}%</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { v: `${mission.cockpit.readiness}%`, l: t("missionEngine.readiness"), c: C.mangrove },
              { v: mission.cockpit.criticalRisks, l: t("missionEngine.criticalRisks"), c: C.error },
              { v: mission.decisions.length, l: t("missionEngine.decisions"), c: C.mediumWood },
              { v: waiting, l: t("missionEngine.presence.departmentsWaiting"), c: C.sunset },
            ].map((m, i) => (
              <div key={i} className="rounded-lg border p-2" style={{ borderColor: C.border }}>
                <p className="text-lg font-bold" style={{ color: m.c, fontFamily: "Georgia, serif" }}>{m.v}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{m.l}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-2.5" style={{ background: C.gold + "12", border: `1px solid ${C.gold}44` }}>
            <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: C.mediumWood }}><Sparkles size={12} /> {t("missionEngine.daily.recommendation")}</p>
            <p className="text-xs text-foreground mt-0.5">{L(mission.dailyBrief.recommendation)} <span className="text-muted-foreground">· {t("missionEngine.daily.expectedAfter")}: {mission.dailyBrief.projectedAfter}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
