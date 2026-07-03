import { palette } from "@/theme";
import { Layout } from "@/components/layout";
import { useListVisits } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, Search, Plus, Plane } from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useUrlSearchState } from "@/lib/url-search";
import { CountryFlag } from "@/components/reference/country-flag";

const T = palette;

function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, { text: string; bg: string; color: string }> = {
    confirmed: { text: t("status.confirmed"), bg: T.mangrove + "1A", color: T.mangrove },
    pending:   { text: t("status.pending"),   bg: T.sunset + "44",   color: T.mediumWood },
    completed: { text: t("status.completed"), bg: T.calmTeal + "1A", color: T.calmTeal },
  };
  const s = map[status.toLowerCase()] ?? { text: status, bg: T.border, color: T.warmGray };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
      {s.text}
    </span>
  );
}

export default function Visits() {
  const [search, setSearch] = useUrlSearchState("/visits");
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { data: visits, isLoading } = useListVisits();
  const locale = lang === "en" ? "en-AE" : "ar-AE";

  const filtered = visits?.filter(
    (v) =>
      v.guestName.toLowerCase().includes(search.toLowerCase()) ||
      v.guestNameAr?.includes(search) ||
      v.country.toLowerCase().includes(search.toLowerCase()) ||
      v.countryAr?.includes(search)
  );

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        <div className="flex items-start justify-between">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm mt-1"
            style={{ background: T.mangrove, color: "#fff" }}
          >
            {t("pages.visits.requestVisit")} <Plus size={15} strokeWidth={2} />
          </button>
          <div className="text-end">
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              {t("pages.visits.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t("pages.visits.subtitle")}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pages.visits.searchPh")}
            className="w-full h-11 rounded-2xl border border-border bg-card pe-12 ps-5 text-sm placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <motion.div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: T.border, background: T.cardBg }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {filtered?.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Flag size={36} className="mx-auto mb-3 opacity-15" />
                <p className="text-sm">{t("pages.visits.empty")}</p>
              </div>
            )}

            {filtered?.map((visit, idx) => (
              <motion.div
                key={visit.id}
                className="px-6 py-5 transition-colors hover:bg-muted/30"
                style={{ borderBottom: idx < (filtered.length - 1) ? `1px solid ${T.border}` : "none" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: T.calmTeal + "20", color: T.calmTeal }}
                    >
                      <Flag size={17} strokeWidth={1.5} />
                    </div>
                    <div className="text-end min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {lang === "en" ? (visit.guestName || visit.guestNameAr) : (visit.guestNameAr || visit.guestName)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ color: T.mangrove }}>
                        <CountryFlag value={visit.country} size={13} /> {lang === "en" ? (visit.country || visit.countryAr) : (visit.countryAr || visit.country)}
                      </p>
                      {(visit.purposeAr || visit.purpose) && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {lang === "en" ? (visit.purpose || visit.purposeAr) : (visit.purposeAr || visit.purpose)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <Plane size={12} strokeWidth={1.5} />
                      <span dir="ltr">
                        {new Date(visit.arrivalDate).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                        {visit.departureDate &&
                          ` — ${new Date(visit.departureDate).toLocaleDateString(locale, { day: "numeric", month: "short" })}`}
                      </span>
                    </div>
                    <StatusPill status={visit.status} />
                    <ChevronEnd size={15} className="text-muted-foreground/40" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
