import { describe, it, expect } from "vitest";
import {
  buildOpsRoomAlerts,
  buildOpsRoomSnapshot,
  type AlertSeverity,
  type OpsRoomInput,
} from "./ops-room";

const VALID_SEVERITIES: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

function makeInput(overrides: Partial<OpsRoomInput> = {}): OpsRoomInput {
  return {
    eventId: 1,
    readinessPercent: 80,
    readinessCategories: [],
    tasks: [],
    approvals: [],
    risks: [],
    invitations: [],
    participants: [],
    guests: [],
    budget: [],
    travelCount: 0,
    hotelCount: 0,
    fleetCount: 0,
    giftsCount: 0,
    documentsCount: 0,
    today: "2026-06-09",
    ...overrides,
  };
}

describe("buildOpsRoomSnapshot aggregation", () => {
  it("aggregates task totals including overdue detection", () => {
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        tasks: [
          { status: "done", dueDate: "2026-01-01" },
          { status: "completed", dueDate: null },
          { status: "pending", dueDate: "2026-01-01" }, // overdue (before today)
          { status: "pending", dueDate: "2026-12-31" }, // not overdue
          { status: "in_progress", dueDate: null }, // pending, no due date
        ],
      }),
    );

    expect(snapshot.tasks).toEqual({
      total: 5,
      done: 2,
      pending: 3,
      overdue: 1,
    });
  });

  it("aggregates risk totals and severity breakdown", () => {
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        risks: [
          { status: "open", severity: "critical" },
          { status: "open", severity: "high" },
          { status: "mitigated", severity: "high" },
          { status: "closed", severity: "low" },
          { status: "open", severity: "medium" },
        ],
      }),
    );

    expect(snapshot.risks).toEqual({
      total: 5,
      open: 3,
      critical: 1,
      high: 2,
      medium: 1,
      low: 1,
    });
  });

  it("aggregates arrivals, approvals, participants and guests", () => {
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        invitations: [
          { status: "accepted", attended: true },
          { status: "declined", attended: false },
          { status: "pending", attended: false },
          { status: "accepted", attended: false },
        ],
        approvals: [
          { status: "pending" },
          { status: "approved" },
          { status: "pending" },
        ],
        participants: [
          { category: "internal" },
          { category: "external" },
          { category: "internal" },
        ],
        guests: [
          { attended: true, vipVerified: true },
          { attended: false, vipVerified: true },
          { attended: true, vipVerified: false },
        ],
      }),
    );

    expect(snapshot.arrivals).toEqual({
      total: 4,
      accepted: 2,
      declined: 1,
      pending: 1,
      attended: 1,
    });
    expect(snapshot.approvals).toEqual({ total: 3, pending: 2 });
    expect(snapshot.participants).toEqual({
      total: 3,
      internal: 2,
      external: 1,
    });
    expect(snapshot.guests).toEqual({ total: 3, checkedIn: 2, verified: 2 });
  });

  it("aggregates logistics counts and budget totals", () => {
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        travelCount: 3,
        hotelCount: 2,
        fleetCount: 4,
        giftsCount: 1,
        documentsCount: 5,
        budget: [
          { estimatedCost: 1000, actualCost: 900, currency: "USD" },
          { estimatedCost: 500, actualCost: null, currency: "USD" },
          { estimatedCost: null, actualCost: 200, currency: "USD" },
        ],
      }),
    );

    expect(snapshot.logistics).toEqual({
      flight: 3,
      hotel: 2,
      transport: 4,
      gifts: 1,
      documents: 5,
      budgetEstimated: 1500,
      budgetActual: 1100,
      currency: "USD",
    });
  });

  it("defaults currency to AED when there are no budget items", () => {
    const snapshot = buildOpsRoomSnapshot(makeInput({ budget: [] }));
    expect(snapshot.logistics.currency).toBe("AED");
    expect(snapshot.logistics.budgetEstimated).toBe(0);
    expect(snapshot.logistics.budgetActual).toBe(0);
  });

  it("passes through eventId, readinessPercent and categories", () => {
    const categories = [{ id: 1, name: "Security" }];
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        eventId: 42,
        readinessPercent: 73,
        readinessCategories: categories,
      }),
    );

    expect(snapshot.eventId).toBe(42);
    expect(snapshot.readinessPercent).toBe(73);
    expect(snapshot.readinessCategories).toBe(categories);
  });
});

describe("ops-room derived alerts", () => {
  it("emits the expected severity for each trigger", () => {
    const alerts = buildOpsRoomAlerts({
      readinessPercent: 30,
      overdueTasks: 2,
      criticalRisks: 1,
      pendingApprovals: 3,
      pendingArrivals: 4,
    });

    const bySeverity = alerts.map((a) => a.severity).sort();
    expect(bySeverity).toEqual(["critical", "high", "high", "low", "medium"]);
  });

  it("emits no alerts when nothing is wrong", () => {
    const alerts = buildOpsRoomAlerts({
      readinessPercent: 90,
      overdueTasks: 0,
      criticalRisks: 0,
      pendingApprovals: 0,
      pendingArrivals: 0,
    });

    expect(alerts).toEqual([]);
  });

  it("only ever emits critical|high|medium|low severities", () => {
    // Exercise the alert builder across a range of inputs and assert no other
    // severity value can leak out.
    const scenarios: Parameters<typeof buildOpsRoomAlerts>[0][] = [
      { readinessPercent: 49, overdueTasks: 0, criticalRisks: 0, pendingApprovals: 0, pendingArrivals: 0 },
      { readinessPercent: 50, overdueTasks: 5, criticalRisks: 0, pendingApprovals: 0, pendingArrivals: 0 },
      { readinessPercent: 100, overdueTasks: 0, criticalRisks: 9, pendingApprovals: 0, pendingArrivals: 0 },
      { readinessPercent: 100, overdueTasks: 0, criticalRisks: 0, pendingApprovals: 1, pendingArrivals: 0 },
      { readinessPercent: 100, overdueTasks: 0, criticalRisks: 0, pendingApprovals: 0, pendingArrivals: 7 },
      { readinessPercent: 10, overdueTasks: 3, criticalRisks: 2, pendingApprovals: 1, pendingArrivals: 6 },
    ];

    for (const scenario of scenarios) {
      for (const alert of buildOpsRoomAlerts(scenario)) {
        expect(VALID_SEVERITIES).toContain(alert.severity);
      }
    }
  });

  it("surfaces alerts through the full snapshot", () => {
    const snapshot = buildOpsRoomSnapshot(
      makeInput({
        readinessPercent: 20,
        risks: [{ status: "open", severity: "critical" }],
      }),
    );

    for (const alert of snapshot.alerts) {
      expect(VALID_SEVERITIES).toContain(alert.severity);
    }
    expect(snapshot.alerts.some((a) => a.severity === "critical")).toBe(true);
    expect(snapshot.alerts.some((a) => a.severity === "high")).toBe(true);
  });
});
