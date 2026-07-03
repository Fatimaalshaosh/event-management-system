import { Router, type IRouter } from "express";
import {
  db,
  reportsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  documentsTable,
  budgetItemsTable,
} from "@workspace/db";
import { desc, inArray, sql, type SQL } from "drizzle-orm";
import { CreateReportBody } from "@workspace/api-zod";

const router: IRouter = Router();

function parseEventIds(raw: unknown): number[] | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n));
}

router.get("/reports", async (req, res): Promise<void> => {
  try {
    const reports = await db
      .select()
      .from(reportsTable)
      .orderBy(desc(reportsTable.createdAt));
    res.json(
      reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [report] = await db
      .insert(reportsTable)
      .values(parsed.data)
      .returning();
    if (!report) {
      res.status(500).json({ error: "Failed to create report" });
      return;
    }
    res.status(201).json({ ...report, createdAt: report.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/logistics", async (req, res): Promise<void> => {
  try {
    const ids = parseEventIds(req.query.eventIds);
    const hasScope = req.query.eventIds !== undefined;

    if (hasScope && (ids === null || ids.length === 0)) {
      res.json({
        travel: 0,
        hotel: 0,
        fleet: 0,
        gifts: 0,
        documents: 0,
        budgetEstimated: 0,
        budgetActual: 0,
        currency: "AED",
      });
      return;
    }

    const countOf = sql<number>`count(*)::int`;
    const travelWhere: SQL | undefined = ids ? inArray(travelTable.eventId, ids) : undefined;
    const hotelWhere: SQL | undefined = ids ? inArray(hotelBookingsTable.eventId, ids) : undefined;
    const fleetWhere: SQL | undefined = ids ? inArray(fleetAssignmentsTable.eventId, ids) : undefined;
    const giftsWhere: SQL | undefined = ids ? inArray(giftsTable.eventId, ids) : undefined;
    const docsWhere: SQL | undefined = ids ? inArray(documentsTable.eventId, ids) : undefined;
    const budgetWhere: SQL | undefined = ids ? inArray(budgetItemsTable.eventId, ids) : undefined;

    const [
      travelCount,
      hotelCount,
      fleetCount,
      giftsCount,
      documentsCount,
      budgetTotals,
      budgetCurrency,
    ] = await Promise.all([
      db.select({ count: countOf }).from(travelTable).where(travelWhere),
      db.select({ count: countOf }).from(hotelBookingsTable).where(hotelWhere),
      db.select({ count: countOf }).from(fleetAssignmentsTable).where(fleetWhere),
      db.select({ count: countOf }).from(giftsTable).where(giftsWhere),
      db.select({ count: countOf }).from(documentsTable).where(docsWhere),
      db
        .select({
          estimated: sql<number>`coalesce(sum(${budgetItemsTable.estimatedCost}), 0)::int`,
          actual: sql<number>`coalesce(sum(${budgetItemsTable.actualCost}), 0)::int`,
        })
        .from(budgetItemsTable)
        .where(budgetWhere),
      db
        .select({ currency: budgetItemsTable.currency })
        .from(budgetItemsTable)
        .where(budgetWhere)
        .limit(1),
    ]);

    res.json({
      travel: travelCount[0]?.count ?? 0,
      hotel: hotelCount[0]?.count ?? 0,
      fleet: fleetCount[0]?.count ?? 0,
      gifts: giftsCount[0]?.count ?? 0,
      documents: documentsCount[0]?.count ?? 0,
      budgetEstimated: budgetTotals[0]?.estimated ?? 0,
      budgetActual: budgetTotals[0]?.actual ?? 0,
      currency: budgetCurrency[0]?.currency ?? "AED",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get scoped logistics totals");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
