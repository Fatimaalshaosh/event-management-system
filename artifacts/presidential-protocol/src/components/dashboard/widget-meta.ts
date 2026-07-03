import { palette } from "@/theme";
import {
  Gauge,
  CalendarDays,
  Flag,
  ListChecks,
  Star,
  Eye,
  Radar,
  BarChart3,
  AlertTriangle,
  FileText,
  Sparkles,
  CheckSquare,
  Download,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DashboardWidgetConfig } from "@workspace/api-client-react";

export type WidgetId =
  | "readinessTracker"
  | "upcomingEvents"
  | "officialVisits"
  | "upcomingTasks"
  | "favoriteEvents"
  | "smartMonitoring"
  | "watchedEvents"
  | "weeklySummary"
  | "activeRisks"
  | "recentReports"
  | "executiveAI"
  | "pendingApprovals"
  | "quickExport"
  | "smartActions";

/** A widget's placement on the 12-column grid (react-grid-layout coordinates). */
export type WidgetItem = {
  id: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  hidden: boolean;
};

export type WidgetMeta = {
  id: WidgetId;
  titleEn: string;
  titleAr: string;
  icon: LucideIcon;
  accent: string;
};

const ACCENTS = palette;

/* ── Grid geometry ──────────────────────────────────────────────
 * 12 columns. A column-pair layout means each "half" widget is 6 wide.
 * rowHeight is 56px (see customizable-grid), so h-units below translate
 * to roughly: h=4 ≈ short card, h=5 ≈ list card, h=7 ≈ tall ring card. */
export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 56;
export const GRID_MARGIN = 22;

/**
 * Structured Executive Command Center grid. Every widget occupies one
 * half-width (6 of 12 columns) slot at a single uniform height. There is no
 * per-widget resizing and no free-form placement: officers can only reorder
 * widgets between fixed slots, hide them, and show them. The result is always a
 * clean, balanced two-up executive grid — never a Pinterest/masonry stagger.
 */
export const UNIFORM_H = 5;
export const HALF_W = GRID_COLS / 2;

/** Canonical widget catalogue — order here is the master/default order. */
export const WIDGET_META: Record<WidgetId, WidgetMeta> = {
  readinessTracker: { id: "readinessTracker", titleEn: "Event Readiness", titleAr: "جاهزية الفعالية", icon: Gauge, accent: ACCENTS.mangrove },
  weeklySummary:    { id: "weeklySummary", titleEn: "Weekly Summary", titleAr: "الملخص الأسبوعي", icon: BarChart3, accent: ACCENTS.calmTeal },
  upcomingEvents:   { id: "upcomingEvents", titleEn: "Upcoming Events", titleAr: "الفعاليات القادمة", icon: CalendarDays, accent: ACCENTS.calmTeal },
  officialVisits:   { id: "officialVisits", titleEn: "Official Visits", titleAr: "الزيارات الرسمية", icon: Flag, accent: ACCENTS.castleHill },
  executiveAI:      { id: "executiveAI", titleEn: "Executive Intelligence", titleAr: "مركز الذكاء التنفيذي", icon: Sparkles, accent: ACCENTS.mediumWood },
  activeRisks:      { id: "activeRisks", titleEn: "Active Risks", titleAr: "المخاطر النشطة", icon: AlertTriangle, accent: ACCENTS.alert },
  upcomingTasks:    { id: "upcomingTasks", titleEn: "Upcoming Tasks", titleAr: "المهام القادمة", icon: ListChecks, accent: ACCENTS.mangrove },
  pendingApprovals: { id: "pendingApprovals", titleEn: "Pending Approvals", titleAr: "الموافقات المعلقة", icon: CheckSquare, accent: ACCENTS.alert },
  favoriteEvents:   { id: "favoriteEvents", titleEn: "Favorite Events", titleAr: "فعالياتي المفضلة", icon: Star, accent: ACCENTS.gold },
  smartMonitoring:  { id: "smartMonitoring", titleEn: "Smart Monitoring", titleAr: "المراقبة الذكية", icon: Eye, accent: ACCENTS.calmTeal },
  watchedEvents:    { id: "watchedEvents", titleEn: "Watched Events", titleAr: "الفعاليات المتابَعة", icon: Radar, accent: ACCENTS.calmTeal },
  recentReports:    { id: "recentReports", titleEn: "Recent Reports", titleAr: "أحدث التقارير", icon: FileText, accent: ACCENTS.mediumWood },
  quickExport:      { id: "quickExport", titleEn: "Quick Export", titleAr: "تصدير سريع", icon: Download, accent: ACCENTS.castleHill },
  smartActions:     { id: "smartActions", titleEn: "Smart Actions", titleAr: "إجراءات ذكية", icon: Zap, accent: ACCENTS.mediumWood },
};

/** Catalogue order — the master order used for parking hidden widgets. */
export const WIDGET_ORDER = Object.keys(WIDGET_META) as WidgetId[];

/* ── Canonical two-column distribution ──────────────────────────────
 * The dashboard renders a deterministic two-column grid. Every widget has a
 * fixed home column and display order. The renderer (customizable-grid) places
 * each visible widget into its column, so the board is ALWAYS balanced and
 * fills both sides — independent of any stored react-grid coordinates.
 *
 * RTL note: the first column ("right") renders on the right in Arabic (dir=rtl)
 * and on the left in English (dir=ltr) — CSS Grid handles the mirroring, so
 * officers always read the primary column first.
 */
export const RIGHT_COLUMN: WidgetId[] = [
  "readinessTracker",
  "upcomingTasks",
  "executiveAI",
  "favoriteEvents",
  "weeklySummary",
  "upcomingEvents",
  "smartActions",
];

export const LEFT_COLUMN: WidgetId[] = [
  "activeRisks",
  "officialVisits",
  "pendingApprovals",
  "recentReports",
  "quickExport",
  "smartMonitoring",
  "watchedEvents",
];

/** Split an unordered set of visible widget ids into the two canonical columns,
 * each ordered by its column's display sequence. */
export function splitColumns(visibleIds: WidgetId[]): {
  right: WidgetId[];
  left: WidgetId[];
} {
  const set = new Set(visibleIds);
  return {
    right: RIGHT_COLUMN.filter((id) => set.has(id)),
    left: LEFT_COLUMN.filter((id) => set.has(id)),
  };
}

/**
 * Lay a list of widget ids into a balanced two-column grid: two half-width
 * (w=6) cards per row, all at the uniform height, so every row is an even band
 * with no stagger. Any catalogue widget not in the list is parked below as
 * hidden, ready to be re-added from the customize panel. The stored geometry is
 * already hole-free, so react-grid-layout emits no delta on first mount (no
 * phantom autosave / dirty flag).
 */
export function pairLayout(visibleIds: WidgetId[]): WidgetItem[] {
  const placed: WidgetItem[] = [];
  visibleIds.forEach((id, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    placed.push({
      id,
      x: col === 0 ? 0 : 6,
      y: row * UNIFORM_H,
      w: 6,
      h: UNIFORM_H,
      hidden: false,
    });
  });
  let parkY = Math.ceil(visibleIds.length / 2) * UNIFORM_H;
  const visible = new Set(visibleIds);
  for (const id of WIDGET_ORDER) {
    if (visible.has(id)) continue;
    placed.push({ id, x: 0, y: parkY, w: 6, h: UNIFORM_H, hidden: true });
    parkY += UNIFORM_H;
  }
  return placed;
}

/**
 * Balanced default Executive Command Center layout — five clean rows of two
 * half-width widgets (per spec). Equal heights, no gaps, no floating cards.
 */
const DEFAULT_VISIBLE: WidgetId[] = [
  // Right column (primary): readiness, tasks, executive brief, favorites
  "readinessTracker",
  "upcomingTasks",
  "executiveAI",
  "favoriteEvents",
  // Left column: risks, visits, approvals, reports, export
  "activeRisks",
  "officialVisits",
  "pendingApprovals",
  "recentReports",
  "quickExport",
];

/** Hole-free default layout: the 5×2 grid, with extras parked hidden. */
export const DEFAULT_ITEMS: WidgetItem[] = pairLayout(DEFAULT_VISIBLE);

export const ALL_WIDGET_IDS = WIDGET_ORDER;

export type ProfileTemplate = {
  key: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  items: WidgetItem[];
};

/**
 * Predefined executive dashboard templates seeded on first load. Officers
 * switch between them instantly. "Executive View" is the comprehensive balanced
 * 5×2 board; the others are focused two-up bands drawn from the widget
 * catalogue. Every template is hole-free and balanced by construction.
 */
export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    key: "executive",
    nameEn: "Executive View",
    nameAr: "العرض التنفيذي",
    icon: "Crown",
    items: DEFAULT_ITEMS.map((w) => ({ ...w })),
  },
  {
    key: "protocol",
    nameEn: "Protocol View",
    nameAr: "عرض المراسم",
    icon: "Landmark",
    items: pairLayout([
      "officialVisits",
      "upcomingEvents",
      "pendingApprovals",
      "favoriteEvents",
    ]),
  },
  {
    key: "logistics",
    nameEn: "Logistics View",
    nameAr: "عرض اللوجستيات",
    icon: "Truck",
    items: pairLayout([
      "officialVisits",
      "upcomingTasks",
      "smartMonitoring",
      "watchedEvents",
    ]),
  },
  {
    key: "eventDay",
    nameEn: "Event Day View",
    nameAr: "عرض يوم الفعالية",
    icon: "Siren",
    items: pairLayout([
      "readinessTracker",
      "smartMonitoring",
      "activeRisks",
      "watchedEvents",
    ]),
  },
];

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Reconcile a stored config against the catalogue:
 *  - drop unknown ids and de-duplicate
 *  - recover the officer's arrangement order from stored coordinates
 *    (top-to-bottom, then start-to-end) and which widgets were hidden
 *  - re-lay everything into the canonical balanced two-up grid via pairLayout,
 *    so width, height and position are normalized to the uniform half-width
 *    slot. Any layout saved under an older mixed-size/masonry model therefore
 *    snaps back to clean, equal bands with no gaps or overlaps.
 *  - a brand-new (empty) profile gets the full default board
 *  - catalogue widgets the profile never had are parked hidden (so a saved
 *    layout is never disrupted when a new widget ships)
 */
export function reconcileItems(stored: DashboardWidgetConfig[] | undefined | null): WidgetItem[] {
  const hadStored = !!stored && stored.length > 0;
  if (!hadStored) return DEFAULT_ITEMS.map((w) => ({ ...w }));
  const known = (stored ?? []).filter((w) =>
    (ALL_WIDGET_IDS as string[]).includes(w.id),
  );
  const ordered = known
    .map((w, i) => ({
      id: w.id as WidgetId,
      hidden: !!w.hidden,
      y: isNum(w.y) ? (w.y as number) : i,
      x: isNum(w.x) ? (w.x as number) : 0,
      seq: i,
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x || a.seq - b.seq);
  const visibleIds = [
    ...new Set(ordered.filter((w) => !w.hidden).map((w) => w.id)),
  ];
  return pairLayout(visibleIds);
}
