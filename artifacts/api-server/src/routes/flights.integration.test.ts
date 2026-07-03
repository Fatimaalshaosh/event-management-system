import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, eventsTable, travelTable, type Event } from "@workspace/db";
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

const validBooking = {
  direction: "arrival",
  passengerName: "Test Passenger",
  airline: "Emirates",
  flightNumber: "EK001",
  cabinClass: "business",
};

beforeEach(async () => {
  await db.delete(travelTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/flights/book", () => {
  it("books a flight, generates a PNR, and persists it with the demo provider", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/flights/book")
      .send({ ...validBooking, eventId: event.id, provider: "demo" });

    expect(res.status).toBe(201);
    expect(res.body.pnr).toMatch(/^[A-Z0-9]{6}$/);
    expect(res.body.legs[0].bookingProvider).toBe("demo");
    expect(res.body.legs[0].status).toBe("confirmed");

    const rows = await db.select().from(travelTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.pnr).toBe(res.body.pnr);
  });

  it("defaults to the demo provider when none is supplied", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/flights/book")
      .send({ ...validBooking, eventId: event.id });

    expect(res.status).toBe(201);
    expect(res.body.legs[0].bookingProvider).toBe("demo");
  });

  it("rejects an unknown provider with 422", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/flights/book")
      .send({ ...validBooking, eventId: event.id, provider: "not-a-provider" });

    expect(res.status).toBe(422);
    const rows = await db.select().from(travelTable);
    expect(rows).toHaveLength(0);
  });

  it("rejects an invalid direction with 400", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/flights/book")
      .send({ ...validBooking, eventId: event.id, direction: "sideways" });

    expect(res.status).toBe(400);
    const rows = await db.select().from(travelTable);
    expect(rows).toHaveLength(0);
  });

  it("rejects an invalid cabin class with 400", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/flights/book")
      .send({ ...validBooking, eventId: event.id, cabinClass: "platinum" });

    expect(res.status).toBe(400);
    const rows = await db.select().from(travelTable);
    expect(rows).toHaveLength(0);
  });
});
