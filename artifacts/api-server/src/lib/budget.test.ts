import { describe, it, expect } from "vitest";
import {
  buildBudgetAlerts,
  normalizeBudgetThreshold,
  DEFAULT_BUDGET_THRESHOLD_PERCENT,
  type BudgetEventRow,
} from "./budget";

function row(overrides: Partial<BudgetEventRow> = {}): BudgetEventRow {
  return {
    eventId: 1,
    name: "Event",
    nameAr: null,
    estimated: 100,
    actual: 100,
    currency: "AED",
    ...overrides,
  };
}

describe("buildBudgetAlerts", () => {
  it("returns no alerts when no event reaches the threshold", () => {
    const alerts = buildBudgetAlerts(
      [
        row({ eventId: 1, estimated: 100, actual: 50 }),
        row({ eventId: 2, estimated: 100, actual: 80 }),
      ],
      90,
    );
    expect(alerts).toEqual([]);
  });

  it("flags events whose actual exceeds estimated as 'over'", () => {
    const alerts = buildBudgetAlerts(
      [
        row({ eventId: 1, estimated: 100, actual: 150 }),
        row({ eventId: 2, estimated: 100, actual: 50 }),
      ],
      90,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.eventId).toBe(1);
    expect(alerts[0]?.status).toBe("over");
    expect(alerts[0]?.overBy).toBe(50);
    expect(alerts[0]?.overByPercent).toBe(50);
    expect(alerts[0]?.spentPercent).toBe(150);
  });

  it("flags events at or above the threshold but not over as 'warning'", () => {
    const alerts = buildBudgetAlerts(
      [
        row({ eventId: 1, estimated: 100, actual: 95 }),
        row({ eventId: 2, estimated: 100, actual: 100 }),
        row({ eventId: 3, estimated: 100, actual: 60 }),
      ],
      90,
    );
    expect(alerts.map((a) => a.eventId)).toEqual([2, 1]);
    expect(alerts.every((a) => a.status === "warning")).toBe(true);
    expect(alerts[0]?.spentPercent).toBe(100);
  });

  it("respects a custom threshold", () => {
    const rows = [row({ eventId: 1, estimated: 100, actual: 75 })];
    expect(buildBudgetAlerts(rows, 90)).toHaveLength(0);
    expect(buildBudgetAlerts(rows, 70)).toHaveLength(1);
    expect(buildBudgetAlerts(rows, 70)[0]?.status).toBe("warning");
  });

  it("sorts over-budget events first, then warnings, by heaviest spend", () => {
    const alerts = buildBudgetAlerts(
      [
        row({ eventId: 1, estimated: 100, actual: 95 }),
        row({ eventId: 2, estimated: 100, actual: 300 }),
        row({ eventId: 3, estimated: 100, actual: 150 }),
        row({ eventId: 4, estimated: 100, actual: 92 }),
      ],
      90,
    );
    expect(alerts.map((a) => a.eventId)).toEqual([2, 3, 1, 4]);
    expect(alerts.map((a) => a.status)).toEqual([
      "over",
      "over",
      "warning",
      "warning",
    ]);
  });

  it("reports 0 percent when the estimate is zero to avoid divide-by-zero", () => {
    const alerts = buildBudgetAlerts(
      [row({ eventId: 1, estimated: 0, actual: 500 })],
      90,
    );
    expect(alerts[0]?.status).toBe("over");
    expect(alerts[0]?.overBy).toBe(500);
    expect(alerts[0]?.overByPercent).toBe(0);
    expect(alerts[0]?.spentPercent).toBe(0);
  });

  it("does not warn on a zero estimate with zero spend", () => {
    const alerts = buildBudgetAlerts(
      [row({ eventId: 1, estimated: 0, actual: 0 })],
      90,
    );
    expect(alerts).toEqual([]);
  });

  it("preserves bilingual name fields and currency", () => {
    const alerts = buildBudgetAlerts(
      [
        row({
          eventId: 7,
          name: "State Dinner",
          nameAr: "مأدبة رسمية",
          estimated: 200,
          actual: 260,
          currency: "USD",
        }),
      ],
      90,
    );
    expect(alerts[0]).toMatchObject({
      name: "State Dinner",
      nameAr: "مأدبة رسمية",
      currency: "USD",
    });
  });
});

describe("normalizeBudgetThreshold", () => {
  it("falls back to the default for invalid input", () => {
    expect(normalizeBudgetThreshold(undefined)).toBe(
      DEFAULT_BUDGET_THRESHOLD_PERCENT,
    );
    expect(normalizeBudgetThreshold("not-a-number")).toBe(
      DEFAULT_BUDGET_THRESHOLD_PERCENT,
    );
    expect(normalizeBudgetThreshold(NaN)).toBe(
      DEFAULT_BUDGET_THRESHOLD_PERCENT,
    );
  });

  it("clamps to the supported range", () => {
    expect(normalizeBudgetThreshold(10)).toBe(50);
    expect(normalizeBudgetThreshold(200)).toBe(100);
    expect(normalizeBudgetThreshold("85")).toBe(85);
  });
});
