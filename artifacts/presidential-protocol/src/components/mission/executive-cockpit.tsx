import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Gauge, AlertTriangle, CircleCheck, Sparkles, ArrowRightCircle, ShieldAlert, Boxes } from "lucide-react";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type { Mission } from "@/lib/mission";
import { ExecutiveAvatar } from "@/components/identity";
import { departmentHead } from "@/lib/identity";
import { C, Pill, LEVEL_COLOR } from "./panel";

export function ExecutiveCockpit({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const k = mission.cockpit;
  const L = <T extends { en: string; ar: string }>(x: T) => (lang === "en" ? x.en : x.ar);
  const ring = 2 * Math.PI * 34;

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.gold + "55", background: `linear-gradient(165deg, ${C.gold}10, ${C.cardBg} 55%)` }}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-2 border-b" style={{ borderColor: C.border }}>
        <Gauge size={15} strokeWidth={1.7} style={{ color: C.mediumWood }} />
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{t("missionEngine.cockpit")}</h3>
        <span className="ms-auto text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.mangrove + "16", color: C.mangrove }}>
          {t(`missionEngine.phases.${k.phase}`)}
        </span>
      </div>

      <div className="p-4 space-y-3.5">
        {/* Readiness ring + confidence */}
        <div className="flex items-center gap-4">
          <span className="relative inline-flex items-center justify-center" style={{ width: 84, height: 84 }}>
            <svg width="84" height="84" className="-rotate-90">
              <circle cx="42" cy="42" r="34" fill="none" stroke={C.border} strokeWidth="7" />
              <circle cx="42" cy="42" r="34" fill="none" stroke={C.mangrove} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={ring} strokeDashoffset={ring * (1 - k.readiness / 100)} />
            </svg>
            <span className="absolute text-xl font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{k.readiness}%</span>
          </span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{t("missionEngine.readiness")}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] mb-1"><span className="text-muted-foreground">{t("missionEngine.confidence")}</span><span className="font-semibold text-foreground">{k.confidence}%</span></div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                <div className="h-full rounded-full" style={{ width: `${k.confidence}%`, background: C.calmTeal }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI narrative + confidence transparency */}
        <div className="rounded-lg p-2.5" style={{ background: C.calmTeal + "0D" }}>
          <p className="text-[11px] text-foreground leading-relaxed">{L(mission.narrative.readiness)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">{t("missionEngine.confidenceReasons")}</p>
          <div className="flex flex-wrap gap-1">
            {mission.narrative.confidenceReasons.map((r, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: C.sunset + "14", color: C.mediumWood }}>{L(r)}</span>)}
          </div>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border p-2.5" style={{ borderColor: C.border }}>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><AlertTriangle size={12} /> {t("missionEngine.criticalRisks")}</p>
            <p className="text-xl font-bold" style={{ color: k.criticalRisks ? C.error : C.mangrove }}>{k.criticalRisks}</p>
          </div>
          <div className="rounded-xl border p-2.5" style={{ borderColor: C.border }}>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><CircleCheck size={12} /> {t("missionEngine.decisionsRequired")}</p>
            <p className="text-xl font-bold" style={{ color: k.decisionsRequired ? C.mediumWood : C.mangrove }}>{k.decisionsRequired}</p>
          </div>
        </div>

        {/* Blocking departments */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-1.5">{t("missionEngine.blockingDepartments")}</p>
          {k.blockingDepartments.length ? (
            <div className="flex flex-wrap gap-1.5">
              {k.blockingDepartments.map((d) => <Pill key={d} label={t(`contacts.departments.${d}`)} color={C.error} soft />)}
            </div>
          ) : <p className="text-[11px] flex items-center gap-1" style={{ color: C.mangrove }}><CircleCheck size={12} /> {t("missionEngine.allClear")}</p>}
        </div>

        {/* Departments waiting (human presence) */}
        {mission.presence.some((p) => p.waitingOn) && (
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">{t("missionEngine.presence.departmentsWaiting")}</p>
            <div className="space-y-1.5">
              {mission.presence.filter((p) => p.waitingOn).map((p) => (
                <div key={p.deptKey} className="flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5" style={{ borderColor: C.border }}>
                  <ExecutiveAvatar identity={departmentHead(p.deptKey) ?? { name: L(p.owner), department: p.deptKey }} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{t(`contacts.departments.${p.deptKey}`)}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{L(p.owner)}{p.waitingOn ? ` · ${L(p.waitingOn)}` : ""}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: p.availability === "available" ? C.mangrove : C.sunset }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: p.availability === "available" ? C.mangrove : C.sunset }} /> {L(p.eta)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protocol conflicts */}
        {k.protocolConflicts.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5"><ShieldAlert size={12} /> {t("missionEngine.protocolConflicts")}</p>
            <ul className="space-y-1">
              {k.protocolConflicts.map((c, i) => <li key={i} className="text-[11px] text-foreground flex gap-1.5"><span style={{ color: C.error }}>•</span>{L(c)}</li>)}
            </ul>
          </div>
        )}

        {/* Resource gaps */}
        {k.resourceConflicts.length > 0 && (
          <div>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5"><Boxes size={12} /> {t("missionEngine.resourceConflicts")}</p>
            <div className="flex flex-wrap gap-1.5">
              {k.resourceConflicts.map((c, i) => <Pill key={i} label={L(c)} color={C.sunset} soft />)}
            </div>
          </div>
        )}

        {/* AI executive recommendations (reasoned) */}
        <div className="rounded-xl p-3 space-y-2.5" style={{ background: C.gold + "12", border: `1px solid ${C.gold}44` }}>
          <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: C.mediumWood }}><Sparkles size={12} /> {t("missionEngine.execRecs.title")}</p>
          {mission.execRecommendations.slice(0, 2).map((r, i) => (
            <div key={i} className="border-t pt-2 first:border-t-0 first:pt-0" style={{ borderColor: C.gold + "33" }}>
              <p className="text-xs font-medium text-foreground">{L(r.action)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{L(r.reason)}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Pill label={`${t("missionEngine.execRecs.impact")} +${r.impact}%`} color={C.mangrove} soft />
                <Pill label={`${t("missionEngine.execRecs.riskReduction")}: ${t(`missionEngine.level.${r.riskReduction}`)}`} color={LEVEL_COLOR[r.riskReduction] ?? C.mediumWood} soft />
                <Pill label={`${t("missionEngine.execRecs.timeSaved")} ${r.timeSavedHours}${t("missionEngine.execRecs.hours")}`} color={C.calmTeal} soft />
              </div>
            </div>
          ))}
        </div>

        {/* Next executive action */}
        <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: C.mangrove + "10", border: `1px solid ${C.mangrove}44` }}>
          <ArrowRightCircle size={18} strokeWidth={1.7} style={{ color: C.mangrove }} className="shrink-0" />
          <div>
            <p className="text-[11px]" style={{ color: C.mangrove }}>{t("missionEngine.nextAction")}</p>
            <p className="text-xs font-medium text-foreground">{L(k.nextAction)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
