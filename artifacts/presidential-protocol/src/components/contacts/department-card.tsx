import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Users, Workflow, CircleDot, UserCog } from "lucide-react";
import { personName, usePeopleVersion } from "@/lib/identity";
import { C } from "./contact-shared";
import type { Department } from "./org-structure";

export function DepartmentCard({ dept, userCount, onOpen }: {
  dept: Department;
  userCount: number;
  onOpen: (d: Department) => void;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  usePeopleVersion();
  const Icon = dept.icon;
  const head = personName({ name: dept.headEn, nameAr: dept.headAr }, lang);

  return (
    <button
      type="button"
      onClick={() => onOpen(dept)}
      className="group text-start w-full rounded-2xl border p-5 transition-all hover:shadow-md"
      style={{ borderColor: C.border, background: `linear-gradient(180deg, ${dept.color}0D, ${C.cardBg} 55%)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: dept.color + "1A", color: dept.color, boxShadow: `inset 0 0 0 1px ${dept.color}33` }}
        >
          <Icon size={20} strokeWidth={1.6} />
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: dept.color + "14", color: dept.color }}
        >
          {dept.readiness}% {t("contacts.orgStructure.readiness")}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mt-3 truncate" style={{ fontFamily: "Georgia, serif" }}>
        {t(`contacts.departments.${dept.key}`)}
      </h3>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 truncate">
        <UserCog size={12} strokeWidth={1.6} /> {head}
      </p>

      {/* Readiness bar */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
        <div className="h-full rounded-full" style={{ width: `${dept.readiness}%`, background: dept.color }} />
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t text-[11px] text-muted-foreground" style={{ borderColor: C.border }}>
        <span className="flex items-center gap-1"><Users size={12} strokeWidth={1.6} /> {userCount}</span>
        <span className="flex items-center gap-1"><Workflow size={12} strokeWidth={1.6} /> {dept.activeWorkflows}</span>
        <span className="flex items-center gap-1"><CircleDot size={12} strokeWidth={1.6} /> {dept.pendingTasks} {t("contacts.orgStructure.pending")}</span>
      </div>
    </button>
  );
}
