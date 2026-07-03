import { Router } from "express";
import { db } from "@workspace/db";
import { participantsTable, insertParticipantSchema, type Participant } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListEventParticipantsParams,
  CreateParticipantBody,
  UpdateParticipantParams,
  UpdateParticipantBody,
  DeleteParticipantParams,
} from "@workspace/api-zod";

const router = Router();

function serializeParticipant(p: Participant) {
  return { ...p, createdAt: p.createdAt.toISOString() };
}

router.get("/events/:id/participants", async (req, res) => {
  try {
    const { id } = ListEventParticipantsParams.parse({ id: Number(req.params.id) });
    const participants = await db
      .select()
      .from(participantsTable)
      .where(eq(participantsTable.eventId, id));
    res.json(participants.map(serializeParticipant));
  } catch (err) {
    req.log.error({ err }, "Failed to list participants");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/participants", async (req, res) => {
  try {
    const body = CreateParticipantBody.parse(req.body);
    const parsed = insertParticipantSchema.parse(body);
    const [participant] = await db.insert(participantsTable).values(parsed).returning();
    if (!participant) { res.status(500).json({ error: "Failed to create participant" }); return; }
    res.status(201).json(serializeParticipant(participant));
  } catch (err) {
    req.log.error({ err }, "Failed to create participant");
    res.status(400).json({ error: "Bad request" });
  }
});

router.patch("/participants/:id", async (req, res) => {
  try {
    const { id } = UpdateParticipantParams.parse({ id: Number(req.params.id) });
    const body = UpdateParticipantBody.parse(req.body);
    const [participant] = await db
      .update(participantsTable)
      .set(body)
      .where(eq(participantsTable.id, id))
      .returning();
    if (!participant) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeParticipant(participant));
  } catch (err) {
    req.log.error({ err }, "Failed to update participant");
    res.status(400).json({ error: "Bad request" });
  }
});

router.delete("/participants/:id", async (req, res) => {
  try {
    const { id } = DeleteParticipantParams.parse({ id: Number(req.params.id) });
    await db.delete(participantsTable).where(eq(participantsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete participant");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
