import { palette } from "@/theme";
import type { Event, EventReadiness } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, User, Shield, Car, Coffee, Ban,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";

const T = palette;

function getCategoryIcon(name: string) {
  switch (name.toLowerCase()) {
    case "protocol":    return <User size={17} strokeWidth={1.5} />;
    case "security":    return <Shield size={17} strokeWidth={1.5} />;
    case "transport":   return <Car size={17} strokeWidth={1.5} />;
    case "hospitality": return <Coffee size={17} strokeWidth={1.5} />;
    default:            return <CheckCircle2 size={17} strokeWidth={1.5} />;
  }
}

function pctColor(pct: number) {
  if (pct === 100) return T.mangrove;
  if (pct >= 60)   return T.mediumWood;
  return "#DC2626";
}

export function OverviewTab({
  event,
  readiness,
  isReadinessLoading,
}: {
  event: Event;
  readiness?: EventReadiness;
  isReadinessLoading: boolean;
}) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const isCancelled = event.status === "cancelled";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {isCancelled && (
        <div
          className="lg:col-span-3 rounded-2xl border p-5 text-end"
          style={{ background: "#DC26260A", borderColor: "#DC262633", borderTop: "3px solid #DC2626" }}
        >
          <div className="flex items-center justify-end gap-2 mb-3">
            <h2 className="text-base font-semibold" style={{ color: "#8B2020" }}>
              {t("pages.commandCenter.overview.cancellationTitle")}
            </h2>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#DC262618", color: "#DC2626" }}>
              <Ban size={16} strokeWidth={1.7} />
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <p className="text-xs text-muted-foreground mb-1">{t("pages.commandCenter.overview.cancellationReason")}</p>
              <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                {event.cancellationReason || (
                  <span className="text-muted-foreground italic">{t("pages.commandCenter.overview.cancellationNoReason")}</span>
                )}
              </p>
            </div>
            {event.cancelledBy && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pages.commandCenter.overview.cancellationBy")}</p>
                <p className="text-sm font-medium text-foreground">{event.cancelledBy}</p>
              </div>
            )}
            {event.cancelledAt && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pages.commandCenter.overview.cancellationAt")}</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(event.cancelledAt).toLocaleString(lang === "en" ? "en-GB" : "ar-AE", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Readiness — left 2/3 */}
      <div className="lg:col-span-2 space-y-6">
        <div
          className="rounded-2xl border p-6"
          style={{ borderColor: T.border, background: T.cardBg }}
        >
          <div className="flex items-end justify-between mb-5">
            <div
              className="text-3xl font-bold"
              style={{ color: T.mangrove, fontFamily: "Georgia, serif" }}
            >
              {event.readinessPercent}%
            </div>
            <div className="text-end">
              <h2 className="text-base font-semibold text-foreground">{t("pages.commandCenter.overview.overallReadiness")}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t("pages.commandCenter.overview.readinessSubtitle")}</p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: T.border }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${event.readinessPercent}%`,
                background: `linear-gradient(to left, ${T.mangrove}, ${T.calmTeal})`,
              }}
            />
          </div>

          {isReadinessLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <motion.div
              className="mt-5 divide-y"
              style={{ borderColor: T.border }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {readiness?.categories.map((cat, i) => {
                const pct = cat.percent ?? 0;
                const color = pctColor(pct);
                return (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between py-3.5 hover:bg-muted/20 transition-colors rounded-lg px-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3 w-32 shrink-0">
                      <span className="text-sm font-bold min-w-[2.5rem] text-end" style={{ color }}>
                        {pct}%
                      </span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-end">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{lang === "en" ? (cat.name || cat.nameAr) : (cat.nameAr || cat.name)}</p>
                        <p className="text-xs text-muted-foreground">{cat.status}</p>
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: color + "15", color }}
                      >
                        {getCategoryIcon(cat.name)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {event.notes && (
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: T.border, background: T.cardBg }}
          >
            <h2 className="text-base font-semibold text-foreground text-end mb-3">{t("pages.commandCenter.overview.notes")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap text-end">
              {event.notes}
            </p>
          </div>
        )}
      </div>

      {/* Info panel — right 1/3 */}
      <div className="space-y-4">
        <div
          className="rounded-2xl border p-6 space-y-5 text-end"
          style={{ borderColor: T.border, background: T.cardBg }}
        >
          <h2 className="text-base font-semibold text-foreground">{t("pages.commandCenter.overview.quickInfo")}</h2>

          <div className="space-y-4">
            <div className="pb-4 border-b" style={{ borderColor: T.border }}>
              <p className="text-xs text-muted-foreground mb-1">{t("pages.commandCenter.overview.pendingTasks")}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: T.mediumWood, fontFamily: "Georgia, serif" }}
              >
                {event.pendingTasksCount ?? 0}
              </p>
            </div>

            <div className="pb-4 border-b" style={{ borderColor: T.border }}>
              <p className="text-xs text-muted-foreground mb-2">{t("pages.commandCenter.overview.riskLevel")}</p>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={
                  event.riskLevel === "high"
                    ? { background: "#DC262615", color: "#DC2626" }
                    : event.riskLevel === "medium"
                    ? { background: T.mediumWood + "1A", color: T.mediumWood }
                    : { background: T.mangrove + "1A", color: T.mangrove }
                }
              >
                {event.riskLevel === "high"
                  ? t("pages.commandCenter.overview.riskHigh")
                  : event.riskLevel === "medium"
                  ? t("pages.commandCenter.overview.riskMedium")
                  : t("pages.commandCenter.overview.riskLow")}
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("pages.commandCenter.overview.createdAt")}</p>
              <p className="text-sm font-medium text-foreground">
                {event.createdAt
                  ? new Date(event.createdAt).toLocaleDateString(lang === "en" ? "en-GB" : "ar-AE")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
