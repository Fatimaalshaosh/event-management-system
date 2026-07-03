import { Router, type IRouter } from "express";
import {
  db,
  budgetItemsTable,
  eventsTable,
  notificationsTable,
  budgetAlertStatesTable,
  type NotificationRow,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  buildBudgetAlerts,
  normalizeBudgetThreshold,
} from "../lib/budget";
import {
  computeBudgetNotificationChanges,
  type PriorBudgetState,
} from "../lib/budget-notifications";
import {
  ListNotificationsQueryParams,
  MarkAllNotificationsReadQueryParams,
  MarkNotificationReadParams,
  MarkNotificationReadQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const FEED_LIMIT = 50;

function serialize(row: NotificationRow) {
  return {
    id: row.id,
    ownerKey: row.ownerKey,
    type: row.type,
    eventId: row.eventId,
    status: row.status,
    spentPercent: row.spentPercent,
    overByPercent: row.overByPercent,
    estimated: row.estimated,
    actual: row.actual,
    currency: row.currency,
    eventName: row.eventName,
    eventNameAr: row.eventNameAr,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function loadFeed(ownerKey: string) {
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.ownerKey, ownerKey))
    .orderBy(desc(notificationsTable.createdAt), desc(notificationsTable.id))
    .limit(FEED_LIMIT);

  const [unread] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.ownerKey, ownerKey),
        sql`${notificationsTable.readAt} is null`,
      ),
    );

  return {
    notifications: rows.map(serialize),
    unreadCount: unread?.count ?? 0,
  };
}

// Evaluate the current per-event budget state, create notifications for any
// events that have escalated since the last evaluation (deduplicated via the
// budget_alert_states table), then return the owner's notification feed.
router.get("/dashboard/notifications", async (req, res): Promise<void> => {
  const query = ListNotificationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { ownerKey } = query.data;
  const threshold = normalizeBudgetThreshold(query.data.budgetThreshold);

  try {
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

    const alerts = buildBudgetAlerts(
      eventBudgetRows.map((r) => ({
        eventId: r.eventId as number,
        name: r.name,
        nameAr: r.nameAr,
        estimated: r.estimated,
        actual: r.actual,
        currency: r.currency,
      })),
      threshold,
    );

    const stateRows = await db
      .select({
        eventId: budgetAlertStatesTable.eventId,
        status: budgetAlertStatesTable.status,
      })
      .from(budgetAlertStatesTable)
      .where(eq(budgetAlertStatesTable.ownerKey, ownerKey));

    const priorStates: PriorBudgetState[] = stateRows.map((s) => ({
      eventId: s.eventId,
      status: s.status ?? "none",
    }));

    const { toInsert, stateUpserts } = computeBudgetNotificationChanges(
      alerts,
      priorStates,
    );

    if (toInsert.length > 0) {
      await db.insert(notificationsTable).values(
        toInsert.map((d) => ({
          ownerKey,
          type: "budget",
          eventId: d.eventId,
          status: d.status,
          spentPercent: d.spentPercent,
          overByPercent: d.overByPercent,
          estimated: d.estimated,
          actual: d.actual,
          currency: d.currency,
          eventName: d.eventName,
          eventNameAr: d.eventNameAr,
        })),
      );
    }

    for (const s of stateUpserts) {
      await db
        .insert(budgetAlertStatesTable)
        .values({ ownerKey, eventId: s.eventId, status: s.status })
        .onConflictDoUpdate({
          target: [
            budgetAlertStatesTable.ownerKey,
            budgetAlertStatesTable.eventId,
          ],
          set: { status: s.status, updatedAt: new Date() },
        });
    }

    res.json(await loadFeed(ownerKey));
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dashboard/notifications", async (req, res): Promise<void> => {
  const query = MarkAllNotificationsReadQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { ownerKey } = query.data;
  try {
    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.ownerKey, ownerKey),
          sql`${notificationsTable.readAt} is null`,
        ),
      );
    res.json(await loadFeed(ownerKey));
  } catch (err) {
    req.log.error({ err }, "Failed to mark notifications read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/dashboard/notifications/:id/read",
  async (req, res): Promise<void> => {
    const params = MarkNotificationReadParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const query = MarkNotificationReadQueryParams.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: query.error.message });
      return;
    }
    try {
      const [row] = await db
        .update(notificationsTable)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notificationsTable.id, params.data.id),
            eq(notificationsTable.ownerKey, query.data.ownerKey),
          ),
        )
        .returning();
      if (!row) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(serialize(row));
    } catch (err) {
      req.log.error({ err }, "Failed to mark notification read");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
