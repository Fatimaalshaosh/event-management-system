import { useMemo, useState } from "react";
import { Bell, AlertTriangle, CheckCheck, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListNotifications,
  useMarkAllNotificationsRead,
  getListNotificationsQueryKey,
  type Notification,
} from "@workspace/api-client-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/i18n/language-context";
import { getOwnerKey } from "@/components/dashboard/owner-key";

const DANGER = "#C84B38";
const WARN = "#9C6B3F";

function readStoredThreshold(): number {
  if (typeof window === "undefined") return 90;
  const stored = Number(window.localStorage.getItem("budgetThreshold"));
  if (!Number.isFinite(stored)) return 90;
  return Math.min(100, Math.max(50, Math.round(stored)));
}

function useRelativeTime() {
  const { t } = useTranslation();
  return (iso: string) => {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return "";
    const diffMin = Math.max(0, Math.floor((Date.now() - then) / 60000));
    if (diffMin < 1) return t("notifications.justNow");
    if (diffMin < 60) return t("notifications.minutesAgo", { count: diffMin });
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t("notifications.hoursAgo", { count: diffHr });
    return t("notifications.daysAgo", { count: Math.floor(diffHr / 24) });
  };
}

function NotificationRow({ n }: { n: Notification }) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const relative = useRelativeTime();
  const isOver = n.status === "over";
  const accent = isOver ? DANGER : WARN;
  const displayName =
    lang === "ar" ? n.eventNameAr || n.eventName : n.eventName;

  const detail = isOver
    ? t("notifications.overDetail", { percent: n.overByPercent ?? 0 })
    : t("notifications.warningDetail", { percent: n.spentPercent ?? 0 });

  const body = (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
      style={{
        background: n.read ? undefined : `${accent}0A`,
        borderInlineStart: `3px solid ${n.read ? "transparent" : accent}`,
      }}
    >
      <span
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${accent}1F`, color: accent }}
      >
        <AlertTriangle size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold"
            style={{ color: accent }}
          >
            {isOver ? t("notifications.over") : t("notifications.warning")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {relative(n.createdAt)}
          </span>
        </div>
        {displayName && (
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {displayName}
          </p>
        )}
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {detail}
        </p>
      </div>
    </div>
  );

  if (n.eventId != null) {
    return (
      <Link
        href={`/events/${n.eventId}`}
        className="block cursor-pointer"
        aria-label={t("notifications.viewEvent")}
      >
        {body}
      </Link>
    );
  }
  return body;
}

export function NotificationsBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const ownerKey = useMemo(() => getOwnerKey(), []);
  const budgetThreshold = useMemo(() => readStoredThreshold(), []);
  const params = useMemo(
    () => ({ ownerKey, budgetThreshold }),
    [ownerKey, budgetThreshold],
  );

  const { data } = useListNotifications(params, {
    query: {
      queryKey: getListNotificationsQueryKey(params),
      refetchInterval: 60000,
      refetchOnWindowFocus: true,
    },
  });
  const markAll = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  const handleMarkAll = () => {
    if (unread === 0) return;
    markAll.mutate(
      { params: { ownerKey } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListNotificationsQueryKey(params),
          });
        },
      },
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t("notifications.aria")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <Bell size={18} strokeWidth={1.5} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-[16px] text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={10}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("notifications.title")}
          </h3>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markAll.isPending}
              className="flex items-center gap-1 text-[11px] font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <CheckCheck size={13} strokeWidth={1.8} />
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <ShieldCheck size={18} strokeWidth={1.6} />
            </span>
            <p className="text-sm font-medium text-foreground">
              {t("notifications.empty")}
            </p>
            <p className="text-[11px] leading-snug text-muted-foreground">
              {t("notifications.emptyHint")}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
