// Pure helpers that decide which budget notifications to create, decoupled from
// the database so they can be unit-tested in isolation.

import type { BudgetAlert, BudgetAlertStatus } from "./budget";

// A budget situation an event can be in, relative to the warning threshold.
export type BudgetStatus = "none" | "warning" | "over";

const RANK: Record<BudgetStatus, number> = { none: 0, warning: 1, over: 2 };

// Order severities so escalations can be detected by a simple comparison.
export function budgetStatusRank(status: BudgetStatus): number {
  return RANK[status];
}

export type PriorBudgetState = { eventId: number; status: BudgetStatus };

export type BudgetNotificationDraft = {
  eventId: number;
  status: BudgetAlertStatus;
  spentPercent: number;
  overByPercent: number;
  estimated: number;
  actual: number;
  currency: string;
  eventName: string;
  eventNameAr: string | null;
};

export type BudgetNotificationChanges = {
  // Notifications to insert into the feed (escalations only).
  toInsert: BudgetNotificationDraft[];
  // Per-event states to persist so future evaluations can deduplicate.
  stateUpserts: { eventId: number; status: BudgetStatus }[];
};

// Diff the current budget alerts against the last-known per-event states and
// decide which notifications to create.
//
// A notification is created only when an event ESCALATES into a worse budget
// state (none -> warning, warning -> over, none -> over). De-escalation and
// recovery update the stored state silently (no notification) so that a later
// re-crossing into a worse state notifies again rather than staying suppressed.
export function computeBudgetNotificationChanges(
  alerts: BudgetAlert[],
  priorStates: PriorBudgetState[],
): BudgetNotificationChanges {
  const priorMap = new Map<number, BudgetStatus>();
  for (const s of priorStates) priorMap.set(s.eventId, s.status);

  const toInsert: BudgetNotificationDraft[] = [];
  const stateUpserts: { eventId: number; status: BudgetStatus }[] = [];
  const seen = new Set<number>();

  for (const a of alerts) {
    seen.add(a.eventId);
    const current: BudgetStatus = a.status;
    const prior = priorMap.get(a.eventId) ?? "none";
    if (current === prior) continue;

    stateUpserts.push({ eventId: a.eventId, status: current });

    if (budgetStatusRank(current) > budgetStatusRank(prior)) {
      toInsert.push({
        eventId: a.eventId,
        status: a.status,
        spentPercent: a.spentPercent,
        overByPercent: a.overByPercent,
        estimated: a.estimated,
        actual: a.actual,
        currency: a.currency,
        eventName: a.name,
        eventNameAr: a.nameAr,
      });
    }
  }

  // Events that previously had an alert state but are no longer alerting have
  // recovered below the threshold — reset their stored state to "none". No
  // notification is produced for recovery.
  for (const s of priorStates) {
    if (seen.has(s.eventId)) continue;
    if (s.status !== "none") {
      stateUpserts.push({ eventId: s.eventId, status: "none" });
    }
  }

  return { toInsert, stateUpserts };
}
