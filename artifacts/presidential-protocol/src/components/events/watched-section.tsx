import type { Event } from "@workspace/api-client-react";


import { Link } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Eye, ArrowLeft, ArrowRight, AlertTriangle, Check, Clock } from "lucide-react";
import { T, type Lang, type EventAlert, evName, eventId, statusMeta, readinessColor, deriveEventAlerts, alertSeverityColor } from "./event-utils";
import { PinWatchControls } from "./event-card";
import { SectionHeader } from "@/components/events/section-header";

/* Extracted from events-sections.tsx — watched events section. */
export function AlertText({ alert }: { alert: EventAlert }) {
  const { t } = useTranslation();
  const color = alertSeverityColor(alert.severity);
  return (
    <div className="flex items-center gap-2" style={{ fontSize: 11.5 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }} />
      <span style={{ color: T.textPrimary }}>{t(alert.i18nKey, alert.params)}</span>
    </div>
  );
}

export function WatchedRow({ ev, lang }: { ev: Event; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;
  const [open, setOpen] = useState(false);
  const st = statusMeta(ev.status);
  const rColor = readinessColor(ev.readinessPercent);
  const alerts = deriveEventAlerts(ev);
  const Open = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${alerts.length > 0 ? T.calmTeal + "55" : T.border}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div className="flex items-center gap-3" style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
        <div style={{ flex: 1, minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
          <div className="flex items-center gap-2" style={{ justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: T.warmGray }}>{eventId(ev)}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: st.bg,
                color: st.color,
              }}
            >
              {t(`status.${ev.status}`)}
            </span>
          </div>
          <Link href={`/events/${ev.id}`}>
            <p
              className="cursor-pointer hover:underline"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.textPrimary,
                marginTop: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={evName(ev, lang)}
            >
              {evName(ev, lang)}
            </p>
          </Link>
          <div
            className="flex items-center gap-3"
            style={{ marginTop: 6, fontSize: 11, color: T.warmGray, justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}
          >
            <span className="flex items-center gap-1">
              <Clock size={11} strokeWidth={1.7} />
              {t("pages.events.watchedSection.lastUpdate")}:{" "}
              {ev.createdAt ? format(new Date(ev.createdAt), "d MMM", { locale }) : "—"}
            </span>
            <span style={{ fontWeight: 800, color: rColor }}>{ev.readinessPercent}%</span>
          </div>
        </div>

        {/* Alerts count badge */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {alerts.length > 0 ? (
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.calmTeal,
                background: T.calmTeal + "1A",
                borderRadius: 999,
                padding: "3px 9px",
              }}
            >
              <AlertTriangle size={12} strokeWidth={2} />
              {t("pages.events.watchedSection.activeAlerts", { count: alerts.length })}
            </span>
          ) : (
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.mangrove,
                background: T.mangrove + "14",
                borderRadius: 999,
                padding: "3px 9px",
              }}
            >
              <Check size={12} strokeWidth={2} />
              {t("pages.events.watchedSection.noAlerts")}
            </span>
          )}
        </div>
      </div>

      {/* Alert preview */}
      {alerts.length > 0 && (
        <div className="space-y-1.5" style={{ marginTop: 10 }}>
          {(open ? alerts : alerts.slice(0, 2)).map((a) => (
            <AlertText key={a.key} alert={a} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-2"
        style={{ marginTop: 12, justifyContent: dir === "rtl" ? "flex-end" : "flex-start", flexWrap: "wrap" }}
      >
        <Link href={`/events/${ev.id}`}>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: T.calmTeal, color: "#fff" }}
          >
            {t("pages.events.watchedSection.openEvent")} <Open size={13} />
          </button>
        </Link>
        {alerts.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ border: `1px solid ${T.border}`, color: T.textPrimary, background: T.cardBg }}
          >
            {t("pages.events.watchedSection.viewTimeline")}
          </button>
        )}
        <PinWatchControls event={ev} size={28} />
      </div>
    </div>
  );
}

export function WatchedSection({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const watched = events
    .filter((e) => e.watched)
    .slice()
    .sort((a, b) => deriveEventAlerts(b).length - deriveEventAlerts(a).length);

  return (
    <section
      className="space-y-4 p-5 rounded-2xl"
      style={{ background: T.calmTeal + "0D", border: `1px solid ${T.calmTeal}33` }}
      dir={dir}
    >
      <SectionHeader
        Icon={Eye}
        accent={T.calmTeal}
        title={t("pages.events.watchedSection.title")}
        subtitle={t("pages.events.watchedSection.subtitle")}
        count={watched.length}
        dir={dir}
      />
      {watched.length === 0 ? (
        <p style={{ fontSize: 13, color: T.warmGray, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("pages.events.watchedSection.empty")}
        </p>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {watched.map((ev) => (
            <WatchedRow key={ev.id} ev={ev} lang={lang} />
          ))}
        </div>
      )}
    </section>
  );
}

