import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  db,
  pool,
  eventsTable,
  readinessCategoriesTable,
  tasksTable,
  type Event,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import app from "../app";

async function seedEvent(overrides: Partial<Event> = {}): Promise<Event> {
  const [event] = await db
    .insert(eventsTable)
    .values({
      name: "State Visit",
      nameAr: "زيارة دولة",
      date: "2026-07-01",
      location: "Abu Dhabi",
      readinessPercent: 50,
      pendingTasksCount: 0,
      ...overrides,
    })
    .returning();
  return event!;
}

beforeEach(async () => {
  // Clean slate between tests; readiness_categories/tasks cascade or are cleared first.
  await db.delete(readinessCategoriesTable);
  await db.delete(tasksTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/events/:id/ops-room", () => {
  it("returns 200 with a snapshot for a real event", async () => {
    const event = await seedEvent({ readinessPercent: 65 });
    await db.insert(readinessCategoriesTable).values({
      eventId: event.id,
      name: "Security",
      nameAr: "الأمن",
      status: "in-progress",
      percent: 40,
    });

    const res = await request(app).get(`/api/events/${event.id}/ops-room`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      eventId: event.id,
      readinessPercent: 65,
    });
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });

  it("returns 404 for a missing event", async () => {
    const res = await request(app).get("/api/events/999999/ops-room");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Not found" });
  });

  it("queries every table the snapshot depends on without erroring", async () => {
    // A missing table (e.g. budget_items, gifts) would surface here as a 500.
    const event = await seedEvent();
    const res = await request(app).get(`/api/events/${event.id}/ops-room`);
    expect(res.status).toBe(200);
  });
});

describe("task lifecycle recomputes event readiness", () => {
  it("updates readinessPercent and pendingTasksCount on create/update/delete", async () => {
    const event = await seedEvent({ readinessPercent: 50, pendingTasksCount: 0 });

    // Create a pending task with full impact -> 0% done, 1 pending.
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Brief the security detail",
        eventId: event.id,
        readinessImpact: 100,
        status: "pending",
        priority: "high",
      });
    expect(created.status).toBe(201);
    const taskId = created.body.id as number;

    let [row] = await db.select().from(eventsTable).where(eq(eventsTable.id, event.id));
    expect(row!.pendingTasksCount).toBe(1);
    expect(row!.readinessPercent).toBe(0);

    // Mark it done -> 100% done, 0 pending.
    const updated = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ status: "done" });
    expect(updated.status).toBe(200);

    [row] = await db.select().from(eventsTable).where(eq(eventsTable.id, event.id));
    expect(row!.pendingTasksCount).toBe(0);
    expect(row!.readinessPercent).toBe(100);

    // Delete it -> no impact-bearing tasks, pending count back to 0.
    const deleted = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleted.status).toBe(204);

    [row] = await db.select().from(eventsTable).where(eq(eventsTable.id, event.id));
    expect(row!.pendingTasksCount).toBe(0);
  });
});
