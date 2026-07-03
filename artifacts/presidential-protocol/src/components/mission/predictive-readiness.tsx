import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { Mission } from "@/lib/mission";
import { C, Panel, Pill, LEVEL_COLOR } from "./panel";

export function PredictiveReadiness({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  return (
    <Panel icon={TrendingUp} title={t("missionEngine.forecast.title")} accent={C.calmTeal}>
      <div className="space-y-2">
        {mission.command.predictive.map((f) => (
          <div key={f.key} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-24 shrink-0">{t(`missionEngine.forecast.${f.key}`)}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
              <div className="h-full rounded-full" style={{ width: `${f.value}%`, background: f.value >= 90 ? C.mangrove : f.value >= 75 ? C.calmTeal : C.sunset }} />
            </div>
            <span className="text-xs font-semibold text-foreground w-9 text-end">{f.value}%</span>
            <Pill label={t(`missionEngine.level.${f.confidence}`)} color={LEVEL_COLOR[f.confidence] ?? C.mediumWood} soft />
          </div>
        ))}
      </div>
    </Panel>
  );
}
