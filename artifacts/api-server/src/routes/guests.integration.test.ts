import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  eventsTable,
  guestsTable,
  invitationsTable,
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
  await db.delete(guestsTable);
  await db.delete(invitationsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/events/:id/guests", () => {
  it("lists delegation members scoped to an event", async () => {
    const event = await seedEvent();
    const other = await seedEvent({ name: "Other" });
    await db.insert(guestsTable).values([
      { eventId: event.id, fullName: "Member One" },
      { eventId: event.id, fullName: "Member Two", requiresHotel: true },
      { eventId: other.id, fullName: "Elsewhere" },
    ]);

    const res = await request(app).get(`/api/events/${event.id}/guests`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const names = res.body.map((g: { fullName: string }) => g.fullName).sort();
    expect(names).toEqual(["Member One", "Member Two"]);
    expect(res.body[0].createdAt).toBeTypeOf("string");
  });

  it("returns an empty list when an event has no guests", async () => {
    const event = await seedEvent();
    const res = await request(app).get(`/api/events/${event.id}/guests`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("PATCH /api/guests/:id", () => {
  it("checks a guest in and records verification", async () => {
    const event = await seedEvent();
    const [guest] = await db
      .insert(guestsTable)
      .values({ eventId: event.id, fullName: "Coordinator" })
      .returning();

    const res = await request(app)
      .patch(`/api/guests/${guest!.id}`)
      .send({ attended: true, vipVerified: true });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ attended: true, vipVerified: true });

    const [row] = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.id, guest!.id));
    expect(row!.attended).toBe(true);
  });

  it("returns 404 for a missing guest", async () => {
    const res = await request(app).patch("/api/guests/999999").send({ attended: true });
    expect(res.status).toBe(404);
  });
});
