import { describe, it, expect } from "vitest";
import {
  computeBudgetNotificationChanges,
  budgetStatusRank,
  type PriorBudgetState,
} from "./budget-notifications";
import type { BudgetAlert } from "./budget";

function alert(overrides: Partial<BudgetAlert> = {}): BudgetAlert {
  return {
    eventId: 1,
    name: "Event",
    nameAr: null,
    estimated: 100,
    actual: 95,
    overBy: -5,
    overByPercent: -5,
    spentPercent: 95,
    status: "warning",
    currency: "AED",
    ...overrides,
  };
}

describe("budgetStatusRank", () => {
  it("orders none < warning < over", () => {
    expect(budgetStatusRank("none")).toBeLessThan(budgetStatusRank("warning"));
    expect(budgetStatusRank("warning")).toBeLessThan(budgetStatusRank("over"));
  });
});

describe("computeBudgetNotificationChanges", () => {
  it("notifies when an event first enters the warning state", () => {
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "warning", spentPercent: 92 })],
      [],
    );
    expect(toInsert).toHaveLength(1);
    expect(toInsert[0]).toMatchObject({ eventId: 1, status: "warning" });
    expect(stateUpserts).toEqual([{ eventId: 1, status: "warning" }]);
  });

  it("notifies when an event first goes over budget", () => {
    const { toInsert } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "over", overByPercent: 20 })],
      [],
    );
    expect(toInsert).toHaveLength(1);
    expect(toInsert[0]).toMatchObject({ eventId: 1, status: "over" });
  });

  it("does NOT re-notify when the state is unchanged (dedup)", () => {
    const prior: PriorBudgetState[] = [{ eventId: 1, status: "warning" }];
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "warning" })],
      prior,
    );
    expect(toInsert).toEqual([]);
    expect(stateUpserts).toEqual([]);
  });

  it("notifies on escalation from warning to over", () => {
    const prior: PriorBudgetState[] = [{ eventId: 1, status: "warning" }];
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "over" })],
      prior,
    );
    expect(toInsert).toHaveLength(1);
    expect(toInsert[0]).toMatchObject({ status: "over" });
    expect(stateUpserts).toEqual([{ eventId: 1, status: "over" }]);
  });

  it("does NOT notify on de-escalation from over to warning, but updates state", () => {
    const prior: PriorBudgetState[] = [{ eventId: 1, status: "over" }];
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "warning" })],
      prior,
    );
    expect(toInsert).toEqual([]);
    expect(stateUpserts).toEqual([{ eventId: 1, status: "warning" }]);
  });

  it("resets recovered events to none without notifying", () => {
    const prior: PriorBudgetState[] = [{ eventId: 1, status: "over" }];
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      [],
      prior,
    );
    expect(toInsert).toEqual([]);
    expect(stateUpserts).toEqual([{ eventId: 1, status: "none" }]);
  });

  it("re-notifies after an event recovers and crosses again", () => {
    // Event recovered: stored state is now "none".
    const prior: PriorBudgetState[] = [{ eventId: 1, status: "none" }];
    const { toInsert } = computeBudgetNotificationChanges(
      [alert({ eventId: 1, status: "over" })],
      prior,
    );
    expect(toInsert).toHaveLength(1);
    expect(toInsert[0]).toMatchObject({ status: "over" });
  });

  it("handles a mix of new, unchanged, escalating and recovered events", () => {
    const prior: PriorBudgetState[] = [
      { eventId: 1, status: "warning" }, // unchanged
      { eventId: 2, status: "warning" }, // escalates to over
      { eventId: 3, status: "over" }, // recovered (absent from alerts)
    ];
    const alerts: BudgetAlert[] = [
      alert({ eventId: 1, status: "warning" }),
      alert({ eventId: 2, status: "over" }),
      alert({ eventId: 4, status: "warning" }), // brand new
    ];
    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      alerts,
      prior,
    );
    expect(toInsert.map((d) => d.eventId).sort()).toEqual([2, 4]);
    expect(
      stateUpserts.map((s) => `${s.eventId}:${s.status}`).sort(),
    ).toEqual(["2:over", "3:none", "4:warning"]);
  });
});
