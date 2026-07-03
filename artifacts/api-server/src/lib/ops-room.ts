// Pure ops-room aggregation helpers, decoupled from the database so they can be
// unit-tested in isolation.

import { isDone } from "./readiness";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type Alert = {
  severity: AlertSeverity;
  message: string;
  messageAr: string;
};

type TaskRow = { status: string; dueDate: string | null };
type RiskRow = { status: string; severity: string };
type InvitationRow = { status: string; attended: boolean };
type ApprovalRow = { status: string };
type ParticipantRow = { category: string };
type GuestRow = { attended: boolean; vipVerified: boolean };
type BudgetRow = {
  estimatedCost: number | null;
  actualCost: number | null;
  currency: string;
};

export type OpsRoomInput = {
  eventId: number;
  readinessPercent: number;
  readinessCategories: unknown[];
  tasks: TaskRow[];
  approvals: ApprovalRow[];
  risks: RiskRow[];
  invitations: InvitationRow[];
  participants: ParticipantRow[];
  guests: GuestRow[];
  budget: BudgetRow[];
  travelCount: number;
  hotelCount: number;
  fleetCount: number;
  giftsCount: number;
  documentsCount: number;
  // ISO date (YYYY-MM-DD) used to flag overdue tasks.
  today: string;
};

export type AlertInput = {
  readinessPercent: number;
  overdueTasks: number;
  criticalRisks: number;
  pendingApprovals: number;
  pendingArrivals: number;
};

// Derive the prioritized alert list. Severities are constrained to the
// AlertSeverity union so callers can rely on a fixed set of values.
export function buildOpsRoomAlerts(input: AlertInput): Alert[] {
  const alerts: Alert[] = [];

  if (input.readinessPercent < 50) {
    alerts.push({
      severity: "high",
      message: `Overall readiness is low (${input.readinessPercent}%).`,
      messageAr: `الجاهزية العامة منخفضة (${input.readinessPercent}٪).`,
    });
  }
  if (input.overdueTasks > 0) {
    alerts.push({
      severity: "high",
      message: `${input.overdueTasks} task(s) are overdue.`,
      messageAr: `${input.overdueTasks} مهمة متأخرة عن موعدها.`,
    });
  }
  if (input.criticalRisks > 0) {
    alerts.push({
      severity: "critical",
      message: `${input.criticalRisks} critical risk(s) require attention.`,
      messageAr: `${input.criticalRisks} مخاطر حرجة تتطلب المعالجة.`,
    });
  }
  if (input.pendingApprovals > 0) {
    alerts.push({
      severity: "medium",
      message: `${input.pendingApprovals} approval(s) awaiting decision.`,
      messageAr: `${input.pendingApprovals} موافقة بانتظار القرار.`,
    });
  }
  if (input.pendingArrivals > 0) {
    alerts.push({
      severity: "low",
      message: `${input.pendingArrivals} invitation(s) still pending RSVP.`,
      messageAr: `${input.pendingArrivals} دعوة بانتظار الرد.`,
    });
  }

  return alerts;
}

// Build the full ops-room snapshot payload from already-fetched event data.
export function buildOpsRoomSnapshot(input: OpsRoomInput) {
  const { tasks, risks, invitations, approvals, participants, guests, budget } =
    input;

  const tasksSummary = {
    total: tasks.length,
    done: tasks.filter((t) => isDone(t.status)).length,
    pending: tasks.filter((t) => !isDone(t.status)).length,
    overdue: tasks.filter(
      (t) => !isDone(t.status) && t.dueDate != null && t.dueDate < input.today,
    ).length,
  };

  const risksSummary = {
    total: risks.length,
    open: risks.filter((r) => r.status !== "closed" && r.status !== "mitigated")
      .length,
    critical: risks.filter((r) => r.severity === "critical").length,
    high: risks.filter((r) => r.severity === "high").length,
    medium: risks.filter((r) => r.severity === "medium").length,
    low: risks.filter((r) => r.severity === "low").length,
  };

  const arrivals = {
    total: invitations.length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    declined: invitations.filter((i) => i.status === "declined").length,
    pending: invitations.filter((i) => i.status === "pending").length,
    attended: invitations.filter((i) => i.attended).length,
  };

  const budgetEstimated = budget.reduce(
    (sum, b) => sum + (b.estimatedCost ?? 0),
    0,
  );
  const budgetActual = budget.reduce((sum, b) => sum + (b.actualCost ?? 0), 0);

  const logistics = {
    flight: input.travelCount,
    hotel: input.hotelCount,
    transport: input.fleetCount,
    gifts: input.giftsCount,
    documents: input.documentsCount,
    budgetEstimated,
    budgetActual,
    currency: budget[0]?.currency ?? "AED",
  };

  const participantsSummary = {
    total: participants.length,
    internal: participants.filter((p) => p.category === "internal").length,
    external: participants.filter((p) => p.category === "external").length,
  };

  const guestsSummary = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.attended).length,
    verified: guests.filter((g) => g.vipVerified).length,
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending")
    .length;

  const alerts = buildOpsRoomAlerts({
    readinessPercent: input.readinessPercent,
    overdueTasks: tasksSummary.overdue,
    criticalRisks: risksSummary.critical,
    pendingApprovals,
    pendingArrivals: arrivals.pending,
  });

  return {
    eventId: input.eventId,
    readinessPercent: input.readinessPercent,
    readinessCategories: input.readinessCategories,
    tasks: tasksSummary,
    approvals: { total: approvals.length, pending: pendingApprovals },
    risks: risksSummary,
    arrivals,
    logistics,
    participants: participantsSummary,
    guests: guestsSummary,
    alerts,
  };
}
