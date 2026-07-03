import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Radar } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Event } from "@workspace/api-client-react";
import { SectionCard, C } from "../primitives";
import { evName, parseEventDate, readinessColor, type Lang } from "../../events/event-utils";

export function WatchedEventsWidget({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;
  const watched = events
    .filter((e) => e.watched)
    .sort((a, b) => +parseEventDate(a) - +parseEventDate(b))
    .slice(0, 6);

  return (
    <SectionCard title={t("dashboard.watched.title")} linkHref="/events" accent={C.calmTeal}>
      {watched.length === 0 ? (
        <div className="text-center py-6" style={{ color: C.warmGray }}>
          <Radar size={30} className="mx-auto mb-2 opacity-20" />
          <p className="text-xs">{t("dashboard.watched.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {watched.map((ev) => {
            const rColor = readinessColor(ev.readinessPercent);
            return (
              <Link key={ev.id} href={`/events/${ev.id}`}>
                <div
                  className="rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
                  style={{ background: C.pageBg, border: `1px solid ${C.border}`, padding: "10px 12px" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2" style={{ flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: rColor }}>{ev.readinessPercent}%</span>
                    <div className="min-w-0 flex-1" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                      <p className="truncate" style={{ fontSize: 12.5, fontWeight: 700, color: C.textPrimary }} title={evName(ev, lang)}>
                        {evName(ev, lang)}
                      </p>
                      <p style={{ fontSize: 10, color: C.warmGray, marginTop: 1 }}>
                        {format(parseEventDate(ev), "d MMM yyyy", { locale })}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ background: C.border }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${ev.readinessPercent}%`, background: rColor }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
