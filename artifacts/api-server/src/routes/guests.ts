import { Router } from "express";
import { db } from "@workspace/db";
import { guestsTable, type Guest } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListEventGuestsParams,
  UpdateGuestParams,
  UpdateGuestBody,
} from "@workspace/api-zod";

const router = Router();

export function serializeGuest(g: Guest) {
  return { ...g, createdAt: g.createdAt.toISOString() };
}

router.get("/events/:id/guests", async (req, res) => {
  try {
    const { id } = ListEventGuestsParams.parse({ id: Number(req.params.id) });
    const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, id));
    res.json(guests.map(serializeGuest));
  } catch (err) {
    req.log.error({ err }, "Failed to list guests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/guests/:id", async (req, res) => {
  try {
    const { id } = UpdateGuestParams.parse({ id: Number(req.params.id) });
    const body = UpdateGuestBody.parse(req.body);
    const [guest] = await db
      .update(guestsTable)
      .set(body)
      .where(eq(guestsTable.id, id))
      .returning();
    if (!guest) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeGuest(guest));
  } catch (err) {
    req.log.error({ err }, "Failed to update guest");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
