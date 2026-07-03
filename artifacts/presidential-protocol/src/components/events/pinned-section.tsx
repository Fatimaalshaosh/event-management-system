import type { Event } from "@workspace/api-client-react";
import {
  useUpdateEvent,
  getListEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Star, ChevronUp, ChevronDown, CalendarDays, MapPin } from "lucide-react";
import { T, type Lang, evName, evLocation, eventId, parseEventDate, statusMeta, readinessColor, colorTagColor, COLOR_TAGS, pinnedSort } from "./event-utils";
import { PinWatchControls } from "./event-card";
import { SectionHeader } from "@/components/events/section-header";

/* Extracted from events-sections.tsx — favorites/pinned section. */
export function PinnedSection({ events, lang }: { events: Event[]; lang: Lang }) {
  const { t } = useTranslation();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const qc = useQueryClient();
  const update = useUpdateEvent();
  const listKey = getListEventsQueryKey();

  const pinned = events.filter((e) => e.pinned).slice().sort(pinnedSort);

  function reorder(from: number, to: number) {
    if (to < 0 || to >= pinned.length) return;
    const arr = pinned.slice();
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    const orderMap = new Map(arr.map((e, i) => [e.id, i + 1]));
    const prev = qc.getQueryData<Event[]>(listKey);
    if (prev) {
      qc.setQueryData<Event[]>(
        listKey,
        prev.map((e) =>
          orderMap.has(e.id) ? { ...e, pinOrder: orderMap.get(e.id)! } : e,
        ),
      );
    }
    arr.forEach((e, i) => {
      if ((e.pinOrder ?? 0) !== i + 1) {
        update.mutate({ id: e.id, data: { pinOrder: i + 1 } });
      }
    });
  }

  function setColor(ev: Event, tag: string | null) {
    const next = ev.colorTag === tag ? null : tag;
    const prev = qc.getQueryData<Event[]>(listKey);
    if (prev) {
      qc.setQueryData<Event[]>(
        listKey,
        prev.map((e) => (e.id === ev.id ? { ...e, colorTag: next } : e)),
      );
    }
    update.mutate(
      { id: ev.id, data: { colorTag: next } },
      { onSettled: () => qc.invalidateQueries({ queryKey: listKey }) },
    );
  }

  return (
    <section
      className="space-y-4 p-5 rounded-2xl"
      style={{ background: T.gold + "0D", border: `1px solid ${T.gold}33` }}
      dir={dir}
    >
      <SectionHeader
        Icon={Star}
        accent={T.gold}
        title={t("pages.events.pinnedSection.title")}
        subtitle={t("pages.events.pinnedSection.subtitle")}
        count={pinned.length}
        dir={dir}
      />

      {pinned.length === 0 ? (
        <p style={{ fontSize: 13, color: T.warmGray, textAlign: dir === "rtl" ? "right" : "left" }}>
          {t("pages.events.pinnedSection.empty")}
        </p>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {pinned.map((ev, i) => {
            const railColor = colorTagColor(ev.colorTag) ?? T.gold;
            const rColor = readinessColor(ev.readinessPercent);
            const st = statusMeta(ev.status);
            const locale = lang === "ar" ? ar : enUS;
            return (
              <div
                key={ev.id}
                className="flex flex-col"
                style={{
                  background: "linear-gradient(160deg, #FCF7EE 0%, #F7ECDC 100%)",
                  border: `1px solid ${T.gold}40`,
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 6px 18px rgba(173,137,101,0.14)",
                }}
              >
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <div style={{ width: 4, background: railColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, padding: 12 }}>
                    <div
                      className="flex items-center gap-2"
                      style={{ justifyContent: "space-between" }}
                    >
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: T.warmGray }}>
                        {eventId(ev)}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: rColor }}>
                        {ev.readinessPercent}%
                      </span>
                    </div>
                    <Link href={`/events/${ev.id}`}>
                      <p
                        className="cursor-pointer hover:underline"
                        style={{
                          fontSize: 13.5,
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
                    <div className="flex flex-col gap-1" style={{ marginTop: 7 }}>
                      <span
                        className="flex items-center gap-1.5"
                        style={{ fontSize: 11, color: T.warmGray, flexDirection: dir === "rtl" ? "row-reverse" : "row", justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}
                      >
                        <CalendarDays size={11} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                        {format(parseEventDate(ev), "d MMM yyyy", { locale })}
                        {ev.time ? ` · ${ev.time}` : ""}
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        style={{ fontSize: 11, color: T.warmGray, flexDirection: dir === "rtl" ? "row-reverse" : "row", justifyContent: dir === "rtl" ? "flex-end" : "flex-start", minWidth: 0 }}
                      >
                        <MapPin size={11} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {evLocation(ev, lang)}
                        </span>
                      </span>
                      <span
                        style={{
                          alignSelf: dir === "rtl" ? "flex-end" : "flex-start",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 9px",
                          borderRadius: 999,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {t(`status.${ev.status}`)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 3,
                        background: T.border,
                        marginTop: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ width: `${ev.readinessPercent}%`, height: "100%", background: rColor }} />
                    </div>
                  </div>
                </div>

                {/* Controls row */}
                <div
                  className="flex items-center justify-between gap-2"
                  style={{ padding: "8px 12px", borderTop: `1px solid ${T.borderSoft}` }}
                >
                  {/* Color swatches */}
                  <div className="flex items-center gap-1.5">
                    {COLOR_TAGS.map((tag) => {
                      const c = colorTagColor(tag)!;
                      const active = ev.colorTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setColor(ev, tag)}
                          title={t(`pages.events.colorTag.${tag}`)}
                          aria-label={t(`pages.events.colorTag.${tag}`)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            background: c,
                            border: active ? `2px solid ${T.textPrimary}` : `2px solid transparent`,
                            boxShadow: active ? `0 0 0 1px ${c}` : "none",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Reorder + pin/watch */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => reorder(i, i - 1)}
                      disabled={i === 0}
                      title={t("pages.events.pinnedSection.reorderHint")}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        border: `1px solid ${T.border}`,
                        background: T.cardBg,
                        color: i === 0 ? T.warmGray + "55" : T.warmGray,
                        cursor: i === 0 ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(i, i + 1)}
                      disabled={i === pinned.length - 1}
                      title={t("pages.events.pinnedSection.reorderHint")}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        border: `1px solid ${T.border}`,
                        background: T.cardBg,
                        color: i === pinned.length - 1 ? T.warmGray + "55" : T.warmGray,
                        cursor: i === pinned.length - 1 ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronDown size={13} />
                    </button>
                    <PinWatchControls event={ev} size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
