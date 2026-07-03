import { Router } from "express";
import { db } from "@workspace/db";
import { vipsTable, insertVipSchema } from "@workspace/db";
import { CreateVipBody } from "@workspace/api-zod";

const router = Router();

router.get("/vips", async (req, res) => {
  try {
    const vips = await db.select().from(vipsTable);
    res.json(vips.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list VIPs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/vips", async (req, res) => {
  try {
    const body = CreateVipBody.parse(req.body);
    const parsed = insertVipSchema.parse(body);
    const [vip] = await db.insert(vipsTable).values(parsed).returning();
    if (!vip) { res.status(500).json({ error: "Failed to create VIP" }); return; }
    res.status(201).json({ ...vip, createdAt: vip.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create VIP");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
