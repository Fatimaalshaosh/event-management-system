import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Library, Check } from "lucide-react";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type { Mission } from "@/lib/mission";
import { C, Panel } from "./panel";

export function DepartmentPlaybooks({ mission, highlight }: { mission: Mission; highlight?: string | null }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);
  const list = highlight ? mission.playbooks.filter((p) => p.deptKey === highlight) : mission.playbooks;

  return (
    <Panel icon={Library} title={t("missionEngine.playbooks")} accent={C.mediumWood}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((pb) => {
          const dept = DEPARTMENT_BY_KEY[pb.deptKey];
          const Icon = dept?.icon ?? Library;
          return (
            <div key={pb.deptKey} className="rounded-xl border p-3" style={{ borderColor: C.border, background: (dept?.color ?? C.mangrove) + "07" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: (dept?.color ?? C.mangrove) + "1A", color: dept?.color ?? C.mangrove }}>
                  <Icon size={13} strokeWidth={1.7} />
                </span>
                <span className="text-xs font-semibold text-foreground truncate" style={{ fontFamily: "Georgia, serif" }}>{t(`contacts.departments.${pb.deptKey}`)}</span>
              </div>
              <ul className="space-y-1">
                {pb.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <Check size={11} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: dept?.color ?? C.mangrove }} />
                    {L(it)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
