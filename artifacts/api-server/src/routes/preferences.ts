import { Router, type IRouter } from "express";
import { db, userPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetUserPreferencesQueryParams,
  UpdateUserPreferencesBody,
} from "@workspace/api-zod";
import { normalizeBudgetThreshold } from "../lib/budget";

const router: IRouter = Router();

router.get("/dashboard/preferences", async (req, res): Promise<void> => {
  const query = GetUserPreferencesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  try {
    const [prefs] = await db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.ownerKey, query.data.ownerKey))
      .limit(1);
    res.json({
      ownerKey: query.data.ownerKey,
      budgetThreshold: normalizeBudgetThreshold(prefs?.budgetThreshold),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get user preferences");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/dashboard/preferences", async (req, res): Promise<void> => {
  const body = UpdateUserPreferencesBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const budgetThreshold = normalizeBudgetThreshold(body.data.budgetThreshold);
  try {
    const [prefs] = await db
      .insert(userPreferencesTable)
      .values({ ownerKey: body.data.ownerKey, budgetThreshold })
      .onConflictDoUpdate({
        target: userPreferencesTable.ownerKey,
        set: { budgetThreshold },
      })
      .returning();
    res.json({
      ownerKey: prefs?.ownerKey ?? body.data.ownerKey,
      budgetThreshold: normalizeBudgetThreshold(prefs?.budgetThreshold),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update user preferences");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
