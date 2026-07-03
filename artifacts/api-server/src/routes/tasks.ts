import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, approvalsTable, eventsTable, insertTaskSchema } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  UpdateApprovalParams,
  UpdateApprovalBody,
} from "@workspace/api-zod";
import { computeReadinessUpdate } from "../lib/readiness";

const router = Router();

// Recompute an event's denormalized readiness + pending task count from its tasks.
async function recomputeEventReadiness(eventId: number): Promise<void> {
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.eventId, eventId));

  const update = computeReadinessUpdate(tasks);

  await db.update(eventsTable).set(update).where(eq(eventsTable.id, eventId));
}

router.get("/tasks", async (req, res) => {
  try {
    const query = ListTasksQueryParams.parse(req.query);
    const conditions = [];
    if (query.status) conditions.push(eq(tasksTable.status, query.status));
    if (query.eventId !== undefined) conditions.push(eq(tasksTable.eventId, query.eventId));

    const tasks = conditions.length
      ? await db.select().from(tasksTable).where(and(...conditions))
      : await db.select().from(tasksTable);

    res.json(tasks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list tasks");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const body = CreateTaskBody.parse(req.body);
    const parsed = insertTaskSchema.parse(body);
    const [task] = await db.insert(tasksTable).values(parsed).returning();
    if (!task) { res.status(500).json({ error: "Failed to create task" }); return; }
    if (task.eventId != null) await recomputeEventReadiness(task.eventId);
    res.status(201).json({ ...task, createdAt: task.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create task");
    res.status(400).json({ error: "Bad request" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
    const body = UpdateTaskBody.parse(req.body);
    const [task] = await db
      .update(tasksTable)
      .set(body)
      .where(eq(tasksTable.id, id))
      .returning();
    if (!task) { res.status(404).json({ error: "Not found" }); return; }
    if (task.eventId != null) await recomputeEventReadiness(task.eventId);
    res.json({ ...task, createdAt: task.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update task");
    res.status(400).json({ error: "Bad request" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
    const [deleted] = await db
      .delete(tasksTable)
      .where(eq(tasksTable.id, id))
      .returning();
    if (deleted?.eventId != null) await recomputeEventReadiness(deleted.eventId);
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete task");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/approvals", async (req, res) => {
  try {
    const approvals = await db.select().from(approvalsTable);
    res.json(approvals.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list approvals");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/approvals/:id", async (req, res) => {
  try {
    const { id } = UpdateApprovalParams.parse({ id: Number(req.params.id) });
    const body = UpdateApprovalBody.parse(req.body);
    const [approval] = await db
      .update(approvalsTable)
      .set(body)
      .where(eq(approvalsTable.id, id))
      .returning();
    if (!approval) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...approval, createdAt: approval.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update approval");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
