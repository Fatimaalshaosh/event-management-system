import { Router, type IRouter } from "express";
import { db, dashboardProfilesTable } from "@workspace/db";
import type { DashboardWidgetConfig } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  ListDashboardProfilesQueryParams,
  CreateDashboardProfileBody,
  UpdateDashboardProfileParams,
  UpdateDashboardProfileQueryParams,
  UpdateDashboardProfileBody,
  DeleteDashboardProfileParams,
  DeleteDashboardProfileQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof dashboardProfilesTable.$inferSelect) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/dashboard/profiles", async (req, res): Promise<void> => {
  const query = ListDashboardProfilesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  try {
    const profiles = await db
      .select()
      .from(dashboardProfilesTable)
      .where(eq(dashboardProfilesTable.ownerKey, query.data.ownerKey))
      .orderBy(dashboardProfilesTable.id);
    res.json(profiles.map(serialize));
  } catch (err) {
    req.log.error({ err }, "Failed to list dashboard profiles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dashboard/profiles", async (req, res): Promise<void> => {
  const parsed = CreateDashboardProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [profile] = await db
      .insert(dashboardProfilesTable)
      .values({
        ownerKey: parsed.data.ownerKey,
        name: parsed.data.name,
        icon: parsed.data.icon,
        items: parsed.data.items as DashboardWidgetConfig[],
      })
      .returning();
    if (!profile) {
      res.status(500).json({ error: "Failed to create dashboard profile" });
      return;
    }
    res.status(201).json(serialize(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to create dashboard profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/dashboard/profiles/:id", async (req, res): Promise<void> => {
  const params = UpdateDashboardProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = UpdateDashboardProfileQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const body = UpdateDashboardProfileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Partial<typeof dashboardProfilesTable.$inferInsert> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.icon !== undefined) updates.icon = body.data.icon;
  if (body.data.items !== undefined)
    updates.items = body.data.items as DashboardWidgetConfig[];
  try {
    const [profile] = await db
      .update(dashboardProfilesTable)
      .set(updates)
      .where(
        and(
          eq(dashboardProfilesTable.id, params.data.id),
          eq(dashboardProfilesTable.ownerKey, query.data.ownerKey),
        ),
      )
      .returning();
    if (!profile) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to update dashboard profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/dashboard/profiles/:id", async (req, res): Promise<void> => {
  const params = DeleteDashboardProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = DeleteDashboardProfileQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  try {
    const [profile] = await db
      .delete(dashboardProfilesTable)
      .where(
        and(
          eq(dashboardProfilesTable.id, params.data.id),
          eq(dashboardProfilesTable.ownerKey, query.data.ownerKey),
        ),
      )
      .returning();
    if (!profile) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Failed to delete dashboard profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
