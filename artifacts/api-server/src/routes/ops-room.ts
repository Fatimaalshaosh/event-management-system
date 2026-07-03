import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable,
  readinessCategoriesTable,
  tasksTable,
  approvalsTable,
  risksTable,
  invitationsTable,
  participantsTable,
  guestsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  budgetItemsTable,
  documentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetEventOpsRoomParams } from "@workspace/api-zod";
import { buildOpsRoomSnapshot } from "../lib/ops-room";

const router = Router();

router.get("/events/:id/ops-room", async (req, res) => {
  try {
    const { id } = GetEventOpsRoomParams.parse({ id: Number(req.params.id) });

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) { res.status(404).json({ error: "Not found" }); return; }

    const [
      categories,
      tasks,
      approvals,
      risks,
      invitations,
      participants,
      guests,
      travel,
      hotelBookings,
      fleet,
      gifts,
      budget,
      documents,
    ] = await Promise.all([
      db.select().from(readinessCategoriesTable).where(eq(readinessCategoriesTable.eventId, id)),
      db.select().from(tasksTable).where(eq(tasksTable.eventId, id)),
      db.select().from(approvalsTable).where(eq(approvalsTable.eventId, id)),
      db.select().from(risksTable).where(eq(risksTable.eventId, id)),
      db.select().from(invitationsTable).where(eq(invitationsTable.eventId, id)),
      db.select().from(participantsTable).where(eq(participantsTable.eventId, id)),
      db.select().from(guestsTable).where(eq(guestsTable.eventId, id)),
      db.select().from(travelTable).where(eq(travelTable.eventId, id)),
      db.select().from(hotelBookingsTable).where(eq(hotelBookingsTable.eventId, id)),
      db.select().from(fleetAssignmentsTable).where(eq(fleetAssignmentsTable.eventId, id)),
      db.select().from(giftsTable).where(eq(giftsTable.eventId, id)),
      db.select().from(budgetItemsTable).where(eq(budgetItemsTable.eventId, id)),
      db.select().from(documentsTable).where(eq(documentsTable.eventId, id)),
    ]);

    const today = new Date().toISOString().slice(0, 10);

    const snapshot = buildOpsRoomSnapshot({
      eventId: id,
      readinessPercent: event.readinessPercent,
      readinessCategories: categories,
      tasks,
      approvals,
      risks,
      invitations,
      participants,
      guests,
      budget,
      travelCount: travel.length,
      hotelCount: hotelBookings.length,
      fleetCount: fleet.length,
      giftsCount: gifts.length,
      documentsCount: documents.length,
      today,
    });

    res.json(snapshot);
  } catch (err) {
    req.log.error({ err }, "Failed to build ops room snapshot");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
