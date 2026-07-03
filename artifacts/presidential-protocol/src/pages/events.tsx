import { Layout } from "@/components/layout";
import { useListEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useRegisterPageContext } from "@/ai/page-context";
import { ContextualCopilot } from "@/ai/contextual-copilot";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  T,
  type ViewMode,
  type Filters,
  type Lang,
  emptyFilters,
  matchesSearch,
  applyFilters,
  activeFilterCount,
  buildEventsSearch,
  parseEventsSearch,
  uniqueOptions,
  evCountry,
  evLocation,
  eventMonthKey,
} from "@/components/events/event-utils";
import {
  YearView,
  MonthView,
  WeekView,
  DayView,
  ListView,
} from "@/components/events/calendar-views";
import {
  PinnedSection,
  WatchedSection,
} from "@/components/events/events-sections";
import { ReportCenter } from "@/components/events/report-center";

const VIEWS: ViewMode[] = ["year", "month", "week", "day", "list"];
const STATUSES = ["upcoming", "confirmed", "planned", "completed", "cancelled"];
const TYPES = [
  "visitOfficial",
  "delegationReception",
  "nationalEvent",
  "protocolMeeting",
  "coordinationMeeting",
  "internalEvent",
];
const BANDS = ["high", "medium", "low"];
const PRIORITIES = ["urgent", "high", "medium", "low"];
const VIP_LEVELS = ["headOfState", "minister", "ambassador", "standard"];

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  allLabel: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 150 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: T.warmGray }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 38,
          borderRadius: 11,
          border: `1px solid ${value !== "all" ? T.mangrove + "66" : T.border}`,
          background: value !== "all" ? T.mangrove + "10" : T.cardBg,
          color: T.textPrimary,
          fontSize: 12.5,
          fontWeight: 600,
          padding: "0 12px",
          outline: "none",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        <option value="all">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Events() {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const language = lang as Lang;
  const locale = lang === "ar" ? ar : enUS;
  const { data: events, isLoading } = useListEvents();

  // Restore filters + search term from the URL query string so a refreshed or
  // shared link reopens the same pre-filtered view.
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const [initial] = useState(() => parseEventsSearch(searchString));

  const [view, setView] = useState<ViewMode>(initial.view);
  const [anchor, setAnchor] = useState<Date>(initial.anchor);
  const [search, setSearch] = useState(initial.search);
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [showFilters, setShowFilters] = useState(
    () => activeFilterCount(initial.filters) > 0,
  );
  const [showCancelled, setShowCancelled] = useState(initial.showCancelled);

  // Mirror active filters + search term + calendar view state (view mode,
  // anchored date, show-cancelled toggle) into the URL (replace, so we don't
  // pollute browser history on every keystroke, navigation or chip change).
  useEffect(() => {
    const qs = buildEventsSearch(filters, search, { view, anchor, showCancelled });
    setLocation(`/events${qs}`, { replace: true });
  }, [filters, search, view, anchor, showCancelled, setLocation]);

  const all = events ?? [];

  const active = useMemo(() => all.filter((e) => e.status !== "cancelled"), [all]);
  const cancelledCount = all.length - active.length;

  // Cancelled events are hidden by default. They become visible when the
  // officer toggles "Show cancelled" or explicitly filters by the cancelled
  // status. This base list feeds the calendar grid, pinned/watched sections
  // and the event counts so everything stays consistent.
  const includeCancelled = showCancelled || filters.status === "cancelled";
  const visible = useMemo(
    () => (includeCancelled ? all : active),
    [all, active, includeCancelled],
  );

  const filtered = useMemo(
    () => visible.filter((e) => matchesSearch(e, search) && applyFilters(e, filters)),
    [visible, search, filters],
  );

  const countryOptions = useMemo(
    () => uniqueOptions(all, (e) => e.country, (e) => evCountry(e, language)),
    [all, language],
  );
  const locationOptions = useMemo(
    () => uniqueOptions(all, (e) => e.location, (e) => evLocation(e, language)),
    [all, language],
  );

  /* ── AI page context ─────────────────────────────── */
  const now = new Date();
  useRegisterPageContext({
    page: "events",
    titleAr: "الفعاليات",
    titleEn: "Events",
    data: {
      totalEvents: all.length,
      upcoming: all.filter((e) => e.status === "upcoming").length,
      confirmed: all.filter((e) => e.status === "confirmed").length,
      cancelled: all.filter((e) => e.status === "cancelled").length,
      lowReadiness: active.filter((e) => e.readinessPercent < 40).length,
      highRisk: active.filter((e) => e.riskLevel === "high").length,
      urgent: active.filter((e) => e.priority === "urgent").length,
      thisMonth: active.filter((e) => eventMonthKey(e) === format(now, "yyyy-MM")).length,
    },
    suggestions: [
      { labelAr: t("ai.copilot.events.s1", { lng: "ar" }), labelEn: t("ai.copilot.events.s1", { lng: "en" }), prompt: t("ai.copilot.events.s1") },
      { labelAr: t("ai.copilot.events.s2", { lng: "ar" }), labelEn: t("ai.copilot.events.s2", { lng: "en" }), prompt: t("ai.copilot.events.s2") },
      { labelAr: t("ai.copilot.events.s3", { lng: "ar" }), labelEn: t("ai.copilot.events.s3", { lng: "en" }), prompt: t("ai.copilot.events.s3") },
      { labelAr: t("ai.copilot.events.s4", { lng: "ar" }), labelEn: t("ai.copilot.events.s4", { lng: "en" }), prompt: t("ai.copilot.events.s4") },
      { labelAr: t("ai.copilot.events.s5", { lng: "ar" }), labelEn: t("ai.copilot.events.s5", { lng: "en" }), prompt: t("ai.copilot.events.s5") },
    ],
  });

  /* ── Navigation ──────────────────────────────────── */
  function navigate(delta: number) {
    setAnchor((d) => {
      if (view === "year") return delta > 0 ? addYears(d, 1) : subYears(d, 1);
      if (view === "month") return delta > 0 ? addMonths(d, 1) : subMonths(d, 1);
      if (view === "week") return delta > 0 ? addWeeks(d, 1) : subWeeks(d, 1);
      if (view === "day") return delta > 0 ? addDays(d, 1) : subDays(d, 1);
      return d;
    });
  }

  function periodLabel(): string {
    if (view === "year") return format(anchor, "yyyy", { locale });
    if (view === "month") return format(anchor, "MMMM yyyy", { locale });
    if (view === "week") {
      const s = startOfWeek(anchor, { weekStartsOn: 0 });
      const e = endOfWeek(anchor, { weekStartsOn: 0 });
      return `${format(s, "d MMM", { locale })} – ${format(e, "d MMM yyyy", { locale })}`;
    }
    if (view === "day") return format(anchor, "EEEE, d MMMM yyyy", { locale });
    return t("pages.events.eventsCount", { count: filtered.length });
  }

  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;
  const activeCount = activeFilterCount(filters);
  const allLabel = t("pages.events.filters.all");

  const filterChips = useMemo(() => {
    const labelFor = (key: keyof Filters): string => {
      switch (key) {
        case "type":
          return t("pages.events.filters.type");
        case "status":
          return t("pages.events.filters.status");
        case "readiness":
          return t("pages.events.filters.readiness");
        case "priority":
          return t("pages.events.priority.label");
        case "vipLevel":
          return t("pages.events.vip.label");
        case "country":
          return t("pages.events.filters.country");
        case "location":
          return t("pages.events.filters.location");
      }
    };
    const valueFor = (key: keyof Filters, v: string): string => {
      switch (key) {
        case "type":
          return t(`pages.events.types.${v}`);
        case "status":
          return t(`status.${v}`);
        case "readiness":
          return t(`pages.events.readinessBands.${v}`);
        case "priority":
          return t(`pages.events.priority.${v}`);
        case "vipLevel":
          return t(`pages.events.vip.${v}`);
        case "country":
          return countryOptions.find((o) => o.value === v)?.label ?? v;
        case "location":
          return locationOptions.find((o) => o.value === v)?.label ?? v;
      }
    };
    const order: Array<keyof Filters> = [
      "type",
      "status",
      "readiness",
      "priority",
      "vipLevel",
      "country",
      "location",
    ];
    return order
      .filter((k) => filters[k] !== "all")
      .map((k) => ({ key: k, label: labelFor(k), value: valueFor(k, filters[k]) }));
  }, [filters, t, countryOptions, locationOptions]);

  return (
    <Layout>
      <div className="space-y-6 pb-12" dir={dir}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <Link href="/events/new">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-sm mt-1"
              style={{ background: T.mangrove, color: "#fff" }}
            >
              {t("pages.events.addEvent")} <Plus size={15} strokeWidth={2} />
            </button>
          </Link>
          <div style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
            <h1 className="text-3xl font-bold" style={{ color: T.textPrimary, fontFamily: "Georgia, serif" }}>
              {t("pages.events.title")}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: T.warmGray }}>
              {t("pages.events.subtitle")}
            </p>
          </div>
        </div>

        {/* AI Copilot */}
        <ContextualCopilot titleKey="ai.copilot.events.title" subtitleKey="ai.copilot.events.subtitle" />

        {/* Search + filter toggle (filters kept separate from calendar view controls) */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute end-4 top-1/2 -translate-y-1/2" size={16} strokeWidth={1.5} style={{ color: T.warmGray + "88" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pages.events.searchPh")}
              className="w-full h-11 rounded-2xl pe-12 ps-5 text-sm outline-none transition-all"
              style={{ border: `1px solid ${T.border}`, background: T.cardBg, color: T.textPrimary }}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-4 h-11 rounded-2xl text-sm font-semibold transition-colors shrink-0"
            style={{
              border: `1px solid ${activeCount ? T.mangrove + "66" : T.border}`,
              background: activeCount ? T.mangrove + "12" : T.cardBg,
              color: activeCount ? T.mangrove : T.textPrimary,
            }}
          >
            <SlidersHorizontal size={14} />
            {t("pages.events.filters.label")}
            {activeCount > 0 && (
              <span style={{ background: T.mangrove, color: "#fff", borderRadius: 999, fontSize: 9, padding: "1px 6px", fontWeight: 800 }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="flex flex-wrap items-end gap-3 p-4 rounded-2xl"
              style={{ background: T.cardBg, border: `1px solid ${T.border}` }}
            >
              <FilterSelect
                label={t("pages.events.filters.type")}
                value={filters.type}
                onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                options={TYPES.map((v) => ({ value: v, label: t(`pages.events.types.${v}`) }))}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.filters.status")}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                options={STATUSES.map((v) => ({ value: v, label: t(`status.${v}`) }))}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.filters.readiness")}
                value={filters.readiness}
                onChange={(v) => setFilters((f) => ({ ...f, readiness: v }))}
                options={BANDS.map((v) => ({ value: v, label: t(`pages.events.readinessBands.${v}`) }))}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.priority.label")}
                value={filters.priority}
                onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
                options={PRIORITIES.map((v) => ({ value: v, label: t(`pages.events.priority.${v}`) }))}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.vip.label")}
                value={filters.vipLevel}
                onChange={(v) => setFilters((f) => ({ ...f, vipLevel: v }))}
                options={VIP_LEVELS.map((v) => ({ value: v, label: t(`pages.events.vip.${v}`) }))}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.filters.country")}
                value={filters.country}
                onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
                options={countryOptions}
                allLabel={allLabel}
              />
              <FilterSelect
                label={t("pages.events.filters.location")}
                value={filters.location}
                onChange={(v) => setFilters((f) => ({ ...f, location: v }))}
                options={locationOptions}
                allLabel={allLabel}
              />
              {activeCount > 0 && (
                <button
                  onClick={() => setFilters(emptyFilters)}
                  className="flex items-center gap-1.5 px-3 h-[38px] rounded-xl text-xs font-semibold transition-colors"
                  style={{ border: `1px solid ${T.border}`, color: T.alert }}
                >
                  <X size={13} /> {t("pages.events.filters.clear")}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Active filter chips — remove one filter at a time */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" dir={dir}>
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilters((f) => ({ ...f, [chip.key]: "all" }))}
                className="flex items-center gap-1.5 ps-3 pe-2 h-8 rounded-full text-xs font-semibold transition-colors hover:shadow-sm"
                style={{
                  background: T.mangrove + "12",
                  border: `1px solid ${T.mangrove}44`,
                  color: T.mangrove,
                }}
                aria-label={`${t("pages.events.filters.remove")}: ${chip.label} – ${chip.value}`}
              >
                <span style={{ color: T.warmGray, fontWeight: 600 }}>{chip.label}:</span>
                <span>{chip.value}</span>
                <X size={13} />
              </button>
            ))}
            {filterChips.length > 1 && (
              <button
                onClick={() => setFilters(emptyFilters)}
                className="flex items-center gap-1 px-3 h-8 rounded-full text-xs font-semibold transition-colors"
                style={{ border: `1px solid ${T.border}`, color: T.alert }}
              >
                <X size={12} /> {t("pages.events.filters.clearAll")}
              </button>
            )}
          </div>
        )}

        {/* Favorite Events — pinned at the top, always visible (shows empty state) */}
        {!isLoading && <PinnedSection events={visible} lang={language} />}

        {/* Upcoming / Featured Events — visible regardless of filters */}
        {!isLoading && visible.some((e) => e.watched) && (
          <WatchedSection events={visible} lang={language} />
        )}

        {/* Calendar Header Controls — one clean row directly above the grid */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pt-4"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          {/* Month title + view switcher (right side in RTL) */}
          <div className="flex items-center gap-4 flex-wrap">
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: T.textPrimary,
                fontFamily: "Georgia, serif",
                whiteSpace: "nowrap",
              }}
            >
              {periodLabel()}
            </span>
            <div
              className="flex items-center p-1 rounded-xl"
              style={{ background: T.sunset + "33", border: `1px solid ${T.border}` }}
            >
              {VIEWS.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: view === v ? T.mangrove : "transparent",
                    color: view === v ? "#fff" : T.warmGray,
                    boxShadow: view === v ? "0 1px 3px rgba(61,53,41,0.18)" : "none",
                  }}
                >
                  {t(`pages.events.views.${v}`)}
                </button>
              ))}
            </div>

            {/* Show / hide cancelled events toggle */}
            {cancelledCount > 0 && (
              <button
                onClick={() => setShowCancelled((v) => !v)}
                disabled={filters.status === "cancelled"}
                title={
                  filters.status === "cancelled"
                    ? t("pages.events.showCancelled")
                    : undefined
                }
                className="flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  border: `1px solid ${includeCancelled ? T.mangrove + "66" : T.border}`,
                  background: includeCancelled ? T.mangrove + "12" : T.cardBg,
                  color: includeCancelled ? T.mangrove : T.warmGray,
                  cursor: filters.status === "cancelled" ? "default" : "pointer",
                  opacity: filters.status === "cancelled" ? 0.7 : 1,
                }}
              >
                {includeCancelled ? <EyeOff size={13} /> : <Eye size={13} />}
                {includeCancelled
                  ? t("pages.events.hideCancelled")
                  : t("pages.events.cancelledHidden", { count: cancelledCount })}
              </button>
            )}
          </div>

          {/* Navigation arrows + today (left side in RTL) */}
          {view !== "list" && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 12, color: T.warmGray, whiteSpace: "nowrap" }}>
                {t("pages.events.eventsCount", { count: filtered.length })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                  style={{ border: `1px solid ${T.border}`, color: T.textPrimary }}
                >
                  <Prev size={15} />
                </button>
                <button
                  onClick={() => setAnchor(new Date())}
                  className="px-3 h-8 rounded-lg text-xs font-semibold transition-colors hover:bg-black/5"
                  style={{ border: `1px solid ${T.border}`, color: T.textPrimary }}
                >
                  {t("pages.events.today")}
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                  style={{ border: `1px solid ${T.border}`, color: T.textPrimary }}
                >
                  <Next size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {view === "year" && (
              <YearView events={filtered} lang={language} year={anchor} onSelectMonth={(d) => { setAnchor(d); setView("month"); }} />
            )}
            {view === "month" && (
              <MonthView events={filtered} lang={language} month={anchor} onSelectDay={(d) => { setAnchor(d); setView("day"); }} />
            )}
            {view === "week" && (
              <WeekView events={filtered} lang={language} weekDate={anchor} onSelectDay={(d) => { setAnchor(d); setView("day"); }} />
            )}
            {view === "day" && <DayView events={filtered} lang={language} day={anchor} />}
            {view === "list" && <ListView events={filtered} lang={language} />}
          </motion.div>
        )}

        {/* Report Export Center */}
        {!isLoading && <ReportCenter events={all} lang={language} />}
      </div>
    </Layout>
  );
}
