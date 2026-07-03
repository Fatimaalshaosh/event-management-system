
import { formatCurrency as fmtMoneyShort } from "@/lib/format";
import type { AssistantReply, ChatMessage } from "@/ai/types";


import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Flag, Plane, BedDouble, Car, Gift, Briefcase, AlertTriangle, FileText, Zap, Shield, Users, TrendingUp, Plus, Minus, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";










import { C, LiveDot } from "@/components/dashboard/primitives";










/* Extracted from dashboard.tsx — KPI/status/calendar/insight/logistics/budget sections. */
/* ─── KPI card ────────────────────────────────────────────────── */
export function KpiCard({ icon: Icon, value, label, sublabel, accent, loading, trend }: {
  icon: React.ElementType; value: string | number; label: string;
  sublabel: string; accent: string; loading?: boolean; trend?: "up" | "down" | "neutral";
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: C.shadowLg }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="rounded-2xl p-5 flex flex-col gap-3 border cursor-default"
      style={{ background: C.cardBg, borderColor: C.border, boxShadow: C.shadow,
        borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-end gap-1">
          {trend === "up" && (
            <div className="flex items-center gap-0.5" style={{ color: C.mangrove }}>
              <TrendingUp size={10} strokeWidth={2} />
              <span style={{ fontSize: 9, fontWeight: 700 }}>↑</span>
            </div>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: C.sunsetLight, color: C.mediumWood }}>
            {t("common.today")}
          </span>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-end">
        {loading ? (
          <>
            <Skeleton className="h-9 w-16 mb-1 ms-auto" />
            <Skeleton className="h-3 w-28 ms-auto" />
          </>
        ) : (
          <>
            <div className="text-4xl font-bold" style={{ color: C.textPrimary, fontFamily: "Georgia, serif", lineHeight: 1 }}>
              {value}
            </div>
            <div className="text-sm font-semibold mt-1.5" style={{ color: C.castleHill }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: C.warmGray }}>{sublabel}</div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Executive status bar ────────────────────────────────────── */
export function ExecStatusBar() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const chips = [
    { icon: Flag,   label: t("dashboard.execBar.todayOfficialVisits"), value: lang === "en" ? "3" : "٣",        color: C.calmTeal,   live: true  },
    { icon: Zap,    label: t("dashboard.execBar.urgentApprovals"),     value: lang === "en" ? "2" : "٢",        color: "#C84B38",    live: true  },
    { icon: Shield, label: t("dashboard.execBar.overallReadiness"),    value: lang === "en" ? "92%" : "٩٢٪",    color: C.mangrove,   live: false },
    { icon: Users,  label: t("dashboard.execBar.delegationArrives"),   value: lang === "en" ? "4:30 PM" : "٤:٣٠ م", color: C.mediumWood, live: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      style={{
        display: "flex", gap: 10, flexWrap: "wrap",
        padding: "14px 20px",
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        boxShadow: C.shadow,
      }}
    >
      {chips.map(({ icon: Icon, label, value, color, live }) => (
        <motion.div
          key={label}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px",
            borderRadius: 14,
            background: `${color}0C`,
            border: `1px solid ${color}28`,
            flex: 1, minWidth: 140,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
            <span style={{ fontSize: 11, color: C.warmGray, fontWeight: 600, marginBottom: 1 }}>{label}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "Georgia, serif", lineHeight: 1 }}>{value}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {live && <LiveDot color={color} />}
            <div style={{ width: 34, height: 34, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
              <Icon size={16} strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─── Weekly calendar ─────────────────────────────────────────── */
export type WeekDayEvent = {
  id?: number;
  title: string;
  kind: "event" | "visit";
  time?: string;
  location?: string;
  readiness?: number;
  href: string;
};
export type WeekDayItem = {
  date: Date; dateStr: string;
  events: WeekDayEvent[];
};

export function WeekCalendar({ days, loading }: { days: WeekDayItem[]; loading: boolean }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en-AE" : "ar-AE";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: C.warmGray }}>
          <CalendarDays size={13} />
          {t("dashboard.week.sevenDays")}
        </span>
        <h3 className="text-sm font-bold" style={{ color: C.textPrimary, fontFamily: "Georgia, serif" }}>
          {t("dashboard.week.operationalAgenda")}
        </h3>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "#FFFDF9", borderColor: "#E8DED1", boxShadow: C.shadow }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days.map((day, idx) => {
            const isToday = day.dateStr === todayStr;
            const hasEvents = day.events.length > 0;
            const dayName  = day.date.toLocaleDateString(locale, { weekday: "short" });
            const dateNum  = day.date.toLocaleDateString(locale, { day: "numeric" });
            const monthName = day.date.toLocaleDateString(locale, { month: "short" });

            const colBg = isToday
              ? "linear-gradient(to bottom, rgba(173,137,101,0.09), rgba(173,137,101,0.03))"
              : hasEvents
              ? "rgba(173,137,101,0.04)"
              : "transparent";

            return (
              <div
                key={day.dateStr}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "14px 5px 14px",
                  borderInlineEnd: idx < 6 ? "1px solid #E8DED1" : "none",
                  borderTop: isToday ? "3px solid #AD8965" : hasEvents ? "3px solid #EBCCAD" : "3px solid transparent",
                  background: colBg,
                  minHeight: 200, position: "relative",
                  transition: "background 0.2s",
                }}
              >
                {isToday && (
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 7px", borderRadius: 999, background: "#AD8965", color: "#fff", marginBottom: 6, whiteSpace: "nowrap" }}>
                    {t("common.today")}
                  </div>
                )}
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.03em", color: isToday ? "#AD8965" : "#95837A", marginBottom: isToday ? 4 : 10, textAlign: "center" }}>
                  {dayName}
                </p>
                <div style={{ fontSize: isToday ? 26 : 20, fontWeight: 700, fontFamily: "Georgia, serif", color: isToday ? "#4B4038" : "#7A6B60", lineHeight: 1, marginBottom: 3 }}>
                  {dateNum}
                </div>
                <p style={{ fontSize: 9, color: "#95837A", marginBottom: 8 }}>{monthName}</p>
                <div style={{ width: 20, height: 1, borderRadius: 1, background: hasEvents ? "#EBCCAD" : "#E8DED1", marginBottom: 8 }} />

                {loading ? (
                  <Skeleton className="w-10 h-3 rounded-full" />
                ) : hasEvents ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: "100%" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#AD8965", boxShadow: "0 0 6px rgba(173,137,101,0.5)", marginBottom: 2 }} />
                    {day.events.slice(0, 2).map((ev, i) => (
                      <Link key={i} href={ev.href}>
                        <motion.div
                          whileHover={{ y: -1, boxShadow: "0 4px 10px rgba(173,137,101,0.18)" }}
                          transition={{ type: "spring", stiffness: 380, damping: 26 }}
                          style={{
                            width: "calc(100% - 6px)", padding: "5px 4px 5px",
                            background: ev.kind === "event"
                              ? "linear-gradient(135deg, #FBE9D0, #EBCCAD)"
                              : `linear-gradient(135deg, ${C.calmTeal}25, ${C.calmTeal}40)`,
                            border: ev.kind === "event"
                              ? "1px solid rgba(173,137,101,0.25)"
                              : `1px solid ${C.calmTeal}55`,
                            borderRadius: 7,
                            cursor: "pointer",
                            display: "block",
                          }}
                        >
                          <div style={{
                            fontSize: 7.5, fontWeight: 800, letterSpacing: "0.04em",
                            textAlign: "center",
                            color: ev.kind === "event" ? "#7A4F2D" : "#2D5554",
                            marginBottom: 2, opacity: 0.85,
                          }}>
                            {ev.kind === "event" ? t("dashboard.week.officialEvent") : t("dashboard.week.diplomaticVisit")}
                          </div>
                          <p style={{
                            fontSize: 8.5, fontWeight: 700, textAlign: "center",
                            color: "#3D3529", lineHeight: 1.3, overflow: "hidden",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            marginBottom: 2,
                          }}>
                            {ev.title}
                          </p>
                          {ev.time && (
                            <p style={{ fontSize: 8, textAlign: "center", color: "#AD8965", fontWeight: 700, marginBottom: ev.location ? 1 : 0 }}>
                              {ev.time}
                            </p>
                          )}
                          {ev.location && (
                            <p style={{
                              fontSize: 7.5, textAlign: "center",
                              color: "#8A7A70", fontWeight: 500,
                              overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                              padding: "0 2px",
                            }}>
                              {ev.location}
                            </p>
                          )}
                          {typeof ev.readiness === "number" && ev.kind === "event" && (
                            <div style={{ marginTop: 3, height: 2, borderRadius: 1, background: "rgba(122,79,45,0.18)" }}>
                              <div style={{
                                height: 2, borderRadius: 1,
                                width: `${ev.readiness}%`,
                                background: ev.readiness >= 80 ? C.mangrove : ev.readiness >= 50 ? C.mediumWood : C.error,
                              }} />
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                    {day.events.length > 2 && (
                      <Link href="/calendar">
                        <p style={{ fontSize: 8, color: "#95837A", marginTop: 2, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
                          +{day.events.length - 2} {t("dashboard.week.more")}
                        </p>
                      </Link>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 8, textAlign: "center", lineHeight: 1.5, color: "rgba(149,131,122,0.45)" }}>
                    {t("dashboard.week.noEvents")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── AI insight card ─────────────────────────────────────────── */
export function AiInsightCard({ icon: Icon, text, urgent, priority, confidence, action, impact }: {
  icon: React.ElementType; text: string; urgent: boolean;
  priority: "عالية" | "متوسطة" | "منخفضة";
  confidence: number; action: string; impact: string;
}) {
  const { t } = useTranslation();
  const priorityColor = urgent ? "#C84B38" : priority === "متوسطة" ? C.mediumWood : C.mangrove;
  return (
    <motion.div
      whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(61,53,41,0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="rounded-2xl text-end"
      style={{
        background: urgent ? "rgba(200,75,56,0.04)" : "#F8F3EC",
        border: `1px solid ${urgent ? "rgba(200,75,56,0.16)" : "#E5D9C8"}`,
        overflow: "hidden",
      }}
    >
      {/* Priority stripe */}
      <div style={{ height: 2, background: `linear-gradient(to left, ${priorityColor}, ${priorityColor}00)` }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {/* Tags row */}
            <div className="flex items-center gap-1.5 mb-2" style={{ justifyContent: "flex-end" }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: `${priorityColor}18`, color: priorityColor, border: `1px solid ${priorityColor}28` }}>
                {priority}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: "#F3E7D7", color: C.mediumWood, border: "1px solid #E5D9C8" }}>
                {t("ai.aiTag")}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: urgent ? "#5C2A22" : C.textPrimary }}>
              {text}
            </p>
            {/* Confidence bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 9, fontWeight: 700, color: priorityColor }}>{confidence}٪</span>
                <span style={{ fontSize: 9, color: C.warmGray }}>{t("ai.confidenceLevel")}</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: C.border }}>
                <div style={{ height: 3, borderRadius: 999, width: `${confidence}%`, background: `linear-gradient(to left, ${priorityColor}, ${priorityColor}88)`, transition: "width 0.8s ease" }} />
              </div>
            </div>
            {/* Action & impact */}
            <div style={{ background: urgent ? "rgba(200,75,56,0.06)" : "rgba(173,137,101,0.08)", borderRadius: 10, padding: "8px 12px" }}>
              <p style={{ fontSize: 10, color: C.warmGray, marginBottom: 3, fontWeight: 600 }}>{t("ai.suggestedAction")}</p>
              <p style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600, marginBottom: 4 }}>{action}</p>
              <p style={{ fontSize: 10, color: C.warmGray }}>{impact}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: urgent ? "rgba(200,75,56,0.12)" : "#FFFDF9", color: urgent ? "#C84B38" : C.mediumWood, border: `1px solid ${urgent ? "rgba(200,75,56,0.18)" : "#E8DED1"}` }}>
            <Icon size={14} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Logistics Overview Band ─────────────────────────────────── */

export function LogisticsOverviewBand({
  logistics,
  loading,
}: {
  logistics?: {
    travel: number; hotel: number; fleet: number; gifts: number; documents: number;
    budgetEstimated: number; budgetActual: number; currency: string;
  };
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const currency = logistics?.currency ?? "AED";
  const variance = (logistics?.budgetActual ?? 0) - (logistics?.budgetEstimated ?? 0);

  const counts = [
    { icon: Plane, label: t("dashboard.logistics.travel"), value: logistics?.travel ?? 0, color: C.mediumWood },
    { icon: BedDouble, label: t("dashboard.logistics.hotel"), value: logistics?.hotel ?? 0, color: C.castleHill },
    { icon: Car, label: t("dashboard.logistics.fleet"), value: logistics?.fleet ?? 0, color: C.calmTeal },
    { icon: Gift, label: t("dashboard.logistics.gifts"), value: logistics?.gifts ?? 0, color: C.mangrove },
    { icon: FileText, label: t("dashboard.logistics.documents"), value: logistics?.documents ?? 0, color: C.mediumWood },
  ];

  return (
    <motion.div
      className="rounded-2xl border p-5"
      style={{ background: C.cardBg, borderColor: C.border, boxShadow: C.shadow, borderTop: `3px solid ${C.mediumWood}` }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <div className="flex items-center justify-end gap-2 mb-4">
        <div className="text-end">
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>{t("dashboard.logistics.title")}</h3>
          <p className="text-[11px]" style={{ color: C.warmGray }}>{t("dashboard.logistics.subtitle")}</p>
        </div>
        <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.mediumWood}18`, color: C.mediumWood }}>
          <Briefcase size={16} strokeWidth={1.5} />
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {counts.map((c, i) => (
          <div key={i} className="rounded-xl px-3 py-2.5 flex items-center justify-end gap-2.5"
            style={{ background: C.pageBg, border: `1px solid ${C.border}` }}>
            <div className="text-end">
              {loading ? (
                <Skeleton className="h-6 w-10 ms-auto" />
              ) : (
                <p className="text-2xl font-bold" style={{ color: C.textPrimary, fontFamily: "Georgia, serif", lineHeight: 1 }}>{c.value}</p>
              )}
              <p className="text-[11px] mt-1" style={{ color: C.warmGray }}>{c.label}</p>
            </div>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}18`, color: c.color }}>
              <c.icon size={14} strokeWidth={1.5} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: C.border }}>
        <div className="text-end">
          <p className="text-[11px]" style={{ color: C.warmGray }}>{t("dashboard.logistics.estimatedBudget")}</p>
          {loading ? <Skeleton className="h-6 w-28 ms-auto mt-1" /> : (
            <p className="text-lg font-bold" style={{ color: C.mediumWood, fontFamily: "Georgia, serif" }}>{fmtMoneyShort(logistics?.budgetEstimated ?? 0, currency, lang)}</p>
          )}
        </div>
        <div className="text-end">
          <p className="text-[11px]" style={{ color: C.warmGray }}>{t("dashboard.logistics.actualBudget")}</p>
          {loading ? <Skeleton className="h-6 w-28 ms-auto mt-1" /> : (
            <p className="text-lg font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{fmtMoneyShort(logistics?.budgetActual ?? 0, currency, lang)}</p>
          )}
        </div>
        <div className="text-end">
          <p className="text-[11px]" style={{ color: C.warmGray }}>{t("dashboard.logistics.variance")}</p>
          {loading ? <Skeleton className="h-6 w-28 ms-auto mt-1" /> : (
            <p className="text-lg font-bold" style={{ color: variance > 0 ? "#C84B38" : C.mangrove, fontFamily: "Georgia, serif" }}>{fmtMoneyShort(variance, currency, lang)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Budget Overspend Alert Band ─────────────────────────────── */
export type BudgetAlertItem = {
  eventId: number;
  name: string;
  nameAr?: string;
  estimated: number;
  actual: number;
  overBy: number;
  overByPercent: number;
  spentPercent: number;
  status: "warning" | "over";
  currency: string;
};

export const BUDGET_THRESHOLD_MIN = 50;
export const BUDGET_THRESHOLD_MAX = 100;
export const BUDGET_THRESHOLD_STEP = 5;

export function ThresholdStepper({
  threshold,
  onThresholdChange,
}: {
  threshold: number;
  onThresholdChange?: (next: number) => void;
}) {
  const { t } = useTranslation();
  const clamp = (n: number) =>
    Math.min(BUDGET_THRESHOLD_MAX, Math.max(BUDGET_THRESHOLD_MIN, n));
  const atMin = threshold <= BUDGET_THRESHOLD_MIN;
  const atMax = threshold >= BUDGET_THRESHOLD_MAX;

  if (!onThresholdChange) return null;

  const btn = (disabled: boolean): React.CSSProperties => ({
    width: 26,
    height: 26,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    color: disabled ? C.warmGray : C.textPrimary,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <span
        className="flex items-center gap-1.5 text-[10.5px] font-semibold"
        style={{ color: C.warmGray }}
      >
        <SlidersHorizontal size={12} strokeWidth={1.8} />
        {t("dashboard.budgetAlert.thresholdLabel")}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={t("dashboard.budgetAlert.thresholdDecrease")}
          disabled={atMin}
          onClick={() => onThresholdChange(clamp(threshold - BUDGET_THRESHOLD_STEP))}
          style={btn(atMin)}
        >
          <Minus size={13} strokeWidth={2} />
        </button>
        <span
          className="tabular-nums text-xs font-bold"
          style={{ color: C.textPrimary, minWidth: 38, textAlign: "center", fontFamily: "Georgia, serif" }}
        >
          {threshold}%
        </span>
        <button
          type="button"
          aria-label={t("dashboard.budgetAlert.thresholdIncrease")}
          disabled={atMax}
          onClick={() => onThresholdChange(clamp(threshold + BUDGET_THRESHOLD_STEP))}
          style={btn(atMax)}
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function BudgetAlertBand({
  alerts,
  logistics,
  loading,
  threshold,
  onThresholdChange,
}: {
  alerts?: BudgetAlertItem[];
  logistics?: { budgetEstimated: number; budgetActual: number; currency: string };
  loading?: boolean;
  threshold: number;
  onThresholdChange?: (next: number) => void;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const danger = "#C84B38";
  const warn = C.mediumWood;

  if (loading) return null;

  const orgEstimated = logistics?.budgetEstimated ?? 0;
  const orgActual = logistics?.budgetActual ?? 0;
  const orgOverBy = orgActual - orgEstimated;
  const orgOver = orgOverBy > 0;
  const eventAlerts = alerts ?? [];
  const overAlerts = eventAlerts.filter((a) => a.status === "over");
  const warnAlerts = eventAlerts.filter((a) => a.status === "warning");
  const hasAny = orgOver || eventAlerts.length > 0;

  // The most severe present state drives the band's accent colour.
  const accent = orgOver || overAlerts.length > 0 ? danger : hasAny ? warn : C.mangrove;
  const titleColor = orgOver || overAlerts.length > 0 ? "#8B2020" : C.textPrimary;
  const currency = logistics?.currency ?? eventAlerts[0]?.currency ?? "AED";

  return (
    <motion.div
      className="rounded-2xl border p-5"
      style={{
        background: `${accent}0A`,
        borderColor: `${accent}2E`,
        boxShadow: C.shadow,
        borderTop: `3px solid ${accent}`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.14 }}
    >
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <ThresholdStepper threshold={threshold} onThresholdChange={onThresholdChange} />
        <div className="flex items-center justify-end gap-2">
          <div className="text-end">
            <div className="flex items-center gap-2 justify-end flex-wrap">
              <h3 className="text-sm font-semibold" style={{ color: titleColor }}>{t("dashboard.budgetAlert.title")}</h3>
              {overAlerts.length > 0 && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${danger}18`, color: danger, border: `1px solid ${danger}30` }}>
                  {t("dashboard.budgetAlert.eventsOver", { count: overAlerts.length })}
                </span>
              )}
              {warnAlerts.length > 0 && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${warn}1F`, color: warn, border: `1px solid ${warn}3A` }}>
                  {t("dashboard.budgetAlert.eventsApproaching", { count: warnAlerts.length })}
                </span>
              )}
            </div>
            <p className="text-[11px]" style={{ color: C.warmGray }}>
              {hasAny ? t("dashboard.budgetAlert.subtitle", { threshold }) : t("dashboard.budgetAlert.healthy")}
            </p>
          </div>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}1F`, color: accent }}>
            {hasAny ? <AlertTriangle size={16} strokeWidth={1.7} /> : <ShieldCheck size={16} strokeWidth={1.7} />}
          </span>
        </div>
      </div>

      {!hasAny && (
        <div className="rounded-xl px-3.5 py-2.5 text-end" style={{ background: `${C.mangrove}0E`, border: `1px solid ${C.mangrove}24` }}>
          <p className="text-xs font-medium" style={{ color: C.textPrimary }}>
            {t("dashboard.budgetAlert.healthyDetail", { threshold })}
          </p>
        </div>
      )}

      {orgOver && (
        <div className="rounded-xl px-3.5 py-2.5 mb-3 text-end" style={{ background: `${danger}0E`, border: `1px solid ${danger}24` }}>
          <p className="text-xs font-semibold" style={{ color: "#5C2A22" }}>
            {t("dashboard.budgetAlert.orgOver", { amount: fmtMoneyShort(orgOverBy, currency, lang) })}
          </p>
        </div>
      )}

      {eventAlerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {eventAlerts.map((a) => {
            const displayName = lang === "ar" ? (a.nameAr || a.name) : a.name;
            const isOver = a.status === "over";
            const accentC = isOver ? danger : warn;
            const detailColor = isOver ? "#8B2020" : C.mediumWood;
            return (
              <Link key={a.eventId} href={`/events/${a.eventId}`}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: `0 6px 16px ${accentC}29` }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="rounded-xl px-3.5 py-3 flex items-center justify-between gap-3 cursor-pointer"
                  style={{ background: C.cardBg, border: `1px solid ${accentC}28` }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: `${accentC}16`, color: accentC, whiteSpace: "nowrap", fontFamily: "Georgia, serif" }}>
                    {isOver ? `+${a.overByPercent}٪` : `${a.spentPercent}٪`}
                  </span>
                  <div className="text-end min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: C.textPrimary }}>{displayName}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: detailColor }}>
                      <span style={{ fontWeight: 700 }}>
                        {isOver ? t("dashboard.budgetAlert.overByLabel") : t("dashboard.budgetAlert.spentLabel")}:{" "}
                      </span>
                      {isOver ? fmtMoneyShort(a.overBy, a.currency, lang) : `${a.spentPercent}٪`}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: C.warmGray }}>
                      {t("dashboard.budgetAlert.estimatedLabel")} {fmtMoneyShort(a.estimated, a.currency, lang)} · {t("dashboard.budgetAlert.actualLabel")} {fmtMoneyShort(a.actual, a.currency, lang)}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── AI Assistant Card ───────────────────────────────────────── */
/* AssistantReply + ChatMessage are shared from @/ai/types. */

