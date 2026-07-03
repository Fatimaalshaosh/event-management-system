
import { palette } from "@/theme";
import { COUNTRIES } from "@workspace/reference";

import { Layout } from "@/components/layout";
import {
  useGetEvent,
  useGetEventReadiness,
  useListTasks,
  useListEventRisks,
  useGetEventOpsRoom,
  useDeleteEvent,
  useUpdateEvent,
  getGetEventQueryKey,
  getGetEventReadinessQueryKey,
  getListTasksQueryKey,
  getListEventRisksQueryKey,
  getGetEventOpsRoomQueryKey,
  getListEventsQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Edit, FileText, AlertTriangle, Loader2, Trash2, Ban, RotateCcw } from "lucide-react";
import { ChevronEnd } from "@/components/dir-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

import { Link, useRoute, useLocation } from "wouter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { useRegisterPageContext } from "@/ai/page-context";
import { ContextualCopilot } from "@/ai/contextual-copilot";
import { ExecutiveReportModal, type ExecutiveReportData } from "@/components/executive-report";
import { EventFavoriteButton } from "@/components/events/event-card";
import { OverviewTab } from "@/components/event-command/overview-tab";
import { InvitationsTab } from "@/components/event-command/invitations-tab";
import { ParticipantsTab } from "@/components/event-command/participants-tab";
import { TasksReadinessTab } from "@/components/event-command/tasks-readiness-tab";
import { MissionEngineView } from "@/components/mission/mission-engine-view";
import { RiskRegisterTab } from "@/components/event-command/risk-register-tab";
import { LogisticsTab } from "@/components/event-command/logistics-tab";
import { FlightsTab } from "@/components/event-command/flights-tab";
import { HotelsTab } from "@/components/event-command/hotels-tab";
import { LiveOpsTab } from "@/components/event-command/live-ops-tab";
import { EventCollaborationHub } from "@/components/event-command/collaboration-hub";

const T = palette;
import { type TabKey, EventBudgetAlertBand, TABS, COPILOT_ACTIONS } from "@/components/event-command/event-detail-parts";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = parseInt(params?.id || "0", 10);
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("overview");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ExecutiveReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBy, setCancelBy] = useState("");
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: updateEvent, isPending: isUpdatingStatus } = useUpdateEvent();

  const { data: event, isLoading: isEventLoading } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) },
  });
  const { data: readiness, isLoading: isReadinessLoading } = useGetEventReadiness(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventReadinessQueryKey(eventId) },
  });
  const { data: tasks } = useListTasks(
    { eventId },
    { query: { enabled: !!eventId, queryKey: getListTasksQueryKey({ eventId }) } },
  );
  const { data: risks } = useListEventRisks(eventId, {
    query: { enabled: !!eventId, queryKey: getListEventRisksQueryKey(eventId) },
  });
  const { data: ops } = useGetEventOpsRoom(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventOpsRoomQueryKey(eventId) },
  });

  const copilotActions = COPILOT_ACTIONS.map((a) => ({
    labelAr: a.labelAr,
    labelEn: a.labelEn,
    prompt: t(`ai.copilot.event.${a.key}`),
  }));

  const eventTitle = lang === "en"
    ? (event?.name || event?.nameAr || "")
    : (event?.nameAr || event?.name || "");

  async function openReport() {
    if (reportLoading || !event) return;
    setReportData(null);
    setReportOpen(true);
    setReportLoading(true);
    const message = lang === "en"
      ? `Prepare a focused executive readiness report for the event "${eventTitle}". Cover its current readiness level, outstanding tasks, key operational risks, and the recommended next actions to ensure full protocol readiness.`
      : `أعد تقريراً تنفيذياً مركزاً عن جاهزية الفعالية «${eventTitle}». غطِّ مستوى الجاهزية الحالي، المهام المتبقية، أبرز المخاطر التشغيلية، والإجراءات التالية الموصى بها لضمان الجاهزية البروتوكولية الكاملة.`;
    const focusEvent = {
      id: event.id,
      name: event.name,
      nameAr: event.nameAr,
      date: event.date,
      location: event.location,
      locationAr: event.locationAr,
      status: event.status,
      riskLevel: event.riskLevel,
      readinessPercent: event.readinessPercent,
      pendingTasksCount: event.pendingTasksCount,
      categories: readiness?.categories?.map((c) => ({
        name: c.name, nameAr: c.nameAr, percent: c.percent, status: c.status,
      })),
      tasks: tasks?.map((tk) => ({
        title: tk.title, titleAr: tk.titleAr, status: tk.status, priority: tk.priority, dueDate: tk.dueDate,
      })),
      risks: risks?.map((r) => ({
        title: r.title, titleAr: r.titleAr, severity: r.severity, status: r.status,
      })),
    };
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, lang, context: { focusEvent } }),
      });
      if (!res.ok) throw new Error("ai failed");
      const data = (await res.json()) as ExecutiveReportData;
      setReportData(data);
    } catch {
      setReportOpen(false);
      toast({ title: t("ai.error"), variant: "destructive" });
    } finally {
      setReportLoading(false);
    }
  }

  function handleDelete() {
    if (isDeleting || !event) return;
    deleteEvent(
      { id: event.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          setDeleteOpen(false);
          toast({
            title: t("pages.eventDetail.deletedTitle"),
            description: t("pages.eventDetail.deletedDesc"),
          });
          setLocation("/events");
        },
        onError: () => {
          toast({
            title: t("pages.eventDetail.deleteErrorTitle"),
            description: t("pages.eventDetail.deleteErrorDesc"),
            variant: "destructive",
          });
        },
      },
    );
  }

  function refreshEvent() {
    queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
  }

  function handleCancel() {
    if (isUpdatingStatus || !event) return;
    const reason = cancelReason.trim();
    const by = cancelBy.trim();
    updateEvent(
      {
        id: event.id,
        data: {
          status: "cancelled",
          cancellationReason: reason || null,
          cancelledBy: by || null,
        },
      },
      {
        onSuccess: () => {
          refreshEvent();
          setCancelOpen(false);
          setCancelReason("");
          setCancelBy("");
          toast({
            title: t("pages.eventDetail.cancelledTitle"),
            description: t("pages.eventDetail.cancelledDesc"),
          });
        },
        onError: () => {
          toast({
            title: t("pages.eventDetail.cancelErrorTitle"),
            description: t("pages.eventDetail.cancelErrorDesc"),
            variant: "destructive",
          });
        },
      },
    );
  }

  function handleReactivate() {
    if (isUpdatingStatus || !event) return;
    updateEvent(
      { id: event.id, data: { status: "upcoming" } },
      {
        onSuccess: () => {
          refreshEvent();
          toast({
            title: t("pages.eventDetail.reactivatedTitle"),
            description: t("pages.eventDetail.reactivatedDesc"),
          });
        },
        onError: () => {
          toast({
            title: t("pages.eventDetail.reactivateErrorTitle"),
            description: t("pages.eventDetail.reactivateErrorDesc"),
            variant: "destructive",
          });
        },
      },
    );
  }

  useRegisterPageContext(
    event
      ? {
          page: "event-detail",
          titleAr: event.nameAr || event.name || "فعالية",
          titleEn: event.name || event.nameAr || "Event",
          data: {
            eventId: event.id,
            eventName: event.name,
            eventNameAr: event.nameAr,
            eventDate: event.date,
            eventLocation: event.location,
            status: event.status,
            // Country reference metadata for protocol briefing / gift suggestions.
            country: (() => {
              const c = COUNTRIES.find((x) => x.nameEn === event.country || x.nameAr === event.countryAr);
              if (c) return { code: c.code, code3: c.code3, nameEn: c.nameEn, nameAr: c.nameAr, region: c.region, subregion: c.subregion, capital: c.capital, nationalityEn: c.nationalityEn, nationalityAr: c.nationalityAr };
              return event.country ? { nameEn: event.country, nameAr: event.countryAr } : undefined;
            })(),
            riskLevel: event.riskLevel,
            readinessPercent: event.readinessPercent,
            pendingTasksCount: event.pendingTasksCount,
            categories: readiness?.categories?.map((c) => ({
              name: c.name,
              nameAr: c.nameAr,
              percent: c.percent,
              status: c.status,
            })),
            tasks: tasks?.map((tk) => ({
              title: tk.title,
              titleAr: tk.titleAr,
              category: tk.category,
              status: tk.status,
              priority: tk.priority,
              readinessImpact: tk.readinessImpact,
              team: tk.team,
              owner: tk.assignedTo,
              dueDate: tk.dueDate,
            })),
            risks: risks?.map((r) => ({
              title: r.title,
              titleAr: r.titleAr,
              category: r.category,
              severity: r.severity,
              likelihood: r.likelihood,
              status: r.status,
              impact: r.impact,
              mitigation: r.mitigation,
            })),
            opsSnapshot: ops
              ? {
                  readinessPercent: ops.readinessPercent,
                  tasks: ops.tasks,
                  risks: ops.risks,
                  approvals: ops.approvals,
                  arrivals: ops.arrivals,
                  logisticsNeeds: ops.logistics,
                  participants: ops.participants,
                  guests: ops.guests,
                  alerts: ops.alerts.map((a) => ({ severity: a.severity, message: a.message, messageAr: a.messageAr })),
                }
              : undefined,
          },
          suggestions: copilotActions,
        }
      : null,
  );

  if (isEventLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/2 ms-auto" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) return null;

  const isCancelled = event.status === "cancelled";
  const statusLabel =
    event.status === "confirmed" ? t("pages.eventDetail.statusConfirmed") :
    event.status === "completed" ? t("pages.eventDetail.statusCompleted") :
    isCancelled ? t("pages.eventDetail.statusCancelled") : t("pages.eventDetail.statusDraft");
  const statusStyle =
    event.status === "confirmed"
      ? { background: T.mangrove + "1A", color: T.mangrove }
      : event.status === "completed"
      ? { background: T.calmTeal + "1A", color: T.calmTeal }
      : isCancelled
      ? { background: "#DC262614", color: "#DC2626" }
      : { background: T.sunset + "44", color: T.mediumWood };

  return (
    <Layout>
      <div className="space-y-8 pb-12">

        {/* Breadcrumb + header */}
        <div>
          <Link href="/events" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 justify-end">
            <span>{t("pages.eventDetail.backToEvents")}</span>
            <ChevronEnd size={13} />
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <EventFavoriteButton event={event} />
              <button
                onClick={openReport}
                disabled={reportLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-muted/30 disabled:opacity-60 disabled:pointer-events-none"
                style={{ borderColor: T.border, color: T.castleHill }}
              >
                {t("pages.eventDetail.report")}
                {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} strokeWidth={1.5} />}
              </button>
              <button
                onClick={() => setLocation(`/events/${event.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
                style={{ background: T.mangrove, color: "#fff" }}
              >
                {t("pages.eventDetail.edit")} <Edit size={14} strokeWidth={1.5} />
              </button>
              {isCancelled ? (
                <button
                  onClick={handleReactivate}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-muted/30 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ borderColor: T.border, color: T.mangrove }}
                >
                  {t("pages.eventDetail.reactivate")}
                  {isUpdatingStatus ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} strokeWidth={1.5} />}
                </button>
              ) : (
                <button
                  onClick={() => setCancelOpen(true)}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-muted/30 disabled:opacity-60 disabled:pointer-events-none"
                  style={{ borderColor: T.border, color: T.castleHill }}
                >
                  {t("pages.eventDetail.cancel")} <Ban size={14} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-[#DC2626]/5"
                style={{ borderColor: "#DC262633", color: "#DC2626" }}
              >
                {t("pages.eventDetail.delete")} <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            <div className="text-end">
              <div className="flex items-center gap-2 justify-end mb-2">
                {event.riskLevel === "high" && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1" style={{ background: "#DC262615", color: "#DC2626" }}>
                    {t("pages.eventDetail.highRisk")} <AlertTriangle size={11} />
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={statusStyle}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                {lang === "en" ? (event.name || event.nameAr) : (event.nameAr || event.name)}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground justify-end">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} strokeWidth={1.5} /> {lang === "en" ? (event.location || event.locationAr) : (event.locationAr || event.location)}
                </span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} strokeWidth={1.5} />
                  {new Date(event.date).toLocaleDateString(lang === "en" ? "en-GB" : "ar-AE", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Event Copilot */}
        <ContextualCopilot
          titleKey="ai.copilot.event.title"
          subtitleKey="ai.copilot.event.subtitle"
          suggestions={copilotActions}
        />

        {/* Budget overspend alert */}
        <EventBudgetAlertBand logistics={ops?.logistics} />

        {/* Command Center tabs */}
        <div className="flex items-center gap-1 border-b justify-end" style={{ borderColor: T.border }}>
          {TABS.map((tk) => {
            const active = tab === tk.key;
            return (
              <button
                key={tk.key}
                onClick={() => setTab(tk.key)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative"
                style={{ color: active ? T.mangrove : T.warmGray }}
              >
                <tk.icon size={16} strokeWidth={1.5} />
                {t(tk.labelKey)}
                {active && (
                  <span
                    className="absolute bottom-0 start-0 end-0 h-0.5 rounded-full"
                    style={{ background: T.mangrove }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        {tab === "overview" && (
          <OverviewTab event={event} readiness={readiness} isReadinessLoading={isReadinessLoading} />
        )}
        {tab === "missionEngine" && <MissionEngineView eventId={eventId} />}
        {tab === "collaboration" && <EventCollaborationHub eventId={eventId} />}
        {tab === "tasks" && <TasksReadinessTab eventId={eventId} />}
        {tab === "invitations" && <InvitationsTab eventId={eventId} />}
        {tab === "participants" && <ParticipantsTab eventId={eventId} />}
        {tab === "risks" && <RiskRegisterTab eventId={eventId} />}
        {tab === "logistics" && <LogisticsTab eventId={eventId} />}
        {tab === "flights" && <FlightsTab eventId={eventId} />}
        {tab === "hotels" && <HotelsTab eventId={eventId} />}
        {tab === "liveOps" && <LiveOpsTab eventId={eventId} />}
      </div>

      <ExecutiveReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={eventTitle}
        related={lang === "en" ? (event.location || event.locationAr || undefined) : (event.locationAr || event.location || undefined)}
        data={reportData}
      />

      <AlertDialog open={cancelOpen} onOpenChange={(open) => { if (!isUpdatingStatus) setCancelOpen(open); }}>
        <AlertDialogContent className="text-end">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages.eventDetail.cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages.eventDetail.cancelConfirmDesc", { name: eventTitle })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2 text-end">
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason" className="text-xs font-medium" style={{ color: T.warmGray }}>
                {t("pages.eventDetail.cancelReasonLabel")}
              </Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("pages.eventDetail.cancelReasonPh")}
                disabled={isUpdatingStatus}
                rows={3}
                className="resize-none text-end"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cancel-by" className="text-xs font-medium" style={{ color: T.warmGray }}>
                {t("pages.eventDetail.cancelByLabel")}
              </Label>
              <Input
                id="cancel-by"
                value={cancelBy}
                onChange={(e) => setCancelBy(e.target.value)}
                placeholder={t("pages.eventDetail.cancelByPh")}
                disabled={isUpdatingStatus}
                className="text-end"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>
              {t("pages.eventDetail.cancelDismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleCancel(); }}
              disabled={isUpdatingStatus}
              style={{ background: T.castleHill, color: "#fff" }}
            >
              {isUpdatingStatus ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> {t("pages.eventDetail.cancelling")}
                </span>
              ) : (
                t("pages.eventDetail.cancelConfirmAction")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!isDeleting) setDeleteOpen(open); }}>
        <AlertDialogContent className="text-end">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages.eventDetail.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages.eventDetail.deleteConfirmDesc", { name: eventTitle })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("pages.eventDetail.deleteCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={isDeleting}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> {t("pages.eventDetail.deleting")}
                </span>
              ) : (
                t("pages.eventDetail.deleteConfirmAction")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

