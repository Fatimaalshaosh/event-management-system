import { AiAssistantCard } from "@/components/dashboard/ai-assistant-card";


import { Layout } from "@/components/layout";
import {
  useGetDashboardSummary,
  useListEvents,
  useListVisits,
  useListApprovals,
  useGetEventReadiness,
  getGetEventReadinessQueryKey,
  useListTasks,
  useListReports,
  useCreateReport,
  useGetUserPreferences,
  useUpdateUserPreferences,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Flag, Activity, CheckSquare, MapPin, FileText, FileSpreadsheet, Download, Check, X, Sun, Landmark, Users, Plus, ListChecks, Clock } from "lucide-react";
import { ArrowUpEnd } from "@/components/dir-icon";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useUpdateApproval } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useRegisterPageContext } from "@/ai/page-context";

import { TopPinnedWidget, SmartMonitoringWidget } from "@/components/events/dashboard-widgets";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getGetUserPreferencesQueryKey } from "@workspace/api-client-react";
import { getOwnerKey } from "@/components/dashboard/owner-key";
import { C, CircularRing, LiveDot, SectionCard } from "@/components/dashboard/primitives";
import { useDashboardLayout } from "@/components/dashboard/use-dashboard-layout";
import { CustomizableGrid } from "@/components/dashboard/customizable-grid";
import { ProfileBar } from "@/components/dashboard/profile-bar";
import { CustomizePanel } from "@/components/dashboard/customize-panel";
import type { WidgetId } from "@/components/dashboard/widget-meta";
import { RecentReportsWidget } from "@/components/dashboard/widgets/recent-reports";
import { WatchedEventsWidget } from "@/components/dashboard/widgets/watched-events";
import { WeeklySummaryWidget } from "@/components/dashboard/widgets/weekly-summary";
import { ActiveRisksWidget } from "@/components/dashboard/widgets/active-risks";
import { KpiCard, ExecStatusBar, WeekDayEvent, WeekDayItem, WeekCalendar, LogisticsOverviewBand, BudgetAlertBand } from "@/components/dashboard/sections";

export default function Dashboard() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const locale = lang === "en" ? "en-AE" : "ar-AE";
  const queryClient = useQueryClient();
  const ownerKey = useMemo(() => getOwnerKey(), []);
  const { data: preferences } = useGetUserPreferences({ ownerKey });
  const updatePreferences = useUpdateUserPreferences();
  const budgetThreshold = preferences?.budgetThreshold ?? 90;
  const setBudgetThreshold = useCallback(
    (value: number) => {
      const next = Math.min(100, Math.max(50, Math.round(value)));
      queryClient.setQueryData(getGetUserPreferencesQueryKey({ ownerKey }), {
        ownerKey,
        budgetThreshold: next,
      });
      updatePreferences.mutate({ data: { ownerKey, budgetThreshold: next } });
    },
    [ownerKey, queryClient, updatePreferences],
  );
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({
    budgetThreshold,
  });
  const { data: events, isLoading: eventsLoading }   = useListEvents();
  const { data: visits, isLoading: visitsLoading }   = useListVisits();
  const { data: approvals }                          = useListApprovals();
  const { data: tasks }                              = useListTasks();
  const { data: reports, isLoading: reportsLoading } = useListReports();
  const createReport = useCreateReport();
  const updateApproval = useUpdateApproval();
  const { toast } = useToast();

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const layout = useDashboardLayout(lang);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (layout.locked && editMode) setEditMode(false);
  }, [layout.locked, editMode]);

  useRegisterPageContext({
    page: "dashboard",
    titleAr: "مركز الذكاء التنفيذي",
    titleEn: "Executive Intelligence Center",
    data: {
      totalEvents: events?.length ?? 0,
      totalVisits: visits?.length ?? 0,
      pendingApprovals: approvals?.filter((a) => a.status === "pending").length ?? 0,
      summary,
    },
  });

  const featuredEvent = events?.[0];
  const { data: readiness } = useGetEventReadiness(featuredEvent?.id ?? 0, {
    query: { enabled: !!featuredEvent?.id, queryKey: getGetEventReadinessQueryKey(featuredEvent?.id ?? 0) },
  });

  const pendingApprovals = approvals?.filter((a) => a.status === "pending") ?? [];

  const handleApproval = (id: number, status: "approved" | "rejected") => {
    updateApproval.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: t("dashboard.toasts.updated"),
            description: status === "approved" ? t("dashboard.toasts.approvedDesc") : t("dashboard.toasts.rejectedDesc"),
          });
          queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
        },
      }
    );
  };

  const handleExport = (name: string, nameAr: string, type: string, format: string) => {
    createReport.mutate(
      { data: { name, nameAr, type, format } },
      {
        onSuccess: () => {
          toast({ title: t("dashboard.toasts.reportCreated"), description: name });
          queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
        },
      },
    );
  };

  const ringColors = [C.mangrove, C.calmTeal, C.mediumWood, C.mangrove, "#E8A838", "#DC2626"];
  const catNameMap: Record<string, string> = {
    protocol: t("dashboard.categories.protocol"),
    security: t("dashboard.categories.security"),
    transport: t("dashboard.categories.transport"),
    hospitality: t("dashboard.categories.hospitality"),
    invitations: t("dashboard.categories.invitations"),
    media: t("dashboard.categories.media"),
  };

  /* Rolling 7-day operational window starting today — keeps the calendar alive with upcoming activity */
  const weekDays: WeekDayItem[] = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      return {
        date: d, dateStr,
        events: [
          ...(events ?? [])
            .filter((e) => e.date?.slice(0, 10) === dateStr)
            .map<WeekDayEvent>((e) => ({
              id: e.id,
              title: (lang === "en" ? (e.name || e.nameAr) : (e.nameAr || e.name)) ?? "",
              kind: "event",
              time: e.time ?? undefined,
              location: (lang === "en" ? (e.location || e.locationAr) : (e.locationAr || e.location)) ?? "",
              readiness: e.readinessPercent,
              href: `/events/${e.id}`,
            })),
          ...(visits ?? [])
            .filter((v) => v.arrivalDate?.slice(0, 10) === dateStr)
            .map<WeekDayEvent>((v) => ({
              id: v.id,
              title: (lang === "en" ? (v.guestName || v.guestNameAr) : (v.guestNameAr || v.guestName)) ?? "",
              kind: "visit",
              location: (lang === "en" ? (v.country || v.countryAr) : (v.countryAr || v.country)) ?? "",
              href: `/visits`,
            })),
        ],
      };
    });
  })();

  const today = new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const priorityColor: Record<string, string> = { high: "#C0623D", medium: C.mediumWood, low: C.calmTeal };

  const nodes: Partial<Record<WidgetId, React.ReactNode>> = {
    /* EVENT READINESS TRACKER */
    readinessTracker: (
      <SectionCard title={t("dashboard.sections.eventReadiness")} linkHref={featuredEvent ? `/events/${featuredEvent.id}` : "/events"} linkLabel={t("dashboard.sections.details")} accent={C.mangrove}>
        {eventsLoading || !featuredEvent ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-[72px] h-[72px] rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <LiveDot color={C.mangrove} />
                <span style={{ fontSize: 10, color: C.mangrove, fontWeight: 700 }}>{t("ai.live")}</span>
              </div>
              <p className="text-xs text-end" style={{ color: C.warmGray }}>
                {lang === "en" ? (featuredEvent.name || featuredEvent.nameAr) : (featuredEvent.nameAr || featuredEvent.name)} — {new Date(featuredEvent.date).toLocaleDateString(locale)}
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {readiness?.categories.map((cat, i) => (
                <CircularRing
                  key={cat.name}
                  pct={cat.percent ?? 0}
                  color={ringColors[i % ringColors.length]}
                  label={catNameMap[cat.name] ?? cat.nameAr ?? cat.name}
                  sublabel={t(`status.${cat.status}`, cat.status)}
                />
              ))}
            </div>
            <div className="mt-6 pt-5 border-t" style={{ borderColor: C.border }}>
              <div className="flex items-center justify-between mb-2.5 text-sm">
                <span className="font-bold text-lg" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>
                  {featuredEvent.readinessPercent}%
                </span>
                <span className="font-semibold" style={{ color: C.castleHill }}>{t("dashboard.sections.totalReadiness")}</span>
              </div>
              <div className="h-2.5 w-full rounded-full" style={{ background: C.border }}>
                <motion.div
                  className="h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${featuredEvent.readinessPercent}%` }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ background: `linear-gradient(to left, ${C.mangrove}, ${C.calmTeal})`, boxShadow: `0 0 8px ${C.mangrove}44` }}
                />
              </div>
            </div>
          </>
        )}
      </SectionCard>
    ),

    /* WEEKLY SUMMARY */
    weeklySummary: <WeeklySummaryWidget events={events ?? []} visits={visits ?? []} approvals={approvals ?? []} lang={lang} />,

    /* UPCOMING EVENTS */
    upcomingEvents: (
      <SectionCard title={t("dashboard.sections.upcomingEvents")} linkHref="/events" accent={C.calmTeal}>
        {eventsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2.5">
            {events?.slice(0, 4).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <motion.div
                  whileHover={{ x: -2, boxShadow: "0 4px 16px rgba(61,53,41,0.10)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="flex items-center justify-between p-4 rounded-2xl cursor-pointer"
                  style={{ border: `1px solid ${C.border}`, background: C.pageBg }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.mangrove}18`, color: C.mangrove }}>
                      <ArrowUpEnd size={15} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: C.mangrove, fontFamily: "Georgia, serif" }}>{event.readinessPercent}%</div>
                      <div className="h-1.5 w-16 rounded-full mt-1" style={{ background: C.border }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${event.readinessPercent}%`, background: C.mangrove }} />
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: C.warmGray }}>
                        {new Date(event.date).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </div>
                  <div className="text-end min-w-0 flex-1 mx-4">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={event.status === "confirmed" ? { background: `${C.mangrove}18`, color: C.mangrove } : { background: `${C.sunset}55`, color: C.mediumWood }}>
                        {event.status === "confirmed" ? t("status.confirmed") : t("status.draft")}
                      </span>
                      <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
                        {lang === "en" ? (event.name || event.nameAr) : (event.nameAr || event.name)}
                      </p>
                    </div>
                    <p className="text-xs flex items-center justify-end gap-1" style={{ color: C.warmGray }}>
                      <MapPin size={11} /> {lang === "en" ? (event.location || event.locationAr) : (event.locationAr || event.location)}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    ),

    /* OFFICIAL VISITS */
    officialVisits: (
      <SectionCard title={t("dashboard.sections.officialVisits")} linkHref="/visits" accent={C.castleHill}>
        {visitsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : (
          <div>
            {visits?.slice(0, 4).map((visit) => (
              <div key={visit.id} className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: C.border }}>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={visit.status === "confirmed" ? { background: `${C.mangrove}18`, color: C.mangrove } : { background: `${C.sunset}44`, color: C.mediumWood }}>
                  {visit.status === "confirmed" ? t("status.confirmed") : visit.status === "completed" ? t("status.completed") : t("status.pending")}
                </span>
                <div className="text-end flex-1 mx-4">
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{lang === "en" ? (visit.guestName || visit.guestNameAr) : (visit.guestNameAr || visit.guestName)}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>
                    {lang === "en" ? (visit.country || visit.countryAr) : (visit.countryAr || visit.country)} · {new Date(visit.arrivalDate).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.calmTeal}18`, color: C.calmTeal }}>
                  <Flag size={16} strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    ),

    /* UPCOMING TASKS */
    upcomingTasks: (
      <SectionCard title={t("dashboard.sections.upcomingTasks")} linkHref="/tasks" accent={C.mangrove}>
        {(() => {
          const open = (tasks ?? [])
            .filter((tk) => tk.status !== "completed")
            .sort((a, b) => {
              const da = a.dueDate ? +new Date(a.dueDate) : Infinity;
              const db = b.dueDate ? +new Date(b.dueDate) : Infinity;
              return da - db;
            })
            .slice(0, 5);
          if (open.length === 0)
            return (
              <div className="text-center py-6" style={{ color: C.warmGray }}>
                <ListChecks size={30} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">{t("dashboard.tasks.empty")}</p>
              </div>
            );
          return (
            <div className="space-y-2">
              {open.map((tk) => (
                <div key={tk.id} className="flex items-center gap-3 rounded-xl" style={{ background: C.pageBg, border: `1px solid ${C.border}`, padding: "9px 12px", flexDirection: dir === "rtl" ? "row-reverse" : "row" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: priorityColor[tk.priority] ?? C.calmTeal, flexShrink: 0 }} />
                  <div className="min-w-0 flex-1" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
                    <p className="truncate" style={{ fontSize: 12.5, fontWeight: 700, color: C.textPrimary }}>{lang === "ar" ? (tk.titleAr || tk.title) : tk.title}</p>
                    {tk.dueDate && (
                      <p className="flex items-center gap-1" style={{ fontSize: 10, color: C.warmGray, marginTop: 1, justifyContent: dir === "rtl" ? "flex-end" : "flex-start" }}>
                        <Clock size={10} /> {new Date(tk.dueDate).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </SectionCard>
    ),

    /* PENDING APPROVALS */
    pendingApprovals: (
      <SectionCard title={t("dashboard.sections.pendingApprovals")} linkHref="/approvals" accent="#C84B38">
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-6" style={{ color: C.warmGray }}>
            <CheckSquare size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">{t("dashboard.sections.noPendingApprovals")}</p>
          </div>
        ) : (
          <div>
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: C.border }}>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApproval(approval.id, "approved")}
                    disabled={updateApproval.isPending}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                    style={{ background: C.mangrove, color: "#fff" }}
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, "rejected")}
                    disabled={updateApproval.isPending}
                    className="w-7 h-7 rounded-full flex items-center justify-center border transition-all hover:scale-110 hover:border-red-300 disabled:opacity-50"
                    style={{ borderColor: C.border, color: C.warmGray }}
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1 text-end">
                  <p className="text-sm font-semibold leading-snug" style={{ color: C.textPrimary }}>{lang === "en" ? (approval.title || approval.titleAr) : (approval.titleAr || approval.title)}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.warmGray }}>{t("dashboard.sections.by")}: {approval.requestedBy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    ),

    /* FAVORITE EVENTS */
    favoriteEvents: <TopPinnedWidget events={events ?? []} lang={lang} />,

    /* SMART MONITORING */
    smartMonitoring: <SmartMonitoringWidget events={events ?? []} lang={lang} />,

    /* WATCHED EVENTS */
    watchedEvents: <WatchedEventsWidget events={events ?? []} lang={lang} />,

    /* ACTIVE RISKS */
    activeRisks: <ActiveRisksWidget events={events ?? []} lang={lang} />,

    /* RECENT REPORTS */
    recentReports: <RecentReportsWidget reports={reports ?? []} lang={lang} loading={reportsLoading} />,

    /* EXECUTIVE AI */
    executiveAI: <AiAssistantCard />,

    /* QUICK EXPORT */
    quickExport: (
      <SectionCard title={t("dashboard.sections.quickExport")} accent={C.castleHill}>
        <div className="space-y-2">
          {[
            { label: t("dashboard.exports.monthly"),        nameAr: "التقرير الشهري", type: "monthly",    format: "PDF",   Icon: FileText        },
            { label: t("dashboard.exports.guests"),         nameAr: "قائمة الضيوف",   type: "guests",     format: "Excel", Icon: FileSpreadsheet },
            { label: t("dashboard.exports.eventsSchedule"), nameAr: "جدول الفعاليات", type: "schedule",   format: "CSV",   Icon: Download        },
            { label: t("dashboard.exports.attendance"),     nameAr: "تقرير الحضور",   type: "attendance", format: "PDF",   Icon: FileText        },
          ].map(({ label, nameAr, type, format, Icon }) => (
            <motion.button
              key={label}
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => handleExport(label, nameAr, type, format)}
              disabled={createReport.isPending}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all disabled:opacity-50"
              style={{ borderColor: C.border, background: C.pageBg }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 10px rgba(61,53,41,0.10)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold" style={{ background: `${C.sunset}55`, color: C.mediumWood }}>
                {format}
              </span>
              <div className="flex items-center gap-2" style={{ color: C.textPrimary }}>
                <span className="font-medium">{label}</span>
                <Icon size={14} strokeWidth={1.5} />
              </div>
            </motion.button>
          ))}
        </div>
      </SectionCard>
    ),

    /* SMART ACTIONS */
    smartActions: (
      <SectionCard title={t("dashboard.sections.smartActions")} accent={C.mediumWood}>
        <div className="space-y-2">
          <Link href="/create-official-event">
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center justify-between gap-3 cursor-pointer"
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: `linear-gradient(135deg, ${C.mediumWood}10, ${C.sunset}40)`,
                border: `1px solid ${C.mediumWood}33`,
              }}
            >
              <div className="text-end flex-1">
                <p style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, lineHeight: 1.4 }}>
                  {t("dashboard.smart.createOfficialEvent")}
                </p>
                <p style={{ fontSize: 10, color: C.warmGray, marginTop: 2 }}>
                  {t("dashboard.smart.createOfficialEventDesc")}
                </p>
              </div>
              <div className="shrink-0 rounded-xl flex items-center justify-center shadow-sm"
                style={{ width: 36, height: 36, background: C.mediumWood, color: "#fff" }}>
                <Flag size={15} strokeWidth={1.7} />
              </div>
            </motion.div>
          </Link>

          <Link href="/events/new">
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center justify-between gap-3 cursor-pointer"
              style={{
                padding: "10px 12px", borderRadius: 12,
                background: C.pageBg, border: `1px solid ${C.border}`,
              }}
            >
              <div className="text-end flex-1">
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>
                  {t("dashboard.smart.newInternalEvent")}
                </p>
              </div>
              <div className="shrink-0 rounded-lg flex items-center justify-center"
                style={{ width: 28, height: 28, background: `${C.mangrove}18`, color: C.mangrove }}>
                <Plus size={13} strokeWidth={1.7} />
              </div>
            </motion.div>
          </Link>

          <Link href="/visits">
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center justify-between gap-3 cursor-pointer"
              style={{
                padding: "10px 12px", borderRadius: 12,
                background: C.pageBg, border: `1px solid ${C.border}`,
              }}
            >
              <div className="text-end flex-1">
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>
                  {t("dashboard.smart.manageOfficialVisits")}
                </p>
              </div>
              <div className="shrink-0 rounded-lg flex items-center justify-center"
                style={{ width: 28, height: 28, background: `${C.calmTeal}22`, color: C.calmTeal }}>
                <Users size={13} strokeWidth={1.7} />
              </div>
            </motion.div>
          </Link>
        </div>
      </SectionCard>
    ),
  };

  return (
    <Layout wide>
      <div className="space-y-6 pb-14">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div style={{ position: "relative", height: 320, borderRadius: "1.75rem", overflow: "hidden" }}>
          <motion.div initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} style={{ position: "absolute", inset: 0 }}>

            {/* Palace photo */}
            <img src="/palace-hero-2.jpg" alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

            {/* Warm gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, rgba(235,204,173,0.88) 0%, rgba(235,204,173,0.62) 25%, rgba(243,231,215,0.28) 55%, rgba(151,178,177,0.06) 100%)" }} />

            {/* Bottom cinematic vignette */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(75,64,56,0.38) 0%, rgba(75,64,56,0.12) 28%, transparent 52%)" }} />

            {/* Top matte */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(252,247,238,0.12) 0%, transparent 30%)" }} />

            {/* Content */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 52px 32px" }}>

              {/* Welcome text */}
              <div style={{ maxWidth: 420, alignSelf: "flex-start", textAlign: "end" }}>
                <p style={{ color: "#6B5A4E", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.36em", lineHeight: 1, marginBottom: 16 }}>
                  {t("dashboard.eyebrow")}
                </p>
                <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2.1rem, 3.6vw, 3rem)", fontWeight: 700, color: "#111", letterSpacing: "0.01em", lineHeight: 1.05, marginBottom: 10 }}>
                  {t("dashboard.hello")}
                </h1>
                <p style={{ fontSize: 13, color: "rgba(75,64,56,0.72)", fontWeight: 500, lineHeight: 1.5 }}>
                  {t("dashboard.tagline")}
                </p>
              </div>

              {/* Glassmorphism info cards */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
                {[
                  { Icon: CalendarDays, label: t("dashboard.date"),        value: today                       },
                  { Icon: Sun,          label: t("dashboard.weatherCity"), value: t("dashboard.weatherValue") },
                  { Icon: Landmark,     label: t("dashboard.nextPrayer"),  value: t("dashboard.prayerValue")  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 9, borderRadius: "1.1rem",
                    background: "rgba(252,247,238,0.72)",
                    backdropFilter: "blur(12px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
                    border: "1px solid rgba(173,137,101,0.22)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                    padding: "9px 16px 9px 13px",
                  }}>
                    <Icon size={14} strokeWidth={1.5} style={{ color: C.calmTeal, flexShrink: 0 }} />
                    <div style={{ textAlign: "end" }}>
                      <p style={{ color: "#8A7A70", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.2 }}>{label}</p>
                      <p style={{ color: "#2E2418", fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── EXECUTIVE STATUS BAR ──────────────────────────────── */}
        <ExecStatusBar />

        {/* ── WEEKLY CALENDAR ───────────────────────────────────── */}
        <WeekCalendar days={weekDays} loading={eventsLoading || visitsLoading} />

        {/* ── KPI CARDS ─────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <KpiCard icon={CalendarDays} value={summary?.upcomingEvents ?? "—"} label={t("dashboard.kpi.upcomingEvents")}
            sublabel={`+${summary?.upcomingEventsChange ?? 0}% ${t("dashboard.kpi.fromLastMonth")}`} accent={C.mangrove} loading={summaryLoading} trend="up" />
          <KpiCard icon={Flag} value={summary?.officialVisits ?? "—"} label={t("dashboard.kpi.officialVisits")}
            sublabel={`+${summary?.officialVisitsChange ?? 0}% ${t("dashboard.kpi.fromLastMonth")}`} accent={C.calmTeal} loading={summaryLoading} trend="up" />
          <KpiCard icon={Activity} value={summary?.pendingRequests ?? "—"} label={t("dashboard.kpi.pendingRequests")}
            sublabel={`${summary?.pendingRequestsChange ?? 0}% ${t("dashboard.kpi.fromLastMonth")}`} accent={C.mediumWood} loading={summaryLoading} />
          <KpiCard icon={CheckSquare} value={summary?.pendingApprovals ?? "—"} label={t("dashboard.kpi.requiredApprovals")}
            sublabel={t("dashboard.kpi.mustReviewToday")} accent="#C84B38" loading={summaryLoading} />
        </motion.div>

        {/* ── LOGISTICS OVERVIEW ────────────────────────────────── */}
        <LogisticsOverviewBand logistics={summary?.logistics} loading={summaryLoading} />

        {/* ── BUDGET OVERSPEND ALERT ────────────────────────────── */}
        <BudgetAlertBand alerts={summary?.budgetAlerts} logistics={summary?.logistics} loading={summaryLoading} threshold={budgetThreshold} onThresholdChange={setBudgetThreshold} />

        {/* ── CUSTOMIZABLE DASHBOARD ────────────────────────────── */}
        <ProfileBar
          profiles={layout.profiles}
          activeId={layout.activeId}
          onSwitch={layout.switchProfile}
          editMode={editMode}
          onToggleEdit={() => {
            if (layout.locked) return;
            setEditMode((v) => !v);
          }}
          dir={dir}
          lang={lang}
          dirty={layout.dirty}
          saving={layout.saving}
          locked={layout.locked}
          onToggleLock={layout.toggleLock}
          onNew={layout.createProfile}
          onDuplicate={layout.duplicateProfile}
          onRename={layout.renameProfile}
          onDelete={layout.deleteProfile}
          onReset={layout.resetToDefault}
          onSave={layout.saveNow}
        />

        {layout.loading || layout.seeding ? (
          <div className="grid grid-cols-12 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`${i % 3 === 0 ? "col-span-12 lg:col-span-8" : "col-span-12 lg:col-span-4"} h-48 rounded-2xl`}
              />
            ))}
          </div>
        ) : (
          <CustomizableGrid
            items={layout.visibleItems}
            nodes={nodes}
            editMode={editMode}
            dir={dir}
            onHide={layout.hide}
          />
        )}

        {editMode && (
          <CustomizePanel items={layout.items} dir={dir} onShow={layout.show} onHide={layout.hide} />
        )}
      </div>
    </Layout>
  );
}

