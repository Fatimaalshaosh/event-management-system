import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import type { Event } from "@workspace/api-client-react";
import { SectionCard, C } from "../primitives";
import {
  evName,
  deriveEventAlerts,
  alertSeverityColor,
  alertSeverityRank,
  type Lang,
  type AlertSeverity,
} from "../../events/event-utils";

export function ActiveRisksWidget({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const risks = events
    .flatMap((ev) =>
      deriveEventAlerts(ev)
        .filter((a) => a.severity === "critical" || a.severity === "high")
        .map((a) => ({ ev, alert: a })),
    )
    .sort((a, b) => alertSeverityRank[b.alert.severity] - alertSeverityRank[a.alert.severity])
    .slice(0, 5);

  return (
    <SectionCard title={t("dashboard.risks.title")} accent="#C0623D">
      {risks.length === 0 ? (
        <div className="flex flex-col items-center text-center py-5" style={{ color: C.mangrove }}>
          <ShieldCheck size={30} className="mb-2" strokeWidth={1.6} />
          <p className="text-xs" style={{ color: C.warmGray }}>{t("dashboard.risks.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {risks.map(({ ev, alert }, i) => {
            const color = alertSeverityColor(alert.severity as AlertSeverity);
            const text = t(alert.i18nKey, alert.params);
            return (
              <Link key={`${ev.id}-${i}`} href={`/events/${ev.id}`}>
                <div
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
                  style={{
                    background: `${color}0E`,
                    border: `1px solid ${color}30`,
                    padding: "9px 11px",
                    flexDirection: dir === "rtl" ? "row-reverse" : "row",
                  }}
                >
                  <AlertTriangle size={14} strokeWidth={1.9} style={{ color, flexShrink: 0 }} />
                  <div className="min-w-0 flex-1" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                    <p className="truncate" style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }} title={text}>
                      {text}
                    </p>
                    <p className="truncate" style={{ fontSize: 10, color: C.warmGray, marginTop: 1 }}>
                      {evName(ev, lang)}
                    </p>
                  </div>
                  <span
                    className="shrink-0"
                    style={{
                      fontSize: 8.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                      background: color, color: "#fff", letterSpacing: "0.04em",
                    }}
                  >
                    {t(`severity.${alert.severity}`)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
