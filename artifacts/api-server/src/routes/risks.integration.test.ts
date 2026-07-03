import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool, eventsTable, risksTable, type Event } from "@workspace/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../app";

async function seedEvent(overrides: Partial<Event> = {}): Promise<Event> {
  const [event] = await db
    .insert(eventsTable)
    .values({
      name: "State Visit",
      nameAr: "زيارة دولة",
      date: "2026-07-01",
      location: "Abu Dhabi",
      ...overrides,
    })
    .returning();
  return event!;
}

beforeEach(async () => {
  await db.delete(risksTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/events/:id/risks", () => {
  it("lists risks scoped to an event", async () => {
    const event = await seedEvent();
    const other = await seedEvent({ name: "Other" });
    await db.insert(risksTable).values([
      { eventId: event.id, title: "Crowd surge", severity: "high" },
      { eventId: other.id, title: "Weather", severity: "low" },
    ]);

    const res = await request(app).get(`/api/events/${event.id}/risks`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ title: "Crowd surge", severity: "high" });
    expect(res.body[0].createdAt).toBeTypeOf("string");
  });

  it("returns an empty list when an event has no risks", async () => {
    const event = await seedEvent();
    const res = await request(app).get(`/api/events/${event.id}/risks`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("risk lifecycle", () => {
  it("creates, updates, and deletes a risk", async () => {
    const event = await seedEvent();

    const created = await request(app)
      .post("/api/risks")
      .send({ eventId: event.id, title: "Route closure", severity: "medium" });
    expect(created.status).toBe(201);
    const riskId = created.body.id as number;

    const updated = await request(app)
      .patch(`/api/risks/${riskId}`)
      .send({ status: "mitigated" });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe("mitigated");

    const deleted = await request(app).delete(`/api/risks/${riskId}`);
    expect(deleted.status).toBe(204);

    const rows = await db
      .select()
      .from(risksTable)
      .where(eq(risksTable.id, riskId));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 when updating a missing risk", async () => {
    const res = await request(app)
      .patch("/api/risks/999999")
      .send({ status: "mitigated" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid create body", async () => {
    const res = await request(app).post("/api/risks").send({ title: "No severity" });
    expect(res.status).toBe(400);
  });
});
