import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { CountryFlag } from "@/components/reference/country-flag";
import { Clock, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, GanttChartSquare } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C } from "./panel";

export function ExecutiveDailyBrief({ mission, onOpen }: { mission: Mission; onOpen: () => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const b = mission.dailyBrief;

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, background: C.cardBg }}>
        {/* Greeting header */}
        <div className="p-6 pb-5 border-b" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${C.mangrove}12, transparent)` }}>
          <p className="text-sm text-muted-foreground">{L(b.greeting)}</p>
          <h2 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
            {mission.dna.countryCode && <CountryFlag value={mission.dna.countryCode} size={18} />}
            {lang === "en" ? mission.ctx.nameEn : mission.ctx.nameAr}
          </h2>
          <p className="flex items-center gap-1.5 text-sm mt-2" style={{ color: C.mangrove }}>
            <Clock size={15} /> {t("missionEngine.daily.startsIn")}: <span className="font-bold">{L(mission.countdown.label)}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Readiness movement */}
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground" style={{ fontFamily: "Georgia, serif" }}>{b.yesterdayReadiness}%</p>
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.yesterday")}</p>
            </div>
            <Arrow size={18} className="text-muted-foreground" />
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{b.currentReadiness}%</p>
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.current")}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: C.border }}>
              <CheckCircle2 size={16} className="mx-auto mb-1" style={{ color: C.mangrove }} />
              <p className="text-lg font-bold text-foreground">{b.completedYesterday}</p>
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.completed")} · {t("missionEngine.daily.activities")}</p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: C.border }}>
              <AlertTriangle size={16} className="mx-auto mb-1" style={{ color: C.error }} />
              <p className="text-lg font-bold text-foreground">{b.newBlockers}</p>
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.newBlockers")}</p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: C.border }}>
              <GanttChartSquare size={16} className="mx-auto mb-1" style={{ color: C.mediumWood }} />
              <p className="text-lg font-bold text-foreground">{b.decisionsRequired}</p>
              <p className="text-[10px] text-muted-foreground">{t("missionEngine.daily.decisions")}</p>
            </div>
          </div>

          <div className="rounded-xl p-3.5" style={{ background: C.gold + "12", border: `1px solid ${C.gold}44` }}>
            <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1" style={{ color: C.mediumWood }}><Sparkles size={12} /> {t("missionEngine.daily.recommendation")}</p>
            <p className="text-sm text-foreground">{L(b.recommendation)}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{t("missionEngine.daily.expectedAfter")}: <span className="font-semibold" style={{ color: C.mangrove }}>{b.projectedAfter}%</span></p>
          </div>

          <button onClick={onOpen} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md" style={{ background: C.mangrove }}>
            {t("missionEngine.daily.openMission")} <Arrow size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
