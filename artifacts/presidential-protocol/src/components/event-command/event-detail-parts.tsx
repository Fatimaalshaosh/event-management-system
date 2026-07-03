import { formatCurrency as fmtMoneyShort } from "@/lib/format";
import { palette } from "@/theme";
import { readBudgetThreshold } from "@/components/events/event-utils";



import { AlertTriangle, LayoutGrid, Mail, Users, ListChecks, ShieldAlert, Radio, Briefcase, Plane, BedDouble, Radar, MessagesSquare } from "lucide-react";






import { motion } from "framer-motion";


import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
















const T = palette;

/* Extracted from event-detail.tsx — budget alert band, tab + copilot config. */
export type TabKey = "overview" | "missionEngine" | "collaboration" | "tasks" | "invitations" | "participants" | "risks" | "logistics" | "flights" | "hotels" | "liveOps";


/* Budget threshold helper is shared from event-utils. */

/* ─── Per-event Budget Alert (warning + over) ─────────────────── */
export function EventBudgetAlertBand({
  logistics,
}: {
  logistics?: { budgetEstimated: number; budgetActual: number; currency?: string };
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const danger = "#C84B38";
  const warn = T.mediumWood;
  const threshold = readBudgetThreshold();

  const estimated = logistics?.budgetEstimated ?? 0;
  const actual = logistics?.budgetActual ?? 0;
  const overBy = actual - estimated;
  // Mirror the dashboard's buildBudgetAlerts semantics: "over" when actual
  // exceeds the estimate; "warning" when spend has reached the configured
  // threshold percentage of a positive estimate but not yet exceeded it.
  const isOver = estimated > 0 ? actual > estimated : actual > 0;
  const spentPercent = estimated > 0 ? Math.round((actual / estimated) * 100) : 0;
  const isWarning = !isOver && estimated > 0 && spentPercent >= threshold;

  if (!isOver && !isWarning) return null;

  const currency = logistics?.currency ?? "AED";
  const overByPercent = estimated > 0 ? Math.round((overBy / estimated) * 100) : 0;
  const accent = isOver ? danger : warn;
  const titleColor = isOver ? "#8B2020" : T.textPrimary;

  return (
    <motion.div
      className="rounded-2xl border p-5"
      style={{
        background: `${accent}0A`,
        borderColor: `${accent}2E`,
        borderTop: `3px solid ${accent}`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center justify-end gap-2 mb-3">
        <div className="text-end">
          <div className="flex items-center gap-2 justify-end">
            <h3 className="text-sm font-semibold" style={{ color: titleColor }}>
              {isOver
                ? t("pages.eventDetail.budgetAlert.title")
                : t("pages.eventDetail.budgetAlert.warningTitle")}
            </h3>
            {isOver
              ? overByPercent > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${danger}18`, color: danger, border: `1px solid ${danger}30` }}>
                    {t("pages.eventDetail.budgetAlert.overByPercent", { percent: overByPercent })}
                  </span>
                )
              : (
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${warn}1F`, color: warn, border: `1px solid ${warn}3A` }}>
                    {t("pages.eventDetail.budgetAlert.approaching", { percent: spentPercent })}
                  </span>
                )}
          </div>
          <p className="text-[11px]" style={{ color: T.warmGray }}>
            {isOver
              ? t("pages.eventDetail.budgetAlert.subtitle")
              : t("pages.eventDetail.budgetAlert.warningSubtitle")}
          </p>
        </div>
        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>
          <AlertTriangle size={16} strokeWidth={1.7} />
        </span>
      </div>

      <div className="rounded-xl px-3.5 py-2.5 text-end" style={{ background: `${accent}0E`, border: `1px solid ${accent}24` }}>
        <p className="text-xs font-semibold" style={{ color: isOver ? "#5C2A22" : T.textPrimary }}>
          {isOver
            ? t("pages.eventDetail.budgetAlert.overBy", { amount: fmtMoneyShort(overBy, currency, lang) })
            : t("pages.eventDetail.budgetAlert.spentReached", { percent: spentPercent, threshold })}
        </p>
        <p className="text-[10.5px] mt-1" style={{ color: T.warmGray }}>
          {t("pages.eventDetail.budgetAlert.estimatedLabel")} {fmtMoneyShort(estimated, currency, lang)} · {t("pages.eventDetail.budgetAlert.actualLabel")} {fmtMoneyShort(actual, currency, lang)}
        </p>
      </div>
    </motion.div>
  );
}


export const TABS: { key: TabKey; labelKey: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", labelKey: "pages.commandCenter.tabs.overview", icon: LayoutGrid },
  { key: "missionEngine", labelKey: "pages.commandCenter.tabs.missionEngine", icon: Radar },
  { key: "collaboration", labelKey: "pages.commandCenter.tabs.collaboration", icon: MessagesSquare },
  { key: "tasks", labelKey: "pages.commandCenter.tabs.tasks", icon: ListChecks },
  { key: "invitations", labelKey: "pages.commandCenter.tabs.invitations", icon: Mail },
  { key: "participants", labelKey: "pages.commandCenter.tabs.participants", icon: Users },
  { key: "risks", labelKey: "pages.commandCenter.tabs.risks", icon: ShieldAlert },
  { key: "logistics", labelKey: "pages.commandCenter.tabs.logistics", icon: Briefcase },
  { key: "flights", labelKey: "pages.commandCenter.tabs.flights", icon: Plane },
  { key: "hotels", labelKey: "pages.commandCenter.tabs.hotels", icon: BedDouble },
  { key: "liveOps", labelKey: "pages.commandCenter.tabs.liveOps", icon: Radio },
];

export const COPILOT_ACTIONS: { key: string; labelAr: string; labelEn: string }[] = [
  { key: "s1", labelAr: "رفع الجاهزية", labelEn: "Raise readiness" },
  { key: "s4", labelAr: "اكتشاف المخاطر", labelEn: "Detect risks" },
  { key: "s6", labelAr: "جدول تنفيذي", labelEn: "Executive timeline" },
  { key: "s2", labelAr: "إحاطة بروتوكولية", labelEn: "Protocol briefing" },
  { key: "s5", labelAr: "اقتراح هدايا", labelEn: "Suggest gifts" },
  { key: "s7", labelAr: "خطة النقل", labelEn: "Transport plan" },
  { key: "s8", labelAr: "خطة الاستقبال", labelEn: "Reception plan" },
  { key: "s9", labelAr: "خطة الطوارئ", labelEn: "Contingency plan" },
  { key: "s10", labelAr: "تحليل الوفد", labelEn: "Analyze delegation" },
  { key: "s11", labelAr: "تقرير تنفيذي", labelEn: "Executive report" },
];

