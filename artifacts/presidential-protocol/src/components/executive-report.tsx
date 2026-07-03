import { formatCurrency as fmtMoney } from "@/lib/format";
import { palette } from "@/theme";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Printer, FileDown, Sparkles, AlertTriangle, Zap,
  CalendarDays, Landmark, ClipboardList, Briefcase,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";

import { type ExecutiveReportData, type ReportLabels, todayLong, buildPrintableHtml } from "./executive-report-print";
export type { ExecutiveReportData, ExecutiveReportLogistics } from "./executive-report-print";

const P = palette;

const SEVERITY: Record<ExecutiveReportData["risks"][number]["severity"], { color: string; bg: string; border: string }> = {
  critical: { color: "#8B2020", bg: "rgba(200,75,56,0.10)",   border: "rgba(200,75,56,0.30)" },
  high:     { color: "#A0522D", bg: "rgba(173,137,101,0.14)", border: "rgba(173,137,101,0.35)" },
  medium:   { color: "#7A4F2D", bg: "rgba(235,204,173,0.45)", border: "rgba(173,137,101,0.30)" },
  low:      { color: "#2D5554", bg: "rgba(151,178,177,0.20)", border: "rgba(151,178,177,0.45)" },
};

function FormattedBody({ body, dir }: { body: string; dir: "rtl" | "ltr" }) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div style={{ fontSize: 13.5, lineHeight: 2, color: P.textPrimary, textAlign: dir === "rtl" ? "right" : "left" }}>
      {lines.map((line, i) => {
        const isBullet = /^[•\-–]\s/.test(line) || /^[\u0660-\u0669\d]+[\.\-\)]\s/.test(line);
        return (
          <p key={i} style={{
            marginBottom: i === lines.length - 1 ? 0 : 6,
            paddingInlineStart: isBullet ? 10 : 0,
          }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ExecutiveReportModal({
  open, onClose, title, related, data, onAction,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  related?: string;
  data: ExecutiveReportData | null;
  onAction?: (prompt: string) => void;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);
  const headingFontFamily = lang === "en" ? "'Playfair Display', Georgia, serif" : "Georgia, serif";

  const labels: ReportLabels = {
    lang,
    dir,
    severity: {
      critical: t("severity.critical"),
      high: t("severity.high"),
      medium: t("severity.medium"),
      low: t("severity.low"),
    },
    operationalAlerts: t("report.operationalAlerts"),
    nextSteps: t("report.nextSteps"),
    executiveSummary: t("report.executiveSummary"),
    impact: t("ai.impact"),
    action: t("ai.suggestedAction"),
    authority: t("report.authority"),
    fullAuthority: t("report.fullAuthority"),
    preparedBy: t("report.preparedBy"),
    relatedEntity: t("report.relatedEntity"),
    footer: t("report.footer"),
    at: t("report.at"),
    loading: t("report.loading"),
    logistics: {
      title: t("report.logistics.title"),
      estimatedBudget: t("report.logistics.estimatedBudget"),
      actualBudget: t("report.logistics.actualBudget"),
      variance: t("report.logistics.variance"),
      travel: t("report.logistics.travel"),
      hotel: t("report.logistics.hotel"),
      fleet: t("report.logistics.fleet"),
      gifts: t("report.logistics.gifts"),
      documents: t("report.logistics.documents"),
    },
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const handlePrint = () => {
    if (!data) return;
    const html = buildPrintableHtml(title, data, labels, related);
    const w = window.open("", "_blank", "width=900,height=900");
    if (!w) return;
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 350);
  };

  const handleDownloadDoc = () => {
    if (!data) return;
    const html = buildPrintableHtml(title, data, labels, related);
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = title.replace(/[\\\/:*?"<>|]/g, "_");
    a.href = url; a.download = `${safeTitle}.doc`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  const textAlignClass = dir === "rtl" ? "text-end" : "text-start";
  const justifyEndClass = dir === "rtl" ? "justify-end" : "justify-start";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto"
          style={{ background: "rgba(75,64,56,0.55)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            ref={printRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative my-8 mx-4 w-full max-w-[880px] rounded-2xl overflow-hidden"
            style={{ background: P.paperBg, boxShadow: "0 32px 80px rgba(75,64,56,0.35)", direction: dir, height: "fit-content" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent stripe */}
            <div style={{ height: 4, background: `linear-gradient(to ${dir === "rtl" ? "left" : "right"}, ${P.mediumWood}, ${P.calmTeal})` }} />

            {/* Toolbar — hidden in print */}
            <div className="flex items-center justify-between gap-2 px-6 py-3 border-b"
              style={{ borderColor: P.borderSolid, background: P.floralWhite }}>
              <div className="flex items-center gap-1.5">
                <button onClick={handleDownloadDoc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm"
                  style={{ background: P.paperBg, border: `1px solid ${P.border}`, color: P.castleHill }}>
                  <FileDown size={12} strokeWidth={1.8} />
                  {t("common.exportWord")}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm"
                  style={{ background: P.mediumWood, color: "#fff", border: `1px solid ${P.mediumWood}` }}>
                  <Printer size={12} strokeWidth={1.8} />
                  {t("common.exportPdf")}
                </button>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                style={{ color: P.castleHill }}>
                <X size={15} strokeWidth={1.8} />
              </button>
            </div>

            {/* Document body */}
            <div className="px-8 sm:px-12 py-10" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
              {data ? (
                <>
                  {/* Header */}
                  <header className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-6 pb-5 mb-7"
                    style={{ borderBottom: `1px solid ${P.borderSolid}` }}>
                    <div style={{ fontSize: 11, color: P.warmGray, lineHeight: 1.9 }}>
                      <div className={`flex items-center gap-1.5 ${justifyEndClass} sm:justify-start`}>
                        <CalendarDays size={11} /> {todayLong(lang)}
                      </div>
                      <div className={`flex items-center gap-1.5 ${justifyEndClass} sm:justify-start mt-1`}>
                        <ClipboardList size={11} /> {labels.preparedBy}
                      </div>
                      {related && (
                        <div className={`flex items-center gap-1.5 ${justifyEndClass} sm:justify-start mt-1`}>
                          <Landmark size={11} /> {related}
                        </div>
                      )}
                    </div>
                    <div className={textAlignClass}>
                      <div style={{
                        fontSize: 10, color: P.castleHill, letterSpacing: "0.2em",
                        fontWeight: 800, marginBottom: 6,
                        textTransform: lang === "en" ? "uppercase" : "none",
                      }}>
                        {labels.authority}
                      </div>
                      <h1 style={{ fontFamily: headingFontFamily, fontSize: 28, color: P.textPrimary, lineHeight: 1.2, margin: 0 }}>
                        {title}
                      </h1>
                    </div>
                  </header>

                  {/* Executive summary */}
                  <div
                    className="rounded-2xl mb-8"
                    style={{
                      background: `linear-gradient(135deg, ${P.sunset}33, ${P.paperBg} 70%)`,
                      border: `1px solid ${P.mediumWood}33`,
                      padding: "20px 24px",
                    }}>
                    <div className={`flex items-center gap-1.5 ${justifyEndClass} mb-2`}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", color: P.castleHill,
                        textTransform: lang === "en" ? "uppercase" : "none",
                      }}>
                        {labels.executiveSummary}
                      </span>
                      <Sparkles size={12} color={P.mediumWood} />
                    </div>
                    <p style={{ fontSize: 14.5, lineHeight: 2, color: P.textPrimary, whiteSpace: "pre-wrap", textAlign: dir === "rtl" ? "right" : "left" }}>
                      {data.analysis}
                    </p>
                  </div>

                  {/* Sections */}
                  {data.sections.map((section, i) => (
                    <section key={i} className="mb-6">
                      <h2 style={{
                        fontFamily: headingFontFamily, fontSize: 18,
                        color: P.mangrove, paddingBottom: 6,
                        borderBottom: `1px solid ${P.borderSolid}`, marginBottom: 12,
                        textAlign: dir === "rtl" ? "right" : "left",
                      }}>
                        {section.title}
                      </h2>
                      <FormattedBody body={section.body} dir={dir} />
                    </section>
                  ))}

                  {/* Logistics & Budget */}
                  {data.logistics && (
                    <section className="mb-6">
                      <h2 className={`flex items-center gap-2 ${justifyEndClass}`} style={{
                        fontFamily: headingFontFamily, fontSize: 18,
                        color: P.mediumWood, paddingBottom: 6,
                        borderBottom: `1px solid ${P.borderSolid}`, marginBottom: 12,
                      }}>
                        {labels.logistics.title}
                        <Briefcase size={14} color={P.mediumWood} />
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: labels.logistics.estimatedBudget, value: fmtMoney(data.logistics.budgetEstimated, data.logistics.currency, lang) },
                          { label: labels.logistics.actualBudget, value: fmtMoney(data.logistics.budgetActual, data.logistics.currency, lang) },
                          { label: labels.logistics.variance, value: fmtMoney(data.logistics.budgetActual - data.logistics.budgetEstimated, data.logistics.currency, lang) },
                          { label: labels.logistics.travel, value: String(data.logistics.travel) },
                          { label: labels.logistics.hotel, value: String(data.logistics.hotel) },
                          { label: labels.logistics.fleet, value: String(data.logistics.fleet) },
                          { label: labels.logistics.gifts, value: String(data.logistics.gifts) },
                          { label: labels.logistics.documents, value: String(data.logistics.documents) },
                        ].map((item, i) => (
                          <div key={i} className="rounded-xl px-4 py-3"
                            style={{ background: P.floralWhite, border: `1px solid ${P.border}`, textAlign: dir === "rtl" ? "right" : "left" }}>
                            <p style={{ fontSize: 16, fontWeight: 700, color: P.textPrimary, fontFamily: headingFontFamily }}>{item.value}</p>
                            <p style={{ fontSize: 11, color: P.warmGray, marginTop: 2 }}>{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Risks */}
                  {data.risks.length > 0 && (
                    <section className="mb-6">
                      <h2 className={`flex items-center gap-2 ${justifyEndClass}`} style={{
                        fontFamily: headingFontFamily, fontSize: 18,
                        color: "#A0522D", paddingBottom: 6,
                        borderBottom: `1px solid ${P.borderSolid}`, marginBottom: 12,
                      }}>
                        {labels.operationalAlerts}
                        <AlertTriangle size={14} color="#A0522D" />
                      </h2>
                      <div className="space-y-2.5">
                        {data.risks.map((risk, i) => {
                          const s = SEVERITY[risk.severity];
                          return (
                            <div key={i} className="rounded-xl"
                              style={{ background: s.bg, border: `1px solid ${s.border}`, padding: "12px 16px", textAlign: dir === "rtl" ? "right" : "left" }}>
                              <div className={`flex items-center gap-2 ${justifyEndClass} mb-1.5`}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: s.color, flex: 1, lineHeight: 1.5 }}>
                                  {risk.title}
                                </p>
                                <span style={{
                                  fontSize: 9.5, fontWeight: 800, padding: "2px 9px",
                                  borderRadius: 999, background: s.color, color: "#fff",
                                  whiteSpace: "nowrap", letterSpacing: "0.05em",
                                  textTransform: lang === "en" ? "uppercase" : "none",
                                }}>
                                  {labels.severity[risk.severity]}
                                </span>
                              </div>
                              {risk.impact && (
                                <p style={{ fontSize: 12.5, color: P.textPrimary, lineHeight: 1.85, marginTop: 3 }}>
                                  <span style={{ fontWeight: 800, color: s.color }}>{labels.impact}: </span>{risk.impact}
                                </p>
                              )}
                              {risk.mitigation && (
                                <p style={{ fontSize: 12.5, color: P.textPrimary, lineHeight: 1.85, marginTop: 3 }}>
                                  <span style={{ fontWeight: 800, color: s.color }}>{labels.action}: </span>{risk.mitigation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Next actions */}
                  {data.nextActions.length > 0 && (
                    <section className="mb-6">
                      <h2 className={`flex items-center gap-2 ${justifyEndClass}`} style={{
                        fontFamily: headingFontFamily, fontSize: 18,
                        color: P.mangrove, paddingBottom: 6,
                        borderBottom: `1px solid ${P.borderSolid}`, marginBottom: 12,
                      }}>
                        {labels.nextSteps}
                        <Zap size={14} color={P.mangrove} />
                      </h2>
                      <div className={`flex flex-wrap gap-2 ${justifyEndClass}`}>
                        {data.nextActions.map((a, i) => (
                          <button key={i}
                            onClick={() => { onAction?.(a.prompt); onClose(); }}
                            disabled={!onAction}
                            style={{
                              fontSize: 12, fontWeight: 700,
                              padding: "8px 16px", borderRadius: 999,
                              background: `linear-gradient(135deg, ${P.mangrove}10, ${P.calmTeal}22)`,
                              border: `1px solid ${P.mangrove}40`,
                              color: P.mangrove, cursor: onAction ? "pointer" : "default",
                              fontFamily: "inherit",
                            }}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Footer */}
                  <footer className="mt-10 pt-4 flex flex-col sm:flex-row justify-between gap-2"
                    style={{ borderTop: `1px solid ${P.borderSolid}`, fontSize: 11, color: P.warmGray }}>
                    <span>{labels.footer}</span>
                    <span>{labels.fullAuthority}</span>
                  </footer>
                </>
              ) : (
                <div className="py-20 text-center" style={{ color: P.warmGray }}>
                  {labels.loading}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

