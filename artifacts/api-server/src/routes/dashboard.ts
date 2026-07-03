import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable,
  visitsTable,
  tasksTable,
  approvalsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  documentsTable,
  budgetItemsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { buildBudgetAlerts, normalizeBudgetThreshold } from "../lib/budget";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const budgetThreshold = normalizeBudgetThreshold(req.query.budgetThreshold);

    const [eventsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(eventsTable)
      .where(eq(eventsTable.status, "upcoming"));

    const [visitsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitsTable)
      .where(eq(visitsTable.status, "scheduled"));

    const [pendingTasksCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasksTable)
      .where(eq(tasksTable.status, "pending"));

    const [pendingApprovalsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(approvalsTable)
      .where(eq(approvalsTable.status, "pending"));

    const countOf = sql<number>`count(*)::int`;
    const [
      travelCount,
      hotelCount,
      fleetCount,
      giftsCount,
      documentsCount,
      budgetTotals,
      budgetCurrency,
    ] = await Promise.all([
      db.select({ count: countOf }).from(travelTable),
      db.select({ count: countOf }).from(hotelBookingsTable),
      db.select({ count: countOf }).from(fleetAssignmentsTable),
      db.select({ count: countOf }).from(giftsTable),
      db.select({ count: countOf }).from(documentsTable),
      db
        .select({
          estimated: sql<number>`coalesce(sum(${budgetItemsTable.estimatedCost}), 0)::int`,
          actual: sql<number>`coalesce(sum(${budgetItemsTable.actualCost}), 0)::int`,
        })
        .from(budgetItemsTable),
      db
        .select({ currency: budgetItemsTable.currency })
        .from(budgetItemsTable)
        .limit(1),
    ]);

    const eventBudgetRows = await db
      .select({
        eventId: budgetItemsTable.eventId,
        name: eventsTable.name,
        nameAr: eventsTable.nameAr,
        estimated: sql<number>`coalesce(sum(${budgetItemsTable.estimatedCost}), 0)::int`,
        actual: sql<number>`coalesce(sum(${budgetItemsTable.actualCost}), 0)::int`,
        currency: sql<string>`max(${budgetItemsTable.currency})`,
      })
      .from(budgetItemsTable)
      .innerJoin(eventsTable, eq(budgetItemsTable.eventId, eventsTable.id))
      .groupBy(budgetItemsTable.eventId, eventsTable.name, eventsTable.nameAr);

    const budgetAlerts = buildBudgetAlerts(
      eventBudgetRows.map((r) => ({
        eventId: r.eventId as number,
        name: r.name,
        nameAr: r.nameAr,
        estimated: r.estimated,
        actual: r.actual,
        currency: r.currency,
      })),
      budgetThreshold,
    );

    res.json({
      upcomingEvents: eventsCount?.count ?? 0,
      upcomingEventsChange: 2,
      officialVisits: visitsCount?.count ?? 0,
      officialVisitsChange: 0,
      pendingRequests: pendingTasksCount?.count ?? 0,
      pendingRequestsChange: -1,
      pendingApprovals: pendingApprovalsCount?.count ?? 0,
      pendingApprovalsChange: 1,
      logistics: {
        travel: travelCount[0]?.count ?? 0,
        hotel: hotelCount[0]?.count ?? 0,
        fleet: fleetCount[0]?.count ?? 0,
        gifts: giftsCount[0]?.count ?? 0,
        documents: documentsCount[0]?.count ?? 0,
        budgetEstimated: budgetTotals[0]?.estimated ?? 0,
        budgetActual: budgetTotals[0]?.actual ?? 0,
        currency: budgetCurrency[0]?.currency ?? "AED",
      },
      budgetAlerts,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
