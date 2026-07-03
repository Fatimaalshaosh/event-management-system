// Pure budget aggregation helpers, decoupled from the database so they can be
// unit-tested in isolation.

export type BudgetEventRow = {
  eventId: number;
  name: string;
  nameAr: string | null;
  estimated: number;
  actual: number;
  currency: string;
};

// "over" means actual spend has exceeded the estimate. "warning" means spend is
// approaching the estimate (>= the configured threshold) but has not exceeded
// it yet — an early heads-up so officers can act before going over budget.
export type BudgetAlertStatus = "warning" | "over";

export type BudgetAlert = {
  eventId: number;
  name: string;
  nameAr: string | null;
  estimated: number;
  actual: number;
  overBy: number;
  overByPercent: number;
  spentPercent: number;
  status: BudgetAlertStatus;
  currency: string;
};

// Default threshold (percent of estimate) at which an event begins to show a
// budget warning. Officers can tune this; values are clamped to a sane range.
export const DEFAULT_BUDGET_THRESHOLD_PERCENT = 90;
export const MIN_BUDGET_THRESHOLD_PERCENT = 50;
export const MAX_BUDGET_THRESHOLD_PERCENT = 100;

// Clamp an arbitrary (possibly user-supplied) threshold into the supported
// range, falling back to the default when the value is missing or invalid.
export function normalizeBudgetThreshold(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || !Number.isFinite(n)) {
    return DEFAULT_BUDGET_THRESHOLD_PERCENT;
  }
  return Math.min(
    MAX_BUDGET_THRESHOLD_PERCENT,
    Math.max(MIN_BUDGET_THRESHOLD_PERCENT, Math.round(n)),
  );
}

// Detect per-event budget situations relative to a configurable warning
// threshold. An event is flagged when its actual spend has either exceeded the
// estimate ("over") or reached the threshold percentage of the estimate
// ("warning"). Over-budget events sort first, then by the heaviest spend.
export function buildBudgetAlerts(
  rows: BudgetEventRow[],
  warnThresholdPercent: number = DEFAULT_BUDGET_THRESHOLD_PERCENT,
): BudgetAlert[] {
  const threshold = normalizeBudgetThreshold(warnThresholdPercent);

  return rows
    .map((r) => {
      const overBy = r.actual - r.estimated;
      const spentPercent =
        r.estimated > 0 ? Math.round((r.actual / r.estimated) * 100) : 0;
      const isOver = r.estimated > 0 ? r.actual > r.estimated : r.actual > 0;
      const status: BudgetAlertStatus = isOver ? "over" : "warning";
      return {
        eventId: r.eventId,
        name: r.name,
        nameAr: r.nameAr,
        estimated: r.estimated,
        actual: r.actual,
        overBy,
        overByPercent:
          r.estimated > 0 ? Math.round((overBy / r.estimated) * 100) : 0,
        spentPercent,
        status,
        currency: r.currency,
      };
    })
    .filter((a) => {
      if (a.status === "over") return true;
      // Warning state requires a positive estimate to measure against.
      return a.estimated > 0 && a.spentPercent >= threshold;
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "over" ? -1 : 1;
      return b.spentPercent - a.spentPercent || b.overBy - a.overBy;
    });
}
