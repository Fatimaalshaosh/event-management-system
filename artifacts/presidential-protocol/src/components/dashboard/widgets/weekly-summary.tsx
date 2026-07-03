import { useTranslation } from "react-i18next";
import { CalendarDays, Flag, CheckSquare, Gauge } from "lucide-react";
import type { Event, Visit, Approval } from "@workspace/api-client-react";
import { SectionCard, C } from "../primitives";
import { parseEventDate, type Lang } from "../../events/event-utils";

export function WeeklySummaryWidget({
  events,
  visits,
  approvals,
  lang,
}: {
  events: Event[];
  visits: Visit[];
  approvals: Approval[];
  lang: Lang;
}) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const eventsThisWeek = events.filter((e) => {
    const d = parseEventDate(e);
    return d >= start && d < end;
  }).length;

  const visitsThisWeek = visits.filter((v) => {
    if (!v.arrivalDate) return false;
    const d = new Date(v.arrivalDate);
    return d >= start && d < end;
  }).length;

  const pending = approvals.filter((a) => a.status === "pending").length;

  const avgReadiness = events.length
    ? Math.round(events.reduce((s, e) => s + (e.readinessPercent ?? 0), 0) / events.length)
    : 0;

  const stats = [
    { icon: CalendarDays, label: t("dashboard.weekly.events"), value: eventsThisWeek, color: C.mangrove },
    { icon: Flag, label: t("dashboard.weekly.visits"), value: visitsThisWeek, color: C.calmTeal },
    { icon: CheckSquare, label: t("dashboard.weekly.pending"), value: pending, color: "#C0623D" },
    { icon: Gauge, label: t("dashboard.weekly.avgReadiness"), value: `${avgReadiness}%`, color: C.mediumWood },
  ];

  return (
    <SectionCard title={t("dashboard.weekly.title")} accent={C.calmTeal}>
      <div className="grid grid-cols-2 gap-2.5" dir={dir}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl"
            style={{ background: `${s.color}0E`, border: `1px solid ${s.color}28`, padding: "12px 14px" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div
                className="rounded-lg flex items-center justify-center"
                style={{ width: 28, height: 28, background: `${s.color}1F`, color: s.color }}
              >
                <s.icon size={14} strokeWidth={1.7} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "Georgia, serif", lineHeight: 1 }}>
                {s.value}
              </span>
            </div>
            <p style={{ fontSize: 10.5, color: C.warmGray, fontWeight: 600, textAlign: dir === "rtl" ? "right" : "left" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
