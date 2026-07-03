import { Router } from "express";
import { db } from "@workspace/db";
import { risksTable, insertRiskSchema, type Risk } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListEventRisksParams,
  CreateRiskBody,
  UpdateRiskParams,
  UpdateRiskBody,
  DeleteRiskParams,
} from "@workspace/api-zod";

const router = Router();

function serializeRisk(r: Risk) {
  return { ...r, createdAt: r.createdAt.toISOString() };
}

router.get("/events/:id/risks", async (req, res) => {
  try {
    const { id } = ListEventRisksParams.parse({ id: Number(req.params.id) });
    const risks = await db
      .select()
      .from(risksTable)
      .where(eq(risksTable.eventId, id));
    res.json(risks.map(serializeRisk));
  } catch (err) {
    req.log.error({ err }, "Failed to list risks");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/risks", async (req, res) => {
  try {
    const body = CreateRiskBody.parse(req.body);
    const parsed = insertRiskSchema.parse(body);
    const [risk] = await db.insert(risksTable).values(parsed).returning();
    if (!risk) { res.status(500).json({ error: "Failed to create risk" }); return; }
    res.status(201).json(serializeRisk(risk));
  } catch (err) {
    req.log.error({ err }, "Failed to create risk");
    res.status(400).json({ error: "Bad request" });
  }
});

router.patch("/risks/:id", async (req, res) => {
  try {
    const { id } = UpdateRiskParams.parse({ id: Number(req.params.id) });
    const body = UpdateRiskBody.parse(req.body);
    const [risk] = await db
      .update(risksTable)
      .set(body)
      .where(eq(risksTable.id, id))
      .returning();
    if (!risk) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeRisk(risk));
  } catch (err) {
    req.log.error({ err }, "Failed to update risk");
    res.status(400).json({ error: "Bad request" });
  }
});

router.delete("/risks/:id", async (req, res) => {
  try {
    const { id } = DeleteRiskParams.parse({ id: Number(req.params.id) });
    await db.delete(risksTable).where(eq(risksTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete risk");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
