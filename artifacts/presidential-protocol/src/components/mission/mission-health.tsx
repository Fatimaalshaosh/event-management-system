import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import type { Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const STATUS_COLOR = { good: C.mangrove, watch: C.sunset, risk: C.error } as const;

export function MissionHealth({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const h = mission.health;
  const ring = 2 * Math.PI * 30;

  return (
    <Panel icon={Activity} title={t("missionEngine.health.title")} accent={C.gold}
      action={<span className="text-[11px] text-muted-foreground">{t("missionEngine.health.executiveScore")}</span>}>
      <div className="flex items-center gap-5">
        <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: 76, height: 76 }}>
          <svg width="76" height="76" className="-rotate-90">
            <circle cx="38" cy="38" r="30" fill="none" stroke={C.border} strokeWidth="6" />
            <circle cx="38" cy="38" r="30" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - h.overall / 100)} />
          </svg>
          <span className="absolute text-xl font-bold" style={{ color: C.mediumWood, fontFamily: "Georgia, serif" }}>{h.overall}</span>
        </span>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {h.dimensions.map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">{t(`missionEngine.health.${d.key}`)}</span>
                <span className="font-semibold" style={{ color: STATUS_COLOR[d.status] }}>{d.value}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: STATUS_COLOR[d.status] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
