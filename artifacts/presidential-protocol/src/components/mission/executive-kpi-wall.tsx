import { useTranslation } from "react-i18next";
import { LayoutDashboard, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const KTONE = { good: C.mangrove, watch: C.sunset, risk: C.error } as const;
const toneFor = (v: number) => (v >= 85 ? "good" : v >= 70 ? "watch" : "risk");

export function ExecutiveKpiWall({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const k = mission.cockpit;
  const dim = (key: string) => mission.health.dimensions.find((d) => d.key === key)?.value ?? 80;

  const kpis: { key: string; value: string; trend: "up" | "down" | "flat"; tone: "good" | "watch" | "risk" }[] = [
    { key: "successProbability", value: `${clamp(k.readiness * 0.85 + k.confidence * 0.15)}%`, trend: "up", tone: "good" },
    { key: "diplomaticSensitivity", value: t(`missionEngine.level.${mission.dna.riskSensitivity}`), trend: "flat", tone: mission.dna.riskSensitivity === "veryHigh" || mission.dna.riskSensitivity === "high" ? "risk" : "watch" },
    { key: "executiveWorkload", value: t("missionEngine.level.medium"), trend: "flat", tone: "watch" },
    { key: "protocolCompliance", value: `${dim("protocol")}%`, trend: "up", tone: toneFor(dim("protocol")) },
    { key: "mediaReadiness", value: `${dim("media")}%`, trend: "up", tone: toneFor(dim("media")) },
    { key: "securityReadiness", value: `${dim("security")}%`, trend: "flat", tone: toneFor(dim("security")) },
    { key: "transportReliability", value: `${dim("transport")}%`, trend: "down", tone: toneFor(dim("transport")) },
    { key: "operationalEfficiency", value: `${dim("operational")}%`, trend: "up", tone: toneFor(dim("operational")) },
    { key: "decisionVelocity", value: "4.2/d", trend: "up", tone: "good" },
    { key: "departmentResponsiveness", value: "87%", trend: "up", tone: "good" },
    { key: "riskTrend", value: "↓", trend: "down", tone: "good" },
    { key: "budgetHealth", value: `${dim("budget")}%`, trend: "flat", tone: toneFor(dim("budget")) },
  ];

  return (
    <Panel icon={LayoutDashboard} title={t("missionEngine.kpi.title")} accent={C.castleHill}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => {
          const Tr = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
          return (
            <div key={kpi.key} className="rounded-xl border p-3" style={{ borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold leading-none" style={{ color: KTONE[kpi.tone], fontFamily: "Georgia, serif" }}>{kpi.value}</p>
                <Tr size={13} style={{ color: kpi.tone === "risk" ? C.error : C.mangrove }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{t(`missionEngine.kpi.${kpi.key}`)}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
