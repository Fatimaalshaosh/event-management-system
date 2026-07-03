import { palette } from "@/theme";
import { useState } from "react";
import {
  useListTasks,
  useUpdateTask,
  useDeleteTask,
  getListTasksQueryKey,
  useGetEvent,
  getGetEventQueryKey,
  getGetEventReadinessQueryKey,
  type Task,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MissionAssignmentModal } from "@/components/event-command/mission/mission-assignment-modal";
import { motion } from "framer-motion";
import {
  Plus, ListChecks, Trash2, CheckCircle2, RotateCcw, Gauge,
  CalendarClock, User, AlertTriangle,
} from "lucide-react";

const T = palette;

const CATEGORIES = ["protocol", "logistics", "security", "media", "planning"] as const;

const CATEGORY_COLOR: Record<string, string> = {
  protocol: T.mangrove,
  logistics: T.mediumWood,
  security: T.castleHill,
  media: T.calmTeal,
  planning: T.warmGray,
};

function priorityStyle(p: string) {
  if (p === "critical") return { background: "#DC262615", color: "#DC2626" };
  if (p === "high") return { background: T.mediumWood + "1A", color: T.mediumWood };
  if (p === "medium") return { background: T.calmTeal + "1A", color: T.calmTeal };
  return { background: T.warmGray + "1A", color: T.warmGray };
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function TasksReadinessTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useListTasks(
    { eventId },
    { query: { queryKey: getListTasksQueryKey({ eventId }) } },
  );
  const { data: event } = useGetEvent(eventId, {
    query: { enabled: !!eventId, queryKey: getGetEventQueryKey(eventId) },
  });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isOpen, setIsOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ eventId }) });
    queryClient.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getGetEventReadinessQueryKey(eventId) });
  };

  const onMutationError = () => toast({ title: t("common.error"), variant: "destructive" });

  const toggleDone = (task: Task) => {
    const next = task.status === "done" ? "pending" : "done";
    updateTask.mutate({ id: task.id, data: { status: next } }, { onSuccess: invalidate, onError: onMutationError });
  };

  const remove = (task: Task) => {
    deleteTask.mutate({ id: task.id }, {
      onSuccess: () => { toast({ title: t("pages.commandCenter.tasks.removed") }); invalidate(); },
      onError: onMutationError,
    });
  };

  const list = tasks ?? [];
  const overall = event?.readinessPercent ?? 0;

  const categoryReadiness = (cat: string) => {
    const items = list.filter((x) => x.category === cat);
    const totalImpact = items.reduce((s, x) => s + (x.readinessImpact || 0), 0);
    if (totalImpact === 0) return { percent: 0, total: items.length, done: items.filter((x) => x.status === "done").length };
    const doneImpact = items.filter((x) => x.status === "done").reduce((s, x) => s + (x.readinessImpact || 0), 0);
    return {
      percent: Math.round((doneImpact / totalImpact) * 100),
      total: items.length,
      done: items.filter((x) => x.status === "done").length,
    };
  };

  const renderTask = (task: Task, idx: number) => {
    const overdue = isOverdue(task);
    const done = task.status === "done";
    const color = CATEGORY_COLOR[task.category] || T.warmGray;
    return (
      <motion.div
        key={task.id}
        className="rounded-2xl border p-4"
        style={{ borderColor: overdue ? "#DC262640" : T.border, background: T.cardBg, opacity: done ? 0.72 : 1 }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: done ? 0.72 : 1, y: 0 }}
        transition={{ delay: idx * 0.03 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => remove(task)}
              title={t("common.delete")}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#DC2626] hover:bg-[#DC262610] transition-colors"
            >
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => toggleDone(task)}
              className="text-xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1"
              style={done
                ? { background: T.mangrove + "1A", color: T.mangrove }
                : { background: T.warmGray + "14", color: T.warmGray }}
            >
              {done ? <RotateCcw size={11} /> : <CheckCircle2 size={11} />}
              {done ? t("pages.commandCenter.tasks.reopen") : t("pages.commandCenter.tasks.markDone")}
            </button>
          </div>
          <div className="text-end min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate" style={{ textDecoration: done ? "line-through" : "none" }}>
              {lang === "en" ? (task.title || task.titleAr) : (task.titleAr || task.title)}
            </p>
            {task.description && (
              <p className="text-xs mt-0.5 text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center flex-wrap gap-2 mt-2 justify-end">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={priorityStyle(task.priority)}>
                {t(`pages.commandCenter.tasks.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
              </span>
              {(task.team || task.assignedTo) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {task.assignedTo || task.team}
                  <User size={11} strokeWidth={1.5} />
                </span>
              )}
              <span className="flex items-center gap-1 text-xs" style={{ color: overdue ? "#DC2626" : T.warmGray }}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(lang === "en" ? "en-GB" : "ar-AE", { month: "short", day: "numeric" })
                  : t("pages.commandCenter.tasks.noDue")}
                {overdue ? <AlertTriangle size={11} /> : <CalendarClock size={11} strokeWidth={1.5} />}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: T.warmGray }}>
                <span>{task.readinessImpact}%</span>
                <span>{t("pages.commandCenter.tasks.impact")}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: color + "22" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(task.readinessImpact, 100)}%`, background: color }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
          style={{ background: T.mangrove, color: "#fff" }}
        >
          {t("pages.commandCenter.tasks.add")} <Plus size={15} strokeWidth={2} />
        </button>
        <MissionAssignmentModal
          open={isOpen}
          onOpenChange={setIsOpen}
          eventId={eventId}
          onCreated={() => { invalidate(); toast({ title: t("pages.commandCenter.tasks.addedToast") }); }}
        />

        <div className="text-end">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            {t("pages.commandCenter.tasks.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t("pages.commandCenter.tasks.subtitle")}</p>
        </div>
      </div>

      {/* Readiness Center */}
      <div className="rounded-2xl border p-6" style={{ borderColor: T.border, background: T.cardBg }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold" style={{ fontFamily: "Georgia, serif", color: T.mangrove }}>{overall}%</span>
            <span className="text-xs text-muted-foreground mb-1.5">{t("pages.commandCenter.tasks.overall")}</span>
          </div>
          <div className="text-end">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 justify-end">
              {t("pages.commandCenter.tasks.readinessTitle")} <Gauge size={16} strokeWidth={1.5} style={{ color: T.mangrove }} />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("pages.commandCenter.tasks.readinessSubtitle")}</p>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden mt-4" style={{ background: T.mangrove + "1A" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: T.mangrove }}
            initial={{ width: 0 }}
            animate={{ width: `${overall}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {CATEGORIES.map((c) => {
            const r = categoryReadiness(c);
            const color = CATEGORY_COLOR[c];
            return (
              <div key={c} className="rounded-xl border p-3" style={{ borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color }}>{r.percent}%</span>
                  <span className="text-[11px] font-medium" style={{ color: T.castleHill }}>{t(`pages.commandCenter.tasks.cat.${c}`)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: color + "22" }}>
                  <div className="h-full rounded-full" style={{ width: `${r.percent}%`, background: color }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 text-end">{r.done}/{r.total} {t("pages.commandCenter.tasks.tasksDone")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task groups */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border text-center py-16 text-muted-foreground" style={{ borderColor: T.border, background: T.cardBg }}>
          <ListChecks size={36} className="mx-auto mb-3 opacity-15" />
          <p className="text-sm">{t("pages.commandCenter.tasks.emptyAll")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((c) => {
            const items = list.filter((x) => x.category === c);
            if (items.length === 0) return null;
            const color = CATEGORY_COLOR[c];
            return (
              <div key={c} className="space-y-3">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + "1A", color }}>
                    {items.length}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{t(`pages.commandCenter.tasks.cat.${c}`)}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((task, idx) => renderTask(task, idx))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
