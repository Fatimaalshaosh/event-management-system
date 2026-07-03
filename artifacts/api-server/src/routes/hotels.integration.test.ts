import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, eventsTable, hotelBookingsTable, type Event } from "@workspace/db";
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
  guestName: "Test Guest",
  hotelName: "Emirates Palace",
  roomType: "deluxe",
};

beforeEach(async () => {
  await db.delete(hotelBookingsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/hotel-providers", () => {
  it("lists the demo provider as active and stubs as not active", async () => {
    const res = await request(app).get("/api/hotel-providers");
    expect(res.status).toBe(200);
    const demo = res.body.find((p: { id: string }) => p.id === "demo");
    expect(demo.status).toBe("active");
    const hotelbeds = res.body.find((p: { id: string }) => p.id === "hotelbeds");
    expect(hotelbeds.status).not.toBe("active");
  });
});

describe("POST /api/hotels/search", () => {
  it("returns demo offers for the demo provider", async () => {
    const res = await request(app)
      .post("/api/hotels/search")
      .send({ city: "Abu Dhabi", checkIn: "2026-07-01", checkOut: "2026-07-03" });
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("demo");
    expect(Array.isArray(res.body.offers)).toBe(true);
    expect(res.body.offers.length).toBeGreaterThan(0);
  });

  it("rejects a stub provider with 422", async () => {
    const res = await request(app)
      .post("/api/hotels/search")
      .send({ provider: "hotelbeds", city: "Dubai", checkIn: "2026-07-01", checkOut: "2026-07-03" });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/hotels/book", () => {
  it("books a hotel, generates a confirmation, and computes nights and cost", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/hotels/book")
      .send({
        ...validBooking,
        eventId: event.id,
        provider: "demo",
        checkIn: "2026-07-01",
        checkOut: "2026-07-03",
        rooms: 2,
        pricePerNight: 1000,
      });

    expect(res.status).toBe(201);
    expect(res.body.confirmationNumber).toMatch(/^HTL-[A-Z0-9]{6}$/);
    expect(res.body.bookingProvider).toBe("demo");
    expect(res.body.status).toBe("confirmed");
    expect(res.body.nights).toBe(2);
    expect(res.body.estimatedCost).toBe(4000);
    expect(res.body.currency).toBe("AED");

    const rows = await db.select().from(hotelBookingsTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.confirmationNumber).toBe(res.body.confirmationNumber);
  });

  it("defaults to the demo provider when none is supplied", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/hotels/book")
      .send({ ...validBooking, eventId: event.id });

    expect(res.status).toBe(201);
    expect(res.body.bookingProvider).toBe("demo");
  });

  it("persists VIP protocol fields", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/hotels/book")
      .send({
        ...validBooking,
        eventId: event.id,
        vipLevel: "headOfState",
        securityNotes: "Secure floor",
        dietaryNotes: "Halal only",
        protocolNotes: "Majlis reception",
      });

    expect(res.status).toBe(201);
    expect(res.body.vipLevel).toBe("headOfState");
    expect(res.body.securityNotes).toBe("Secure floor");
  });

  it("rejects a stub provider with 422 and writes nothing", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/hotels/book")
      .send({ ...validBooking, eventId: event.id, provider: "hotelbeds" });

    expect(res.status).toBe(422);
    const rows = await db.select().from(hotelBookingsTable);
    expect(rows).toHaveLength(0);
  });

  it("rejects an unknown provider with 400 and writes nothing", async () => {
    const event = await seedEvent();

    const res = await request(app)
      .post("/api/hotels/book")
      .send({ ...validBooking, eventId: event.id, provider: "not-a-provider" });

    expect(res.status).toBe(400);
    const rows = await db.select().from(hotelBookingsTable);
    expect(rows).toHaveLength(0);
  });
});

describe("GET /api/events/:id/hotel-dashboard", () => {
  it("aggregates reservations for the event", async () => {
    const event = await seedEvent();
    await request(app).post("/api/hotels/book").send({
      ...validBooking, eventId: event.id, vipLevel: "vvip", roomType: "presidentialSuite",
    });

    const res = await request(app).get(`/api/events/${event.id}/hotel-dashboard`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.confirmed).toBe(1);
    expect(res.body.vipGuests).toBe(1);
    expect(res.body.presidentialSuites).toBe(1);
  });
});
