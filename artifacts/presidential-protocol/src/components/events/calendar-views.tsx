import type { Event } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, isToday, addDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { EventCard, EventPill, EventMiniCard } from "./event-card";
import { T, type Lang, eventDateKey, eventTimeMinutes } from "./event-utils";

const WEEK_STARTS = 0 as const; // Sunday

function groupByDate(events: Event[]): Map<string, Event[]> {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const key = eventDateKey(e);
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  for (const arr of map.values()) arr.sort((a, b) => eventTimeMinutes(a) - eventTimeMinutes(b));
  return map;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 0", color: T.warmGray }}>
      <CalendarDays size={34} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
      <p style={{ fontSize: 13 }}>{label}</p>
    </div>
  );
}

/* ── Year view ───────────────────────────────────────── */
export function YearView({
  events,
  lang,
  year,
  onSelectMonth,
}: {
  events: Event[];
  lang: Lang;
  year: Date;
  onSelectMonth: (d: Date) => void;
}) {
  const locale = lang === "ar" ? ar : enUS;
  const months = eachMonthOfInterval({ start: startOfYear(year), end: endOfYear(year) });
  const byDate = groupByDate(events);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
      {months.map((m, i) => {
        const monthEvents = events.filter((e) => isSameMonth(parseISO(e.date), m));
        const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(m), { weekStartsOn: WEEK_STARTS }), end: endOfWeek(endOfMonth(m), { weekStartsOn: WEEK_STARTS }) });
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            onClick={() => onSelectMonth(m)}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: lang === "ar" ? "right" : "left",
              background: T.cardBg,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            className="hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
                {format(m, "MMMM", { locale })}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: monthEvents.length ? T.mangrove : T.warmGray,
                  background: monthEvents.length ? T.mangrove + "16" : "transparent",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {monthEvents.length}
              </span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {days.map((d, j) => {
                const has = (byDate.get(format(d, "yyyy-MM-dd")) ?? []).length > 0;
                const inMonth = isSameMonth(d, m);
                return (
                  <div
                    key={j}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      borderRadius: 5,
                      color: !inMonth ? T.warmGray + "55" : isToday(d) ? "#fff" : T.textPrimary,
                      background: isToday(d)
                        ? T.mangrove
                        : has && inMonth
                          ? T.sunset + "66"
                          : "transparent",
                      fontWeight: has || isToday(d) ? 700 : 400,
                    }}
                  >
                    {format(d, "d")}
                  </div>
                );
              })}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Month view ──────────────────────────────────────── */
export function MonthView({
  events,
  lang,
  month,
  onSelectDay,
}: {
  events: Event[];
  lang: Lang;
  month: Date;
  onSelectDay: (d: Date) => void;
}) {
  const { t } = useTranslation();
  const locale = lang === "ar" ? ar : enUS;
  const byDate = groupByDate(events);
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayRefs = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 6) });

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {weekdayRefs.map((d, i) => (
          <div
            key={i}
            style={{
              padding: "10px 0",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: T.warmGray,
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {format(d, "EEE", { locale })}
          </div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((d, i) => {
          const dayEvents = byDate.get(format(d, "yyyy-MM-dd")) ?? [];
          const inMonth = isSameMonth(d, month);
          const shown = dayEvents.slice(0, 3);
          const extra = dayEvents.length - shown.length;
          return (
            <div
              key={i}
              onClick={() => onSelectDay(d)}
              style={{
                minHeight: 108,
                padding: 6,
                borderInlineEnd: (i + 1) % 7 === 0 ? "none" : `1px solid ${T.borderSoft}`,
                borderBottom: i < days.length - 7 ? `1px solid ${T.borderSoft}` : "none",
                background: inMonth ? "transparent" : "rgba(149,131,122,0.04)",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isToday(d) ? 800 : 600,
                    color: !inMonth ? T.warmGray + "66" : T.textPrimary,
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    background: isToday(d) ? T.mangrove : "transparent",
                    ...(isToday(d) ? { color: "#fff" } : {}),
                  }}
                >
                  {format(d, "d")}
                </span>
              </div>
              {shown.map((e) => (
                <EventPill key={e.id} event={e} lang={lang} />
              ))}
              {extra > 0 && (
                <span style={{ fontSize: 9.5, fontWeight: 600, color: T.warmGray, paddingInlineStart: 4 }}>
                  {t("pages.events.moreEvents", { count: extra })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Week view ───────────────────────────────────────── */
export function WeekView({
  events,
  lang,
  weekDate,
  onSelectDay,
}: {
  events: Event[];
  lang: Lang;
  weekDate: Date;
  onSelectDay: (d: Date) => void;
}) {
  const locale = lang === "ar" ? ar : enUS;
  const byDate = groupByDate(events);
  const start = startOfWeek(weekDate, { weekStartsOn: WEEK_STARTS });
  const days = eachDayOfInterval({ start, end: endOfWeek(weekDate, { weekStartsOn: WEEK_STARTS }) });

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {days.map((d, i) => {
        const dayEvents = byDate.get(format(d, "yyyy-MM-dd")) ?? [];
        return (
          <div
            key={i}
            style={{
              background: T.cardBg,
              border: `1px solid ${isToday(d) ? T.mangrove + "66" : T.border}`,
              borderRadius: 14,
              overflow: "hidden",
              minHeight: 260,
            }}
          >
            <button
              onClick={() => onSelectDay(d)}
              className="w-full hover:opacity-80 transition-opacity"
              style={{
                padding: "8px 6px",
                textAlign: "center",
                borderBottom: `1px solid ${T.borderSoft}`,
                background: isToday(d) ? T.mangrove + "12" : "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: T.warmGray }}>{format(d, "EEE", { locale })}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isToday(d) ? T.mangrove : T.textPrimary }}>
                {format(d, "d")}
              </div>
            </button>
            <div style={{ padding: 6 }}>
              {dayEvents.length === 0 ? (
                <div style={{ fontSize: 10, color: T.warmGray + "99", textAlign: "center", paddingTop: 14 }}>—</div>
              ) : (
                dayEvents.map((e) => <EventMiniCard key={e.id} event={e} lang={lang} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Day view (hourly timeline) ──────────────────────── */
export function DayView({ events, lang, day }: { events: Event[]; lang: Lang; day: Date }) {
  const { t } = useTranslation();
  const locale = lang === "ar" ? ar : enUS;
  const dayEvents = groupByDate(events).get(format(day, "yyyy-MM-dd")) ?? [];

  const timed = dayEvents.filter((e) => eventTimeMinutes(e) !== 9999);
  const allDay = dayEvents.filter((e) => eventTimeMinutes(e) === 9999);

  // Hour range to render — bracket the events, default 8:00–20:00.
  const hours = timed.map((e) => Math.floor(eventTimeMinutes(e) / 60));
  const startHour = hours.length ? Math.min(8, ...hours) : 8;
  const endHour = hours.length ? Math.max(20, ...hours) : 20;
  const hourRows = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: T.textPrimary,
          marginBottom: 14,
          textAlign: lang === "ar" ? "right" : "left",
        }}
      >
        {format(day, "EEEE, d MMMM yyyy", { locale })}
      </div>

      {dayEvents.length === 0 ? (
        <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 18 }}>
          <EmptyState label={t("pages.events.noEventsThisDay")} />
        </div>
      ) : (
        <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
          {allDay.length > 0 && (
            <div style={{ padding: 12, borderBottom: `1px solid ${T.borderSoft}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.warmGray, marginBottom: 8 }}>
                {t("pages.events.allDay")}
              </div>
              <div className="space-y-3">
                {allDay.map((e, i) => (
                  <EventCard key={e.id} event={e} lang={lang} index={i} />
                ))}
              </div>
            </div>
          )}
          {hourRows.map((h) => {
            const slotEvents = timed.filter((e) => Math.floor(eventTimeMinutes(e) / 60) === h);
            return (
              <div
                key={h}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "8px 12px",
                  borderBottom: h < endHour ? `1px solid ${T.borderSoft}` : "none",
                  minHeight: 56,
                }}
              >
                <div
                  style={{
                    width: 52,
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.warmGray,
                    paddingTop: 4,
                    textAlign: lang === "ar" ? "left" : "right",
                  }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
                <div style={{ flex: 1, minWidth: 0 }} className="space-y-3">
                  {slotEvents.map((e, i) => (
                    <EventCard key={e.id} event={e} lang={lang} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── List view ───────────────────────────────────────── */
export function ListView({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const locale = lang === "ar" ? ar : enUS;
  const sorted = [...events].sort((a, b) => {
    const d = eventDateKey(a).localeCompare(eventDateKey(b));
    return d !== 0 ? d : eventTimeMinutes(a) - eventTimeMinutes(b);
  });

  if (sorted.length === 0) {
    return (
      <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 18 }}>
        <EmptyState label={t("pages.events.noResults")} />
      </div>
    );
  }

  // group by month label
  const groups: Array<{ key: string; label: string; items: Event[] }> = [];
  for (const e of sorted) {
    const d = parseISO(e.date);
    const key = format(d, "yyyy-MM");
    const label = format(d, "MMMM yyyy", { locale });
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label, items: [] };
      groups.push(g);
    }
    g.items.push(e);
  }

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {groups.map((g) => (
        <div key={g.key}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.warmGray,
              marginBottom: 10,
              textAlign: lang === "ar" ? "right" : "left",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {g.label}
          </div>
          <div className="space-y-3">
            {g.items.map((e, i) => (
              <EventCard key={e.id} event={e} lang={lang} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
