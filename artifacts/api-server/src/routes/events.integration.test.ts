import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  db,
  pool,
  eventsTable,
  readinessCategoriesTable,
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
  await db.delete(readinessCategoriesTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/events", () => {
  it("returns 200 with the list of events", async () => {
    await seedEvent();
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("filters by status without erroring", async () => {
    await seedEvent({ status: "upcoming" });
    await seedEvent({ status: "completed" });
    const res = await request(app).get("/api/events").query({ status: "upcoming" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("upcoming");
  });
});

describe("POST /api/events", () => {
  it("creates an event and seeds readiness categories", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({
        name: "Summit",
        nameAr: "قمة",
        date: "2026-08-01",
        location: "Dubai",
        status: "upcoming",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("number");

    const categories = await db
      .select()
      .from(readinessCategoriesTable)
      .where(eq(readinessCategoriesTable.eventId, res.body.id));
    expect(categories).toHaveLength(5);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app).post("/api/events").send({ name: "No date" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/events/:id", () => {
  it("returns 200 for a real event", async () => {
    const event = await seedEvent();
    const res = await request(app).get(`/api/events/${event.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: event.id, name: event.name });
  });

  it("returns 404 for a missing event", async () => {
    const res = await request(app).get("/api/events/999999");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Not found" });
  });
});

describe("PATCH /api/events/:id", () => {
  it("updates an existing event", async () => {
    const event = await seedEvent();
    const res = await request(app)
      .patch(`/api/events/${event.id}`)
      .send({ location: "Sharjah" });
    expect(res.status).toBe(200);
    expect(res.body.location).toBe("Sharjah");
  });

  it("returns 404 when updating a missing event", async () => {
    const res = await request(app)
      .patch("/api/events/999999")
      .send({ location: "Nowhere" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/events/:id", () => {
  it("deletes an event and cascades its readiness categories", async () => {
    const event = await seedEvent();
    await db.insert(readinessCategoriesTable).values({
      eventId: event.id,
      name: "Security",
      nameAr: "الأمن",
      status: "pending",
      percent: 0,
    });

    const res = await request(app).delete(`/api/events/${event.id}`);
    expect(res.status).toBe(204);

    const remaining = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, event.id));
    expect(remaining).toHaveLength(0);
  });
});

describe("GET /api/events/:id/readiness", () => {
  it("returns the per-category readiness breakdown", async () => {
    const event = await seedEvent();
    await db.insert(readinessCategoriesTable).values([
      { eventId: event.id, name: "Security", nameAr: "الأمن", status: "in-progress", percent: 40 },
      { eventId: event.id, name: "Protocol", nameAr: "البروتوكول", status: "done", percent: 100 },
    ]);

    const res = await request(app).get(`/api/events/${event.id}/readiness`);
    expect(res.status).toBe(200);
    expect(res.body.overallPercent).toBe(70);
    expect(res.body.categories).toHaveLength(2);
  });
});
