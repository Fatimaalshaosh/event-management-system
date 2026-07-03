import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Brain, Check, AlertTriangle, Info } from "lucide-react";
import type { Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

const ICON = { ok: Check, warn: AlertTriangle, info: Info } as const;
const COL = { ok: C.mangrove, warn: C.sunset, info: C.castleHill } as const;

export function MissionIntelligence({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);

  return (
    <Panel icon={Brain} title={t("missionEngine.intelligence")} accent={C.castleHill}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {mission.intel.map((it, i) => {
          const Ic = ICON[it.status];
          return (
            <div key={i} className="flex items-center justify-between gap-2 py-1 border-t first:border-t-0 sm:[&:nth-child(2)]:border-t-0" style={{ borderColor: C.border }}>
              <span className="text-[11px] text-muted-foreground truncate">{L(it.question)}</span>
              <span className="flex items-center gap-1 text-[11px] font-medium shrink-0" style={{ color: COL[it.status] }}>
                {L(it.answer)} <Ic size={12} strokeWidth={2} />
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
