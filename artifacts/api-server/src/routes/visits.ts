import { Router } from "express";
import { db } from "@workspace/db";
import { visitsTable, insertVisitSchema } from "@workspace/db";
import { CreateVisitBody } from "@workspace/api-zod";

const router = Router();

router.get("/visits", async (req, res) => {
  try {
    const visits = await db.select().from(visitsTable);
    res.json(visits.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list visits");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/visits", async (req, res) => {
  try {
    const body = CreateVisitBody.parse(req.body);
    const parsed = insertVisitSchema.parse(body);
    const [visit] = await db.insert(visitsTable).values(parsed).returning();
    if (!visit) { res.status(500).json({ error: "Failed to create visit" }); return; }
    res.status(201).json({ ...visit, createdAt: visit.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create visit");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
