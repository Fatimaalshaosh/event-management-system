import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { useListCalendarEntries } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";

const T = palette;

export default function Calendar() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { data: entries, isLoading } = useListCalendarEntries();
  const locale = lang === "en" ? "en-AE" : "ar-AE";

  function typeConfig(type: string) {
    if (type === "event") return { label: t("pages.calendar.typeEvent"), color: T.mangrove, bg: T.mangrove + "15" };
    if (type === "visit") return { label: t("pages.calendar.typeVisit"), color: T.calmTeal, bg: T.calmTeal + "18" };
    return { label: t("pages.calendar.typeTask"), color: T.mediumWood, bg: T.mediumWood + "15" };
  }

  const grouped = entries?.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="text-end">
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.calendar.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {t("pages.calendar.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-52 ms-auto" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <CalendarDays size={40} className="mx-auto mb-4 opacity-15" />
            <p className="text-sm">{t("pages.calendar.empty")}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped && Object.entries(grouped).map(([date, dayEntries], gi) => (
              <motion.section
                key={date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-end gap-2 pb-2 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">{date}</h2>
                  <CalendarDays size={15} strokeWidth={1.5} style={{ color: T.mangrove }} />
                </div>

                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border, background: T.cardBg }}>
                  {dayEntries.map((entry, idx) => {
                    const tc = typeConfig(entry.type);
                    return (
                      <motion.div
                        key={entry.id}
                        className="flex items-center gap-5 px-6 py-4 hover:bg-muted/30 transition-colors"
                        style={{ borderBottom: idx < dayEntries.length - 1 ? `1px solid ${T.border}` : "none" }}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.06 + idx * 0.03 }}
                      >
                        <div
                          className="text-sm font-semibold min-w-[56px] text-center py-1 rounded-lg shrink-0"
                          style={{ background: T.border, color: T.castleHill }}
                          dir="ltr"
                        >
                          {entry.time}
                        </div>

                        <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: tc.color }} />

                        <div className="flex-1 text-end min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {lang === "en" ? (entry.title || entry.titleAr) : (entry.titleAr || entry.title)}
                          </p>
                          <div className="flex items-center justify-end gap-3 mt-0.5 text-xs text-muted-foreground">
                            {(entry.locationAr || entry.location) && (
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {lang === "en" ? (entry.location || entry.locationAr) : (entry.locationAr || entry.location)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {t("pages.calendar.duration")}
                            </span>
                          </div>
                        </div>

                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {tc.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
