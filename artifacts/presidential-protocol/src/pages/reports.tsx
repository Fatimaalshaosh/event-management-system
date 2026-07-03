import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { FileText, FileSpreadsheet, Download, Activity, Users, CalendarDays, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRegisterPageContext } from "@/ai/page-context";
import { ContextualCopilot } from "@/ai/contextual-copilot";

const T = palette;

export default function Reports() {
  const { t } = useTranslation();

  const reports = [
    { titleKey: "pages.reports.cards.monthlyTitle",   descKey: "pages.reports.cards.monthlyDesc",   icon: CalendarDays, accent: T.mangrove },
    { titleKey: "pages.reports.cards.visitsTitle",    descKey: "pages.reports.cards.visitsDesc",    icon: Users,        accent: T.calmTeal },
    { titleKey: "pages.reports.cards.approvalsTitle", descKey: "pages.reports.cards.approvalsDesc", icon: Activity,     accent: T.mediumWood },
    { titleKey: "pages.reports.cards.readinessTitle", descKey: "pages.reports.cards.readinessDesc", icon: BarChart2,    accent: T.castleHill },
  ];

  useRegisterPageContext({
    page: "reports",
    titleAr: "التقارير",
    titleEn: "Reports",
    data: { availableReports: reports.map((r) => t(r.titleKey)) },
    suggestions: [
      { labelAr: t("ai.copilot.report.s1", { lng: "ar" }), labelEn: t("ai.copilot.report.s1", { lng: "en" }), prompt: t("ai.copilot.report.s1") },
      { labelAr: t("ai.copilot.report.s2", { lng: "ar" }), labelEn: t("ai.copilot.report.s2", { lng: "en" }), prompt: t("ai.copilot.report.s2") },
      { labelAr: t("ai.copilot.report.s3", { lng: "ar" }), labelEn: t("ai.copilot.report.s3", { lng: "en" }), prompt: t("ai.copilot.report.s3") },
      { labelAr: t("ai.copilot.report.s4", { lng: "ar" }), labelEn: t("ai.copilot.report.s4", { lng: "en" }), prompt: t("ai.copilot.report.s4") },
    ],
  });

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="text-end">
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.reports.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("pages.reports.subtitle")}
          </p>
        </div>

        <ContextualCopilot
          titleKey="ai.copilot.report.title"
          subtitleKey="ai.copilot.report.subtitle"
          suggestions={[
            { labelAr: "ملخص شهري", labelEn: "Monthly summary", prompt: t("ai.copilot.report.s1") },
            { labelAr: "ملخص تنفيذي", labelEn: "Executive summary", prompt: t("ai.copilot.report.s2") },
            { labelAr: "اكتشاف المخاطر", labelEn: "Risk identification", prompt: t("ai.copilot.report.s3") },
            { labelAr: "توصيات قابلة للتنفيذ", labelEn: "Actionable recommendations", prompt: t("ai.copilot.report.s4") },
          ]}
        />

        <div
          className="rounded-2xl border p-5 flex flex-wrap gap-3 justify-end"
          style={{ borderColor: T.border, background: T.cardBg }}
        >
          <p className="w-full text-end text-sm font-semibold text-foreground mb-1">{t("pages.reports.quickExport")}</p>
          {[
            { label: t("pages.reports.fullPdfReport"), Icon: FileText,        format: "PDF" },
            { label: t("pages.reports.guestsList"),    Icon: FileSpreadsheet, format: "Excel" },
            { label: t("pages.reports.eventsSchedule"),Icon: Download,        format: "CSV" },
            { label: t("pages.reports.attendance"),    Icon: FileText,        format: "PDF" },
          ].map(({ label, Icon, format }) => (
            <button
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:shadow-sm"
              style={{ borderColor: T.border, background: T.pageBg, color: T.castleHill }}
            >
              <span
                className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                style={{ background: T.sunset + "55", color: T.mediumWood }}
              >
                {format}
              </span>
              {label}
              <Icon size={14} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reports.map((report, i) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={i}
                className="rounded-2xl border p-6 flex flex-col gap-5 transition-all hover:shadow-sm"
                style={{ borderColor: T.border, background: T.cardBg }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: report.accent + "18", color: report.accent }}
                  >
                    <Icon size={19} strokeWidth={1.5} />
                  </div>
                  <div className="text-end flex-1 ms-4">
                    <p className="text-sm font-semibold text-foreground">{t(report.titleKey)}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(report.descKey)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t" style={{ borderColor: T.border }}>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors hover:bg-muted/30"
                    style={{ borderColor: T.border, color: T.castleHill }}
                  >
                    PDF <FileText size={12} strokeWidth={1.5} />
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-colors hover:bg-muted/30"
                    style={{ borderColor: T.border, color: T.castleHill }}
                  >
                    Excel <FileSpreadsheet size={12} strokeWidth={1.5} />
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-white transition-all hover:shadow-sm"
                    style={{ background: report.accent }}
                  >
                    {t("pages.reports.export")} <Download size={12} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
