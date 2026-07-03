import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Workflow, ArrowRight, ArrowLeft } from "lucide-react";
import type { Mission, OperationalRelationship } from "@/lib/mission";
import { C, Panel, Pill, STATUS_COLOR } from "./panel";

export function OperationalRelationships({ mission, onSelect }: { mission: Mission; onSelect?: (r: OperationalRelationship) => void }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Panel icon={Workflow} title={t("missionEngine.relationships")} accent={C.calmTeal}>
      <div className="space-y-1.5">
        {mission.relationships.map((r) => (
          <button key={r.id} type="button" onClick={() => onSelect?.(r)} className="w-full text-start rounded-xl border p-2.5 transition-colors hover:bg-muted/30" style={{ borderColor: C.border, background: r.blocking && r.status === "blocked" ? C.error + "08" : "transparent" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-foreground">{t(`contacts.departments.${r.source}`)}</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Arrow size={12} /> {t(`missionEngine.rel.${r.type}`)}
              </span>
              <span className="text-xs font-medium text-foreground">{t(`contacts.departments.${r.target}`)}</span>
              <span className="ms-auto flex items-center gap-1.5">
                {r.blocking && <Pill label={t("missionEngine.blocking")} color={C.error} soft />}
                <Pill label={t(`missionEngine.status.${r.status}`)} color={STATUS_COLOR[r.status] ?? C.warmGray} soft />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{L(r.reason)}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}
