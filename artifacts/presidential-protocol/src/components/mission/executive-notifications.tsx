import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { BellRing, TrendingDown, Sparkles } from "lucide-react";
import type { Bi, Mission } from "@/lib/mission";
import { C, Panel, Pill, LEVEL_COLOR } from "./panel";

const SEV_COLOR: Record<string, string> = { risk: C.error, warn: C.sunset, info: C.castleHill };

export function ExecutiveNotifications({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = (x: Bi) => (lang === "en" ? x.en : x.ar);

  return (
    <Panel icon={BellRing} title={t("missionEngine.notif.title")} accent={C.sunset}>
      <div className="space-y-2">
        {mission.notifications.map((n) => {
          const col = SEV_COLOR[n.severity] ?? C.castleHill;
          return (
            <div key={n.id} className="rounded-xl border p-2.5 flex gap-2.5" style={{ borderColor: C.border, borderInlineStartWidth: 3, borderInlineStartColor: col }}>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{L(n.title)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{L(n.impact)}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {n.departments.map((d) => <Pill key={d} label={t(`contacts.departments.${d}`)} color={col} soft />)}
                  <span className="text-[10px] ms-1" style={{ color: col }}>→ {L(n.action)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predictions */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
        <p className="flex items-center gap-1.5 text-[11px] font-medium mb-1.5" style={{ color: C.castleHill }}><Sparkles size={12} /> {t("missionEngine.predict.title")}</p>
        <ul className="space-y-1.5">
          {mission.predictions.map((p, i) => (
            <li key={i} className="flex items-start justify-between gap-2 text-[11px]">
              <span className="flex items-start gap-1.5 text-muted-foreground"><TrendingDown size={11} className="mt-0.5 shrink-0" style={{ color: C.mediumWood }} /> {L(p.text)}</span>
              <Pill label={t(`missionEngine.level.${p.confidence}`)} color={LEVEL_COLOR[p.confidence] ?? C.mediumWood} soft />
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
