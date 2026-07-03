import type { Event } from "@workspace/api-client-react";
import { CountryFlag } from "@/components/reference/country-flag";
import {
  useUpdateEvent,
  getListEventsQueryKey,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { MapPin, Clock, ChevronLeft, ChevronRight, Star, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  T,
  type Lang,
  evName,
  evLocation,
  evCountry,
  parseEventDate,
  eventId,
  statusMeta,
  priorityColor,
  eventTypeMeta,
  vipMeta,
  readinessColor,
  eventBudgetSnapshot,
  budgetStatusColor,
} from "./event-utils";

/** Optimistic pin/watch toggle controls. Stops navigation when clicked. */
export function PinWatchControls({
  event,
  size = 30,
}: {
  event: Event;
  size?: number;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const update = useUpdateEvent();
  const listKey = getListEventsQueryKey();

  function patch(data: { pinned?: boolean; watched?: boolean }) {
    const prev = qc.getQueryData<Event[]>(listKey);
    if (prev) {
      qc.setQueryData<Event[]>(
        listKey,
        prev.map((e) => (e.id === event.id ? { ...e, ...data } : e)),
      );
    }
    update.mutate(
      { id: event.id, data },
      {
        onError: () => {
          if (prev) qc.setQueryData<Event[]>(listKey, prev);
        },
        onSettled: () => {
          qc.invalidateQueries({ queryKey: listKey });
        },
      },
    );
  }

  function togglePin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !event.pinned;
    patch({ pinned: next });
    toast({ title: t(next ? "dashboard.toasts.pinned" : "dashboard.toasts.unpinned") });
  }

  function toggleWatch(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !event.watched;
    patch({ watched: next });
    toast({ title: t(next ? "dashboard.toasts.watching" : "dashboard.toasts.unwatched") });
  }

  const btn = (active: boolean, accent: string): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${active ? accent + "88" : T.border}`,
    background: active ? accent + "1A" : T.cardBg,
    color: active ? accent : T.warmGray,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={togglePin}
        title={t(event.pinned ? "pages.events.unpin" : "pages.events.pin")}
        aria-label={t(event.pinned ? "pages.events.unpin" : "pages.events.pin")}
        style={btn(!!event.pinned, T.gold)}
      >
        <Star size={15} strokeWidth={1.8} fill={event.pinned ? T.gold : "none"} />
      </button>
      <button
        type="button"
        onClick={toggleWatch}
        title={t(event.watched ? "pages.events.unwatch" : "pages.events.watch")}
        aria-label={t(event.watched ? "pages.events.unwatch" : "pages.events.watch")}
        style={btn(!!event.watched, T.calmTeal)}
      >
        <Eye size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}

/**
 * Prominent pin/favorite toggle for the Event Details page.
 * Updates BOTH the list cache (Events page, dashboard widget, favorites section)
 * and the single-event cache (this page) optimistically for instant, refresh-free sync.
 */
export function EventFavoriteButton({ event }: { event: Event }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const update = useUpdateEvent();
  const listKey = getListEventsQueryKey();
  const detailKey = getGetEventQueryKey(event.id);
  const pinned = !!event.pinned;

  async function toggle() {
    const current = qc.getQueryData<Event>(detailKey)?.pinned ?? pinned;
    const next = !current;
    await Promise.all([
      qc.cancelQueries({ queryKey: detailKey }),
      qc.cancelQueries({ queryKey: listKey }),
    ]);
    const prevList = qc.getQueryData<Event[]>(listKey);
    if (prevList) {
      qc.setQueryData<Event[]>(
        listKey,
        prevList.map((e) => (e.id === event.id ? { ...e, pinned: next } : e)),
      );
    }
    const prevDetail = qc.getQueryData<Event>(detailKey);
    if (prevDetail) {
      qc.setQueryData<Event>(detailKey, { ...prevDetail, pinned: next });
    }
    update.mutate(
      { id: event.id, data: { pinned: next } },
      {
        onError: () => {
          if (prevList) qc.setQueryData(listKey, prevList);
          if (prevDetail) qc.setQueryData(detailKey, prevDetail);
        },
        onSettled: () => {
          qc.invalidateQueries({ queryKey: listKey });
          qc.invalidateQueries({ queryKey: detailKey });
        },
      },
    );
    toast({
      title: t(next ? "dashboard.toasts.pinned" : "dashboard.toasts.unpinned"),
    });
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={update.isPending}
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-sm disabled:opacity-60 disabled:pointer-events-none"
      style={{
        border: `1px solid ${pinned ? T.gold : T.border}`,
        background: pinned ? T.gold + "1A" : T.cardBg,
        color: pinned ? T.gold : T.castleHill,
      }}
      title={t(pinned ? "pages.eventDetail.pinnedState" : "pages.eventDetail.pinEvent")}
      aria-pressed={pinned}
    >
      {t(pinned ? "pages.eventDetail.pinnedState" : "pages.eventDetail.pinEvent")}
      <motion.span
        key={pinned ? "on" : "off"}
        initial={{ scale: 0.4, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 12 }}
        style={{ display: "inline-flex" }}
      >
        <Star size={15} strokeWidth={1.9} fill={pinned ? T.gold : "none"} />
      </motion.span>
    </motion.button>
  );
}

function ReadinessRing({ pct, size = 44 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = readinessColor(pct);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color,
        }}
      >
        {pct}
      </span>
    </div>
  );
}

/** Full luxury event card — used in List and Day views. */
export function EventCard({ event, lang, index = 0 }: { event: Event; lang: Lang; index?: number }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? ar : enUS;
  const date = parseEventDate(event);
  const st = statusMeta(event.status);
  const { Icon: TypeIcon, color: typeColor } = eventTypeMeta(event.eventType);
  const { Icon: VipIcon, color: vipColor } = vipMeta(event.vipLevel);
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;
  const country = evCountry(event, lang);
  const budget = eventBudgetSnapshot(event);

  return (
    <Link href={`/events/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.04, 0.3) }}
        whileHover={{ y: -2 }}
        dir={dir}
        className="group cursor-pointer"
        style={{
          background: T.cardBg,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 1px 3px rgba(61,53,41,0.04)",
          transition: "box-shadow 0.2s, border-color 0.2s",
          display: "flex",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Accent rail by priority */}
        <div style={{ width: 3, borderRadius: 3, background: priorityColor(event.priority), flexShrink: 0 }} />

        {/* Type icon */}
        <div
          className="shrink-0"
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: typeColor + "18",
            color: typeColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TypeIcon size={20} strokeWidth={1.6} />
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
          <div className="flex items-center gap-2" style={{ justifyContent: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.warmGray, letterSpacing: 0.4 }}>
              {eventId(event)}
            </span>
            <span style={{ fontSize: 10, color: T.warmGray }}>·</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: typeColor }}>
              {t(`pages.events.types.${event.eventType ?? "internalEvent"}`)}
            </span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {evName(event, lang)}
          </p>
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
            style={{ marginTop: 8, fontSize: 12, color: T.warmGray }}
          >
            <span className="flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.6} />
              {format(date, "d MMM yyyy", { locale })}
              {event.time ? ` · ${event.time}` : ` · ${t("pages.events.allDay")}`}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={1.6} />
              {evLocation(event, lang)}
            </span>
            {country && (
              <span className="flex items-center gap-1.5">
                <VipIcon size={12} strokeWidth={1.6} style={{ color: vipColor }} />
                <CountryFlag value={event.country} size={13} /> {country} · {t(`pages.events.vip.${event.vipLevel ?? "standard"}`)}
              </span>
            )}
          </div>
        </div>

        {/* Right: readiness + status + budget */}
        <div className="flex flex-col items-center justify-between shrink-0" style={{ gap: 8 }}>
          <ReadinessRing pct={event.readinessPercent} />
          <div className="flex flex-col items-center" style={{ gap: 6 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                background: st.bg,
                color: st.color,
              }}
            >
              {t(`status.${event.status}`)}
            </span>
            {budget && (
              <span
                className="flex items-center gap-1"
                title={t(
                  budget.status === "over"
                    ? "pages.events.budgetChip.overTitle"
                    : "pages.events.budgetChip.warningTitle",
                )}
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  background: budgetStatusColor(budget.status) + "1C",
                  color: budgetStatusColor(budget.status),
                  border: `1px solid ${budgetStatusColor(budget.status)}38`,
                }}
              >
                <AlertTriangle size={10} strokeWidth={2} />
                {budget.status === "over"
                  ? t("pages.events.budgetChip.over", { percent: budget.overByPercent })
                  : t("pages.events.budgetChip.warning", { percent: budget.spentPercent })}
              </span>
            )}
          </div>
        </div>

        {/* Pin / Watch + chevron */}
        <div className="flex flex-col items-center justify-between shrink-0" style={{ gap: 8 }}>
          <PinWatchControls event={event} />
          <div style={{ color: T.warmGray + "88" }}>
            <Chevron size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/** Mini card with readiness + location — used inside Week view columns. */
export function EventMiniCard({ event, lang }: { event: Event; lang: Lang }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const { color: typeColor } = eventTypeMeta(event.eventType);
  const rColor = readinessColor(event.readinessPercent);
  return (
    <Link href={`/events/${event.id}`}>
      <div
        dir={dir}
        className="cursor-pointer hover:shadow-sm transition-shadow"
        style={{
          background: typeColor + "12",
          borderInlineStart: `2.5px solid ${typeColor}`,
          borderRadius: 9,
          padding: "6px 8px",
          marginBottom: 5,
          textAlign: dir === "rtl" ? "right" : "left",
        }}
        title={evName(event, lang)}
      >
        <div className="flex items-center justify-between gap-1" style={{ marginBottom: 3 }}>
          {event.time && (
            <span style={{ fontSize: 9, fontWeight: 700, color: typeColor }}>{event.time}</span>
          )}
          <span style={{ fontSize: 9, fontWeight: 800, color: rColor }}>{event.readinessPercent}%</span>
        </div>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: T.textPrimary,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evName(event, lang)}
        </p>
        <div className="flex items-center gap-1" style={{ marginTop: 3, fontSize: 9, color: T.warmGray }}>
          <MapPin size={9} strokeWidth={1.8} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {evLocation(event, lang)}
          </span>
        </div>
        <div style={{ height: 2.5, borderRadius: 3, background: T.border, marginTop: 4, overflow: "hidden" }}>
          <div style={{ width: `${event.readinessPercent}%`, height: "100%", background: rColor }} />
        </div>
      </div>
    </Link>
  );
}

/** Compact pill — used inside Month calendar cells. */
export function EventPill({ event, lang }: { event: Event; lang: Lang }) {
  const { color: typeColor } = eventTypeMeta(event.eventType);
  return (
    <Link href={`/events/${event.id}`}>
      <div
        className="cursor-pointer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 7px",
          borderRadius: 7,
          background: typeColor + "16",
          borderInlineStart: `2px solid ${typeColor}`,
          marginBottom: 3,
          overflow: "hidden",
        }}
        title={evName(event, lang)}
      >
        {event.time && (
          <span style={{ fontSize: 9, fontWeight: 700, color: typeColor, flexShrink: 0 }}>
            {event.time}
          </span>
        )}
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: T.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {evName(event, lang)}
        </span>
      </div>
    </Link>
  );
}
