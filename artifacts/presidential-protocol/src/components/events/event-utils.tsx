import { palette } from "@/theme";
import type { Event } from "@workspace/api-client-react";
import { parseISO, format, differenceInHours } from "date-fns";
import {
  Plane,
  Users,
  Flag,
  Building2,
  ScrollText,
  Handshake,
  Crown,
  Shield,
  Landmark,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type Lang = "en" | "ar";

export const T = palette;

export type ViewMode = "year" | "month" | "week" | "day" | "list";

/* ── Localized field getters ─────────────────────────── */
export function evName(e: Event, lang: Lang): string {
  return lang === "en" ? e.name || e.nameAr || "" : e.nameAr || e.name || "";
}
export function evLocation(e: Event, lang: Lang): string {
  return lang === "en"
    ? e.location || e.locationAr || ""
    : e.locationAr || e.location || "";
}
export function evCountry(e: Event, lang: Lang): string {
  return lang === "en"
    ? e.country || e.countryAr || ""
    : e.countryAr || e.country || "";
}

export function parseEventDate(e: Event): Date {
  return parseISO(e.date);
}

/** Normalized calendar-day key (yyyy-MM-dd), safe for date-only or datetime strings. */
export function eventDateKey(e: Event): string {
  return format(parseISO(e.date), "yyyy-MM-dd");
}

/** Normalized month key (yyyy-MM), safe for date-only or datetime strings. */
export function eventMonthKey(e: Event): string {
  return format(parseISO(e.date), "yyyy-MM");
}

/** Minutes-from-midnight for an event's time; 9999 when no parseable time. */
export function eventTimeMinutes(e: Event): number {
  if (!e.time) return 9999;
  const m = e.time.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 9999;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (/(م|pm)/i.test(e.time) && h < 12) h += 12;
  if (/(ص|am)/i.test(e.time) && h === 12) h = 0;
  return h * 60 + min;
}

export function eventId(e: Event): string {
  return `EV-${String(e.id).padStart(3, "0")}`;
}

/* ── Readiness ───────────────────────────────────────── */
export type Band = "high" | "medium" | "low";
export function readinessBand(pct: number): Band {
  if (pct >= 80) return "high";
  if (pct >= 40) return "medium";
  return "low";
}
export function readinessColor(pct: number): string {
  const b = readinessBand(pct);
  return b === "high" ? T.mangrove : b === "medium" ? T.mediumWood : T.alert;
}

/* ── Status meta ─────────────────────────────────────── */
export function statusMeta(status: string): { color: string; bg: string } {
  switch (status) {
    case "confirmed":
      return { color: T.mangrove, bg: T.mangrove + "1A" };
    case "completed":
      return { color: T.calmTeal, bg: T.calmTeal + "22" };
    case "planned":
      return { color: T.castleHill, bg: T.castleHill + "1F" };
    case "cancelled":
      return { color: T.alert, bg: T.alert + "14" };
    case "upcoming":
    default:
      return { color: T.mediumWood, bg: T.sunset + "44" };
  }
}

/* ── Priority meta ───────────────────────────────────── */
export function priorityColor(priority: string | null | undefined): string {
  switch (priority) {
    case "urgent":
      return T.alert;
    case "high":
      return T.mediumWood;
    case "medium":
      return T.calmTeal;
    default:
      return T.castleHill;
  }
}

/* ── Event type meta ─────────────────────────────────── */
export function eventTypeMeta(type: string | null | undefined): {
  Icon: LucideIcon;
  color: string;
} {
  switch (type) {
    case "visitOfficial":
      return { Icon: Plane, color: T.mediumWood };
    case "delegationReception":
      return { Icon: Users, color: T.mangrove };
    case "nationalEvent":
      return { Icon: Flag, color: T.alert };
    case "protocolMeeting":
      return { Icon: ScrollText, color: T.calmTeal };
    case "coordinationMeeting":
      return { Icon: Handshake, color: T.castleHill };
    case "internalEvent":
    default:
      return { Icon: Building2, color: T.castleHill };
  }
}

/* ── VIP meta ────────────────────────────────────────── */
export function vipMeta(level: string | null | undefined): {
  Icon: LucideIcon;
  color: string;
} {
  switch (level) {
    case "headOfState":
      return { Icon: Crown, color: T.mediumWood };
    case "minister":
      return { Icon: Landmark, color: T.mangrove };
    case "ambassador":
      return { Icon: Shield, color: T.calmTeal };
    default:
      return { Icon: UserRound, color: T.castleHill };
  }
}

/* ── Color tags (manual color coding for pinned events) ── */
export const COLOR_TAGS = [
  "highPriority",
  "vipVisit",
  "nationalEvent",
  "internalEvent",
] as const;
export type ColorTag = (typeof COLOR_TAGS)[number];

export function colorTagColor(tag: string | null | undefined): string | null {
  switch (tag) {
    case "highPriority":
      return T.alert;
    case "vipVisit":
      return T.mediumWood;
    case "nationalEvent":
      return T.mangrove;
    case "internalEvent":
      return T.calmTeal;
    default:
      return null;
  }
}

/* ── Smart derived alerts (watch monitoring) ───────────── */
export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type EventAlert = {
  key: string;
  severity: AlertSeverity;
  i18nKey: string;
  params?: Record<string, string | number>;
};

export const alertSeverityRank: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function alertSeverityColor(s: AlertSeverity): string {
  switch (s) {
    case "critical":
      return T.alert;
    case "high":
      return T.mediumWood;
    case "medium":
      return T.calmTeal;
    default:
      return T.castleHill;
  }
}

/** Hours from `now` until the event's start (date + optional time). Negative when past. */
export function hoursUntilEvent(e: Event, now: Date = new Date()): number {
  const base = parseISO(e.date);
  let dt = base;
  const mins = eventTimeMinutes(e);
  if (mins !== 9999) {
    dt = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      Math.floor(mins / 60),
      mins % 60,
    );
  }
  return differenceInHours(dt, now);
}

/** Pure, client-side alert derivation from an event's own fields. */
export function deriveEventAlerts(e: Event, now: Date = new Date()): EventAlert[] {
  const out: EventAlert[] = [];
  const pct = e.readinessPercent ?? 0;
  const hrs = hoursUntilEvent(e, now);
  const imminent = hrs >= 0 && hrs <= 72;
  const done = e.status === "completed";

  if (!done && pct < 80) {
    out.push({
      key: "readinessLow",
      severity: pct < 40 ? "critical" : pct < 60 ? "high" : "medium",
      i18nKey: "pages.events.alerts.readinessLow",
      params: { pct },
    });
  }
  if (!done && e.riskLevel === "high") {
    out.push({
      key: "highRisk",
      severity: "high",
      i18nKey: "pages.events.alerts.highRisk",
    });
  }
  if (!done && imminent) {
    out.push({
      key: "imminent",
      severity: hrs <= 24 ? "high" : "medium",
      i18nKey: "pages.events.alerts.imminent",
    });
  }
  if (!done && (e.pendingTasksCount ?? 0) > 0) {
    out.push({
      key: "pendingTasks",
      severity: (e.pendingTasksCount ?? 0) >= 5 ? "high" : "medium",
      i18nKey: "pages.events.alerts.pendingTasks",
      params: { count: e.pendingTasksCount ?? 0 },
    });
  }
  if (!done && e.priority === "urgent") {
    out.push({
      key: "urgent",
      severity: "high",
      i18nKey: "pages.events.alerts.urgent",
    });
  }
  if (imminent && e.status !== "confirmed" && !done) {
    out.push({
      key: "notConfirmed",
      severity: "medium",
      i18nKey: "pages.events.alerts.notConfirmed",
    });
  }

  return out.sort(
    (a, b) => alertSeverityRank[a.severity] - alertSeverityRank[b.severity],
  );
}

/* ── Budget snapshot (shared with dashboard + event detail) ── */
export const BUDGET_THRESHOLD_MIN = 50;
export const BUDGET_THRESHOLD_MAX = 100;
export const BUDGET_THRESHOLD_DEFAULT = 90;

/** Read the officer-configured warning threshold (localStorage `budgetThreshold`). */
export function readBudgetThreshold(): number {
  if (typeof window === "undefined") return BUDGET_THRESHOLD_DEFAULT;
  const stored = Number(window.localStorage.getItem("budgetThreshold"));
  return Number.isFinite(stored) &&
    stored >= BUDGET_THRESHOLD_MIN &&
    stored <= BUDGET_THRESHOLD_MAX
    ? Math.round(stored)
    : BUDGET_THRESHOLD_DEFAULT;
}

export type BudgetStatus = "warning" | "over";

export type BudgetSnapshot = {
  status: BudgetStatus;
  estimated: number;
  actual: number;
  spentPercent: number;
  overBy: number;
  overByPercent: number;
  currency: string;
};

/**
 * Per-event budget status, mirroring the dashboard's `buildBudgetAlerts` and the
 * event detail page: "over" when actual spend exceeds the estimate, "warning"
 * when spend has reached the configured threshold percentage of a positive
 * estimate. Returns null for events comfortably within budget.
 */
export function eventBudgetSnapshot(
  e: Event,
  threshold: number = readBudgetThreshold(),
): BudgetSnapshot | null {
  const estimated = e.budgetEstimated ?? 0;
  const actual = e.budgetActual ?? 0;
  const isOver = estimated > 0 ? actual > estimated : actual > 0;
  const spentPercent =
    estimated > 0 ? Math.round((actual / estimated) * 100) : 0;
  const isWarning = !isOver && estimated > 0 && spentPercent >= threshold;
  if (!isOver && !isWarning) return null;
  const overBy = actual - estimated;
  return {
    status: isOver ? "over" : "warning",
    estimated,
    actual,
    spentPercent,
    overBy,
    overByPercent: estimated > 0 ? Math.round((overBy / estimated) * 100) : 0,
    currency: e.currency ?? "AED",
  };
}

export function budgetStatusColor(status: BudgetStatus): string {
  return status === "over" ? "#C84B38" : T.mediumWood;
}

/* ── Pinned sort (manual order, then date) ─────────────── */
export function pinnedSort(a: Event, b: Event): number {
  const ao = a.pinOrder ?? 0;
  const bo = b.pinOrder ?? 0;
  if (ao !== bo) return ao - bo;
  return a.date.localeCompare(b.date);
}

/* ── Search + filters ────────────────────────────────── */
export function matchesSearch(e: Event, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    e.name,
    e.nameAr,
    e.location,
    e.locationAr,
    e.country,
    e.countryAr,
    e.vipLevel,
    e.eventType,
    e.status,
    String(e.id),
    eventId(e),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export type Filters = {
  type: string;
  status: string;
  readiness: string;
  country: string;
  location: string;
  priority: string;
  vipLevel: string;
};

export const emptyFilters: Filters = {
  type: "all",
  status: "all",
  readiness: "all",
  country: "all",
  location: "all",
  priority: "all",
  vipLevel: "all",
};

export function activeFilterCount(f: Filters): number {
  return Object.values(f).filter((v) => v !== "all").length;
}

/* ── URL query-string persistence ────────────────────── */
/** Canonical order of filter keys for URL serialization. */
export const FILTER_KEYS: Array<keyof Filters> = [
  "type",
  "status",
  "readiness",
  "priority",
  "vipLevel",
  "country",
  "location",
];

/** Canonical list of valid calendar view modes (for URL validation). */
export const VIEW_MODES: ViewMode[] = ["year", "month", "week", "day", "list"];
/** Default view mode used when none is persisted in the URL. */
export const DEFAULT_VIEW: ViewMode = "month";

/** Optional calendar view state persisted alongside filters + search. */
export type EventsViewState = {
  view: ViewMode;
  anchor: Date;
  showCancelled: boolean;
};

/**
 * Build a query string (including leading "?") from the active filters, the
 * search term, and (optionally) the calendar view state — active view mode,
 * the anchored date, and the show-cancelled toggle. Only non-default values
 * are serialized so the URL stays clean on a fresh load.
 */
export function buildEventsSearch(
  filters: Filters,
  search: string,
  viewState?: EventsViewState,
): string {
  const params = new URLSearchParams();
  for (const k of FILTER_KEYS) {
    const v = filters[k];
    if (v && v !== "all") params.set(k, v);
  }
  const q = search.trim();
  if (q) params.set("q", q);
  if (viewState) {
    if (viewState.view && viewState.view !== DEFAULT_VIEW) {
      params.set("view", viewState.view);
    }
    if (viewState.anchor) {
      const dayKey = format(viewState.anchor, "yyyy-MM-dd");
      // Omit when the anchor is today so default loads keep a clean URL.
      if (dayKey !== format(new Date(), "yyyy-MM-dd")) {
        params.set("date", dayKey);
      }
    }
    if (viewState.showCancelled) params.set("cancelled", "1");
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Parse filters + search term + calendar view state out of a URL query string. */
export function parseEventsSearch(searchStr: string): {
  filters: Filters;
  search: string;
} & EventsViewState {
  const params = new URLSearchParams(searchStr);
  const filters: Filters = { ...emptyFilters };
  for (const k of FILTER_KEYS) {
    const v = params.get(k);
    if (v) filters[k] = v;
  }
  const viewParam = params.get("view");
  const view: ViewMode =
    viewParam && VIEW_MODES.includes(viewParam as ViewMode)
      ? (viewParam as ViewMode)
      : DEFAULT_VIEW;
  const dateParam = params.get("date");
  let anchor = new Date();
  if (dateParam) {
    const parsed = parseISO(dateParam);
    if (!Number.isNaN(parsed.getTime())) anchor = parsed;
  }
  const showCancelled = params.get("cancelled") === "1";
  return {
    filters,
    search: params.get("q") ?? "",
    view,
    anchor,
    showCancelled,
  };
}

export function applyFilters(e: Event, f: Filters): boolean {
  if (f.type !== "all" && e.eventType !== f.type) return false;
  if (f.status !== "all" && e.status !== f.status) return false;
  if (f.readiness !== "all" && readinessBand(e.readinessPercent) !== f.readiness)
    return false;
  if (f.country !== "all" && e.country !== f.country) return false;
  if (f.location !== "all" && e.location !== f.location) return false;
  if (f.priority !== "all" && e.priority !== f.priority) return false;
  if (f.vipLevel !== "all" && e.vipLevel !== f.vipLevel) return false;
  return true;
}

/** Unique option values keyed by canonical (English) value with localized label. */
export function uniqueOptions(
  events: Event[],
  pick: (e: Event) => string | null | undefined,
  label: (e: Event) => string,
): Array<{ value: string; label: string }> {
  const map = new Map<string, string>();
  for (const e of events) {
    const val = pick(e);
    if (val && !map.has(val)) map.set(val, label(e) || val);
  }
  return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}
