import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { SlidersHorizontal, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { simulateReadiness, type Mission, type SimScenario } from "@/lib/mission";
import { C, Panel } from "./panel";

export function ReadinessSimulator({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [scen, setScen] = useState<SimScenario[]>(mission.simScenarios);
  const L = (x: { en: string; ar: string }) => (lang === "en" ? x.en : x.ar);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const base = mission.cockpit.readiness;
  const simulated = simulateReadiness(base, scen);
  const delta = simulated - base;
  const toggle = (k: string) => setScen((p) => p.map((s) => (s.key === k ? { ...s, active: !s.active } : s)));

  return (
    <Panel icon={SlidersHorizontal} title={t("missionEngine.sim.title")} accent={C.calmTeal}
      action={scen.some((s) => s.active) ? <button onClick={() => setScen(mission.simScenarios)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><RotateCcw size={11} /> {t("missionEngine.sim.reset")}</button> : undefined}>
      <div className="flex items-center justify-center gap-4 py-2 mb-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground" style={{ fontFamily: "Georgia, serif" }}>{base}%</p>
          <p className="text-[10px] text-muted-foreground">{t("missionEngine.sim.base")}</p>
        </div>
        <Arrow size={18} className="text-muted-foreground" />
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: delta < 0 ? C.error : C.mangrove, fontFamily: "Georgia, serif" }}>{simulated}%</p>
          <p className="text-[10px] text-muted-foreground">{t("missionEngine.sim.simulated")}{delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">{t("missionEngine.sim.hint")}</p>
      <div className="space-y-1.5">
        {scen.map((s) => (
          <button key={s.key} onClick={() => toggle(s.key)} className="w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start transition-all"
            style={s.active ? { borderColor: C.calmTeal, background: C.calmTeal + "0F" } : { borderColor: C.border }}>
            <span className="flex items-center gap-2">
              <span className="w-8 h-4 rounded-full flex items-center px-0.5 transition-all" style={{ background: s.active ? C.calmTeal : C.border, justifyContent: s.active ? "flex-end" : "flex-start" }}>
                <span className="w-3 h-3 rounded-full bg-white" />
              </span>
              <span className="text-[11px] text-foreground">{L(s.label)}</span>
            </span>
            <span className="text-[11px] font-semibold" style={{ color: s.deltaReadiness < 0 ? C.error : C.mangrove }}>{s.deltaReadiness > 0 ? "+" : ""}{s.deltaReadiness}%</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
