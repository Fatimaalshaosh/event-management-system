import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable,
  readinessCategoriesTable,
  budgetItemsTable,
  insertEventSchema,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  ListEventsQueryParams,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  DeleteEventParams,
  GetEventParams,
  GetEventReadinessParams,
} from "@workspace/api-zod";

const router = Router();

type EventRow = typeof eventsTable.$inferSelect;

function serializeEvent(e: EventRow) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
    cancelledAt: e.cancelledAt ? e.cancelledAt.toISOString() : null,
  };
}

router.get("/events", async (req, res) => {
  try {
    const query = ListEventsQueryParams.parse(req.query);
    let events;
    if (query.status) {
      events = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.status, query.status));
    } else {
      events = await db.select().from(eventsTable);
    }

    // Aggregate per-event budget totals so each card can show a budget snapshot
    // without an extra request per event. Mirrors the ops-room aggregation:
    // sum of estimated/actual costs, currency taken from the first line item.
    const budgetRows = await db
      .select({
        eventId: budgetItemsTable.eventId,
        estimated: sql<number>`coalesce(sum(${budgetItemsTable.estimatedCost}), 0)`,
        actual: sql<number>`coalesce(sum(${budgetItemsTable.actualCost}), 0)`,
        currency: sql<string | null>`min(${budgetItemsTable.currency})`,
      })
      .from(budgetItemsTable)
      .groupBy(budgetItemsTable.eventId);

    const budgetByEvent = new Map<
      number,
      { estimated: number; actual: number; currency: string | null }
    >();
    for (const row of budgetRows) {
      if (row.eventId == null) continue;
      budgetByEvent.set(row.eventId, {
        estimated: Number(row.estimated),
        actual: Number(row.actual),
        currency: row.currency,
      });
    }

    res.json(
      events.map((e) => {
        const b = budgetByEvent.get(e.id);
        return {
          ...serializeEvent(e),
          budgetEstimated: b?.estimated ?? 0,
          budgetActual: b?.actual ?? 0,
          currency: b?.currency ?? null,
        };
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const body = CreateEventBody.parse(req.body);
    const parsed = insertEventSchema.parse(body);
    const [event] = await db.insert(eventsTable).values(parsed).returning();
    if (!event) { res.status(500).json({ error: "Failed to create event" }); return; }

    // Seed readiness categories
    const categories = [
      { name: "Protocol", nameAr: "البروتوكول" },
      { name: "Hospitality", nameAr: "الضيافة" },
      { name: "Invitations", nameAr: "الدعوات" },
      { name: "Transport", nameAr: "النقل" },
      { name: "Security", nameAr: "الأمن" },
    ];
    await db.insert(readinessCategoriesTable).values(
      categories.map((c) => ({
        eventId: event.id,
        name: c.name,
        nameAr: c.nameAr,
        status: "pending",
        percent: 0,
      }))
    );

    res.status(201).json(serializeEvent(event));
  } catch (err) {
    req.log.error({ err }, "Failed to create event");
    res.status(400).json({ error: "Bad request" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const { id } = GetEventParams.parse({ id: Number(req.params.id) });
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id));
    if (!event) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeEvent(event));
  } catch (err) {
    req.log.error({ err }, "Failed to get event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const { id } = UpdateEventParams.parse({ id: Number(req.params.id) });
    const body = UpdateEventBody.parse(req.body);
    const updates: Record<string, unknown> = { ...body };
    if (body.status === "cancelled") {
      updates.cancelledAt = new Date();
    } else if (body.status !== undefined) {
      // Reactivating or moving to any non-cancelled status archives the note
      updates.cancellationReason = null;
      updates.cancelledBy = null;
      updates.cancelledAt = null;
    }
    const [event] = await db
      .update(eventsTable)
      .set(updates)
      .where(eq(eventsTable.id, id))
      .returning();
    if (!event) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeEvent(event));
  } catch (err) {
    req.log.error({ err }, "Failed to update event");
    res.status(400).json({ error: "Bad request" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = DeleteEventParams.parse({ id: Number(req.params.id) });
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:id/readiness", async (req, res) => {
  try {
    const { id } = GetEventReadinessParams.parse({ id: Number(req.params.id) });
    const categories = await db
      .select()
      .from(readinessCategoriesTable)
      .where(eq(readinessCategoriesTable.eventId, id));
    const overall =
      categories.length > 0
        ? Math.round(
            categories.reduce((sum, c) => sum + c.percent, 0) / categories.length
          )
        : 0;
    res.json({ eventId: id, overallPercent: overall, categories });
  } catch (err) {
    req.log.error({ err }, "Failed to get event readiness");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
