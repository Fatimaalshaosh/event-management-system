import { formatCurrency as fmtMoney } from "@/lib/format";
import { palette } from "@/theme";
import {
  useGetEventOpsRoom,
  getGetEventOpsRoomQueryKey,
} from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Gauge, PlaneLanding, Briefcase, ClipboardCheck, ShieldAlert,
  ListChecks, Users, BadgeCheck, Radio, AlertTriangle, Info,
} from "lucide-react";

const T = palette;

function alertStyle(sev: string) {
  if (sev === "critical") return { background: "#DC262610", color: "#DC2626", border: "#DC262633" };
  if (sev === "high") return { background: T.sunset + "44", color: T.mediumWood, border: T.mediumWood + "44" };
  if (sev === "medium") return { background: T.calmTeal + "14", color: T.calmTeal, border: T.calmTeal + "44" };
  return { background: T.mangrove + "14", color: T.mangrove, border: T.mangrove + "44" };
}


function Metric({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="text-end">
      <p className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", color: color || T.textPrimary }}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({
  title, icon: Icon, color, children,
}: { title: string; icon: typeof Gauge; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.cardBg }}>
      <div className="flex items-center justify-end gap-2 mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "1A" }}>
          <Icon size={14} strokeWidth={1.5} style={{ color }} />
        </span>
      </div>
      {children}
    </div>
  );
}

export function LiveOpsTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const { data: ops, isLoading } = useGetEventOpsRoom(eventId, {
    query: { queryKey: getGetEventOpsRoomQueryKey(eventId), refetchInterval: 20000 },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
      </div>
    );
  }

  if (!ops) return null;

  const readinessColor = ops.readinessPercent >= 80 ? T.mangrove : ops.readinessPercent >= 50 ? T.mediumWood : "#DC2626";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: T.mangrove + "1A", color: T.mangrove }}>
          <Radio size={12} strokeWidth={2} className="animate-pulse" /> {t("pages.commandCenter.liveOps.live")}
        </span>
        <div className="text-end">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.commandCenter.liveOps.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("pages.commandCenter.liveOps.subtitle")}</p>
        </div>
      </div>

      {/* Alerts feed */}
      <Panel title={t("pages.commandCenter.liveOps.alerts")} icon={AlertTriangle} color={T.mediumWood}>
        {ops.alerts.length === 0 ? (
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground py-2">
            {t("pages.commandCenter.liveOps.noAlerts")} <Info size={14} strokeWidth={1.5} />
          </div>
        ) : (
          <div className="space-y-2">
            {ops.alerts.map((a, idx) => {
              const st = alertStyle(a.severity);
              return (
                <motion.div
                  key={idx}
                  className="flex items-center justify-end gap-2 rounded-xl border px-3 py-2 text-sm"
                  style={{ background: st.background, color: st.color, borderColor: st.border }}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <span className="font-medium">{lang === "en" ? a.message : a.messageAr}</span>
                  <AlertTriangle size={13} strokeWidth={1.5} />
                </motion.div>
              );
            })}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Readiness */}
        <Panel title={t("pages.commandCenter.liveOps.readiness")} icon={Gauge} color={readinessColor}>
          <div className="flex items-end justify-end gap-2">
            <span className="text-xs text-muted-foreground mb-1.5">{t("pages.commandCenter.liveOps.total")}</span>
            <span className="text-4xl font-bold" style={{ fontFamily: "Georgia, serif", color: readinessColor }}>{ops.readinessPercent}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: readinessColor + "1A" }}>
            <motion.div className="h-full rounded-full" style={{ background: readinessColor }} initial={{ width: 0 }} animate={{ width: `${ops.readinessPercent}%` }} transition={{ duration: 0.6 }} />
          </div>
        </Panel>

        {/* Tasks */}
        <Panel title={t("pages.commandCenter.liveOps.tasksPanel")} icon={ListChecks} color={T.mangrove}>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.total")} value={ops.tasks.total} />
            <Metric label={t("pages.commandCenter.liveOps.done")} value={ops.tasks.done} color={T.mangrove} />
            <Metric label={t("pages.commandCenter.liveOps.pending")} value={ops.tasks.pending} color={T.mediumWood} />
            <Metric label={t("pages.commandCenter.liveOps.overdue")} value={ops.tasks.overdue} color={ops.tasks.overdue > 0 ? "#DC2626" : undefined} />
          </div>
        </Panel>

        {/* Risks */}
        <Panel title={t("pages.commandCenter.liveOps.risksPanel")} icon={ShieldAlert} color="#DC2626">
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.open")} value={ops.risks.open} color={T.castleHill} />
            <Metric label={t("pages.commandCenter.liveOps.critical")} value={ops.risks.critical} color={ops.risks.critical > 0 ? "#DC2626" : undefined} />
            <Metric label={t("pages.commandCenter.liveOps.high")} value={ops.risks.high} color={T.mediumWood} />
            <Metric label={t("pages.commandCenter.liveOps.total")} value={ops.risks.total} />
          </div>
        </Panel>

        {/* Arrivals */}
        <Panel title={t("pages.commandCenter.liveOps.arrivals")} icon={PlaneLanding} color={T.calmTeal}>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.accepted")} value={ops.arrivals.accepted} color={T.mangrove} />
            <Metric label={t("pages.commandCenter.liveOps.attended")} value={ops.arrivals.attended} color={T.calmTeal} />
            <Metric label={t("pages.commandCenter.liveOps.pending")} value={ops.arrivals.pending} color={T.mediumWood} />
            <Metric label={t("pages.commandCenter.liveOps.declined")} value={ops.arrivals.declined} />
          </div>
        </Panel>

        {/* Logistics needs */}
        <Panel title={t("pages.commandCenter.liveOps.logistics")} icon={Briefcase} color={T.mediumWood}>
          <div className="grid grid-cols-3 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.flight")} value={ops.logistics.flight} color={T.mediumWood} />
            <Metric label={t("pages.commandCenter.liveOps.hotel")} value={ops.logistics.hotel} color={T.castleHill} />
            <Metric label={t("pages.commandCenter.liveOps.transport")} value={ops.logistics.transport} color={T.calmTeal} />
            <Metric label={t("pages.commandCenter.liveOps.gifts")} value={ops.logistics.gifts} color={T.mangrove} />
            <Metric label={t("pages.commandCenter.liveOps.documents")} value={ops.logistics.documents} color={T.castleHill} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t" style={{ borderColor: T.border }}>
            <Metric
              label={t("pages.commandCenter.liveOps.budgetEst")}
              value={fmtMoney(ops.logistics.budgetEstimated, ops.logistics.currency, lang)}
              color={T.mediumWood}
            />
            <Metric
              label={t("pages.commandCenter.liveOps.budgetActual")}
              value={fmtMoney(ops.logistics.budgetActual, ops.logistics.currency, lang)}
              color={ops.logistics.budgetActual > ops.logistics.budgetEstimated ? "#DC2626" : T.mangrove}
            />
          </div>
        </Panel>

        {/* Approvals */}
        <Panel title={t("pages.commandCenter.liveOps.approvals")} icon={ClipboardCheck} color={T.castleHill}>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.total")} value={ops.approvals.total} />
            <Metric label={t("pages.commandCenter.liveOps.pending")} value={ops.approvals.pending} color={ops.approvals.pending > 0 ? T.mediumWood : undefined} />
          </div>
        </Panel>

        {/* Participants */}
        <Panel title={t("pages.commandCenter.liveOps.participantsPanel")} icon={Users} color={T.mangrove}>
          <div className="grid grid-cols-3 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.total")} value={ops.participants.total} />
            <Metric label={t("pages.commandCenter.liveOps.internal")} value={ops.participants.internal} color={T.mangrove} />
            <Metric label={t("pages.commandCenter.liveOps.external")} value={ops.participants.external} color={T.mediumWood} />
          </div>
        </Panel>

        {/* Guests */}
        <Panel title={t("pages.commandCenter.liveOps.guestsPanel")} icon={BadgeCheck} color={T.calmTeal}>
          <div className="grid grid-cols-3 gap-3">
            <Metric label={t("pages.commandCenter.liveOps.total")} value={ops.guests.total} />
            <Metric label={t("pages.commandCenter.liveOps.checkedIn")} value={ops.guests.checkedIn} color={T.mangrove} />
            <Metric label={t("pages.commandCenter.liveOps.verified")} value={ops.guests.verified} color={T.calmTeal} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
