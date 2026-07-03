import type { Event } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Star, Eye, AlertTriangle, Check } from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  T,
  type Lang,
  evName,
  parseEventDate,
  statusMeta,
  readinessColor,
  colorTagColor,
  pinnedSort,
  deriveEventAlerts,
} from "./event-utils";

function WidgetCard({
  title,
  Icon,
  accent,
  count,
  linkHref,
  linkLabel,
  dir,
  children,
}: {
  title: string;
  Icon: typeof Star;
  accent: string;
  count: number;
  linkHref: string;
  linkLabel: string;
  dir: "rtl" | "ltr";
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: T.cardBg, borderColor: T.border, boxShadow: "0 1px 3px rgba(61,53,41,0.04)" }}
      dir={dir}
    >
      <div style={{ height: 3, background: `linear-gradient(to left, ${accent}, ${accent}00)` }} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <Link
            href={linkHref}
            className="text-xs font-medium flex items-center gap-1 transition-all hover:opacity-70"
            style={{ color: accent }}
          >
            {linkLabel} <ChevronEnd size={14} />
          </Link>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: accent,
                background: accent + "1A",
                borderRadius: 999,
                padding: "1px 9px",
              }}
            >
              {count}
            </span>
            <h2
              className="text-lg font-bold"
              style={{ color: T.textPrimary, fontFamily: "Georgia, serif", textAlign: dir === "rtl" ? "right" : "left" }}
            >
              {title}
            </h2>
            <span style={{ color: accent }}>
              <Icon size={18} strokeWidth={1.7} />
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TopPinnedWidget({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;
  const pinned = events.filter((e) => e.pinned).slice().sort(pinnedSort).slice(0, 5);

  return (
    <WidgetCard
      title={t("dashboard.pinned.title")}
      Icon={Star}
      accent={T.gold}
      count={pinned.length}
      linkHref="/events"
      linkLabel={t("dashboard.pinned.viewAll")}
      dir={dir}
    >
      {pinned.length === 0 ? (
        <p style={{ fontSize: 13, color: T.warmGray, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("dashboard.pinned.empty")}
        </p>
      ) : (
        <div className="space-y-2.5">
          {pinned.map((ev) => {
            const rail = colorTagColor(ev.colorTag) ?? T.gold;
            const rColor = readinessColor(ev.readinessPercent);
            const st = statusMeta(ev.status);
            return (
              <Link key={ev.id} href={`/events/${ev.id}`}>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow"
                  style={{
                    background: T.floralWhite,
                    border: `1px solid ${T.borderSoft}`,
                    borderInlineStart: `3px solid ${rail}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    flexDirection: dir === "rtl" ? "row-reverse" : "row",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={evName(ev, lang)}
                    >
                      {evName(ev, lang)}
                    </p>
                    <div
                      className="flex items-center gap-2"
                      style={{ marginTop: 3, flexDirection: dir === "rtl" ? "row-reverse" : "row", justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}
                    >
                      <span style={{ fontSize: 10, color: T.warmGray }}>
                        {format(parseEventDate(ev), "d MMM yyyy", { locale })}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: 999,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {t(`status.${ev.status}`)}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: rColor }}>{ev.readinessPercent}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

export function SmartMonitoringWidget({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const watched = events.filter((e) => e.watched);
  const withAlerts = watched
    .map((e) => ({ ev: e, alerts: deriveEventAlerts(e) }))
    .sort((a, b) => b.alerts.length - a.alerts.length);
  const totalAlerts = withAlerts.reduce((sum, x) => sum + x.alerts.length, 0);
  const warnings = watched.filter((e) => e.readinessPercent < 80).length;

  return (
    <WidgetCard
      title={t("dashboard.monitoring.title")}
      Icon={Eye}
      accent={T.calmTeal}
      count={watched.length}
      linkHref="/events"
      linkLabel={t("dashboard.monitoring.viewAll")}
      dir={dir}
    >
      {watched.length === 0 ? (
        <p style={{ fontSize: 13, color: T.warmGray, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("dashboard.monitoring.empty")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: t("dashboard.monitoring.activeAlerts"), value: totalAlerts, color: T.alert },
              { label: t("dashboard.monitoring.warnings"), value: warnings, color: T.mediumWood },
              { label: t("dashboard.monitoring.watchedCount"), value: watched.length, color: T.calmTeal },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.color + "12",
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "Georgia, serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: T.warmGray, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {totalAlerts === 0 ? (
            <p className="flex items-center gap-2" style={{ fontSize: 12.5, color: T.mangrove, justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
              <Check size={14} strokeWidth={2} /> {t("dashboard.monitoring.noAlerts")}
            </p>
          ) : (
            <div className="space-y-2">
              {withAlerts
                .filter((x) => x.alerts.length > 0)
                .slice(0, 4)
                .map(({ ev, alerts }) => (
                  <Link key={ev.id} href={`/events/${ev.id}`}>
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:shadow-sm transition-shadow"
                      style={{
                        background: T.floralWhite,
                        border: `1px solid ${T.borderSoft}`,
                        borderRadius: 11,
                        padding: "9px 11px",
                        flexDirection: dir === "rtl" ? "row-reverse" : "row",
                      }}
                    >
                      <AlertTriangle size={14} strokeWidth={1.9} style={{ color: T.calmTeal, flexShrink: 0 }} />
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: T.textPrimary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: dir === "rtl" ? "right" : "left",
                        }}
                        title={evName(ev, lang)}
                      >
                        {evName(ev, lang)}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          color: T.calmTeal,
                          background: T.calmTeal + "1A",
                          borderRadius: 999,
                          padding: "2px 8px",
                          flexShrink: 0,
                        }}
                      >
                        {t("pages.events.watchedSection.activeAlerts", { count: alerts.length })}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
}
