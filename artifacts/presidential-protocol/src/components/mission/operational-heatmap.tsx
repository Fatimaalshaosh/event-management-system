import { useTranslation } from "react-i18next";
import { Grid3x3 } from "lucide-react";
import type { HeatCell, Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const STATE_COLOR: Record<HeatCell["state"], string> = {
  overloaded: C.error, busy: C.sunset, normal: C.mangrove, idle: C.warmGray,
};

export function OperationalHeatmap({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  return (
    <Panel icon={Grid3x3} title={t("missionEngine.heat.title")} accent={C.sunset}
      action={
        <div className="flex items-center gap-2">
          {(["overloaded", "busy", "normal", "idle"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ background: STATE_COLOR[s] }} />{t(`missionEngine.heat.${s}`)}</span>
          ))}
        </div>
      }>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {mission.command.heatmap.map((cell) => {
          const col = STATE_COLOR[cell.state];
          return (
            <div key={cell.deptKey} className="rounded-xl border p-2.5 text-center" style={{ borderColor: col + "55", background: col + "12" }}>
              <p className="text-base font-bold leading-none" style={{ color: col, fontFamily: "Georgia, serif" }}>{cell.load}%</p>
              <p className="text-[9px] text-foreground mt-1 leading-tight line-clamp-2">{t(`contacts.departments.${cell.deptKey}`)}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
