import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Sparkles, UserCog, TrendingUp } from "lucide-react";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type { Mission } from "@/lib/mission";
import { C, Panel, Pill, PRIORITY_COLOR, LEVEL_COLOR } from "./panel";

export function MissionRecommendations({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);

  return (
    <Panel icon={Sparkles} title={t("missionEngine.recommendations")} accent={C.gold}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mission.recommendations.map((r) => {
          const dept = DEPARTMENT_BY_KEY[r.deptKey];
          const Icon = dept?.icon ?? UserCog;
          return (
            <div key={r.deptKey} className="rounded-xl border p-3" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: (dept?.color ?? C.mangrove) + "1A", color: dept?.color ?? C.mangrove }}>
                  <Icon size={14} strokeWidth={1.7} />
                </span>
                <span className="text-sm font-semibold text-foreground truncate flex-1" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.departments.${r.deptKey}`)}</span>
                <Pill label={t(`missionEngine.priority.${r.priority}`)} color={PRIORITY_COLOR[r.priority]} soft />
              </div>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><TrendingUp size={11} /> {t("missionEngine.impact")} +{r.readinessImpact}%</span>
                <span className="flex items-center gap-1">{t("missionEngine.workloadRisk")}: <span style={{ color: LEVEL_COLOR[r.workloadRisk] }}>{t(`missionEngine.level.${r.workloadRisk}`)}</span></span>
              </div>

              <p className="text-[11px] mt-2"><span className="text-muted-foreground">{t("missionEngine.lead")}: </span><span className="font-medium text-foreground">{L(r.lead)}</span></p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {r.teamRoleKeys.map((rk) => <Pill key={rk} label={t(`contacts.roles.${rk}`, { defaultValue: rk })} color={dept?.color ?? C.mangrove} soft />)}
              </div>

              <ul className="mt-2 space-y-0.5">
                {r.reasons.slice(0, 3).map((rs, i) => <li key={i} className="text-[10px] text-muted-foreground flex gap-1"><span style={{ color: C.gold }}>•</span>{L(rs)}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
