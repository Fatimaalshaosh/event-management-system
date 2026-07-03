import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  eventsTable,
  participantsTable,
  type Event,
} from "@workspace/db";
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
  await db.delete(participantsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/events/:id/participants", () => {
  it("lists participants scoped to an event", async () => {
    const event = await seedEvent();
    const other = await seedEvent({ name: "Other" });
    await db.insert(participantsTable).values([
      { eventId: event.id, name: "Protocol Officer", category: "internal", subType: "protocol" },
      { eventId: other.id, name: "Elsewhere", category: "external", subType: "vip" },
    ]);

    const res = await request(app).get(`/api/events/${event.id}/participants`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: "Protocol Officer", category: "internal" });
    expect(res.body[0].createdAt).toBeTypeOf("string");
  });

  it("returns an empty list when an event has no participants", async () => {
    const event = await seedEvent();
    const res = await request(app).get(`/api/events/${event.id}/participants`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("participant lifecycle", () => {
  it("creates, updates, and deletes a participant", async () => {
    const event = await seedEvent();

    const created = await request(app)
      .post("/api/participants")
      .send({
        eventId: event.id,
        name: "Speaker",
        category: "external",
        subType: "speaker",
      });
    expect(created.status).toBe(201);
    const participantId = created.body.id as number;

    const updated = await request(app)
      .patch(`/api/participants/${participantId}`)
      .send({ attendanceStatus: "present" });
    expect(updated.status).toBe(200);
    expect(updated.body.attendanceStatus).toBe("present");

    const deleted = await request(app).delete(`/api/participants/${participantId}`);
    expect(deleted.status).toBe(204);

    const rows = await db
      .select()
      .from(participantsTable)
      .where(eq(participantsTable.id, participantId));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 when updating a missing participant", async () => {
    const res = await request(app)
      .patch("/api/participants/999999")
      .send({ attendanceStatus: "present" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid create body", async () => {
    const res = await request(app).post("/api/participants").send({ name: "No event" });
    expect(res.status).toBe(400);
  });
});
