import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Radar } from "lucide-react";
import type { Mission, Tone } from "@/lib/mission";
import { C, Panel } from "./panel";

const TONE: Record<Tone, string> = { good: C.mangrove, warn: C.sunset, risk: C.error, info: C.castleHill };

export function SituationRoom({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const k = mission.cockpit;
  const waiting = mission.presence.filter((p) => p.waitingOn).length;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);

  const metrics: { l: string; v: string | number; tone: Tone }[] = [
    { l: t("missionEngine.situation.startedIn"), v: L(mission.countdown.label), tone: "info" },
    { l: t("missionEngine.situation.currentReadiness"), v: `${k.readiness}%`, tone: k.readiness >= 85 ? "good" : "warn" },
    { l: t("missionEngine.situation.projectedReadiness"), v: `${mission.countdown.projectedReadiness}%`, tone: "good" },
    { l: t("missionEngine.situation.confidence"), v: `${k.confidence}%`, tone: k.confidence >= 80 ? "good" : "warn" },
    { l: t("missionEngine.situation.decisions"), v: mission.decisions.length, tone: "warn" },
    { l: t("missionEngine.situation.blockedDepts"), v: k.blockingDepartments.length, tone: k.blockingDepartments.length ? "risk" : "good" },
    { l: t("missionEngine.situation.deptsWaiting"), v: waiting, tone: "warn" },
    { l: t("missionEngine.situation.criticalDeps"), v: mission.criticalPath.length, tone: "warn" },
    { l: t("missionEngine.situation.highRisks"), v: k.criticalRisks, tone: k.criticalRisks ? "risk" : "good" },
    { l: t("missionEngine.situation.attention"), v: `18 ${t("missionEngine.situation.minutes")}`, tone: "info" },
  ];

  return (
    <Panel icon={Radar} title={t("missionEngine.situation.title")} accent={C.mangrove}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-xl border p-2.5" style={{ borderColor: C.border, background: TONE[m.tone] + "08" }}>
            <p className="text-xl font-bold leading-none" style={{ color: TONE[m.tone], fontFamily: "Georgia, serif" }}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{m.l}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
