
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/i18n/language-context";










import { C, SubKey, SUB_TABS } from "@/components/event-command/flights/shared";
import {
  DashboardView, SearchView, BookingsView, GuestsView,
} from "@/components/event-command/flights/views";

export function FlightsTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const [sub, setSub] = useState<SubKey>("dashboard");

  return (
    <div className="space-y-6" dir={dir}>
      <div className="text-end">
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
          {t("pages.commandCenter.flights.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("pages.commandCenter.flights.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b justify-end" style={{ borderColor: C.border }}>
        {SUB_TABS.map(({ key, icon: Icon }) => {
          const active = sub === key;
          return (
            <button
              key={key}
              onClick={() => setSub(key)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{ color: active ? C.mangrove : C.warmGray }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {t(`pages.commandCenter.flights.sub.${key}`)}
              {active && <span className="absolute bottom-0 start-0 end-0 h-0.5 rounded-full" style={{ background: C.mangrove }} />}
            </button>
          );
        })}
      </div>

      {sub === "dashboard" && <DashboardView eventId={eventId} />}
      {sub === "search" && <SearchView eventId={eventId} onBooked={() => setSub("bookings")} />}
      {sub === "bookings" && <BookingsView eventId={eventId} />}
      {sub === "guests" && <GuestsView eventId={eventId} />}
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

