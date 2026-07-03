import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  db,
  pool,
  eventsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  budgetItemsTable,
  documentsTable,
  type Event,
} from "@workspace/db";
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
  await db.delete(travelTable);
  await db.delete(hotelBookingsTable);
  await db.delete(fleetAssignmentsTable);
  await db.delete(giftsTable);
  await db.delete(budgetItemsTable);
  await db.delete(documentsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

// Each logistics collection shares an identical generic CRUD shape, so exercise
// the full create -> list -> patch -> 404 cycle for every one. A missing table
// or column on any of these routes would surface as a failure here.
const collections: Array<{
  name: string;
  path: string;
  body: (eventId: number) => Record<string, unknown>;
}> = [
  {
    name: "travel",
    path: "travel",
    body: (eventId) => ({ eventId, passengerName: "VIP Passenger", direction: "arrival" }),
  },
  {
    name: "hotel-bookings",
    path: "hotel-bookings",
    body: (eventId) => ({ eventId, guestName: "VIP Guest", hotelName: "Emirates Palace" }),
  },
  {
    name: "fleet",
    path: "fleet",
    body: (eventId) => ({ eventId, vehicleType: "sedan", driverName: "Driver" }),
  },
  {
    name: "gifts",
    path: "gifts",
    body: (eventId) => ({ eventId, recipient: "Head of State", item: "Falcon sculpture" }),
  },
  {
    name: "budget",
    path: "budget",
    body: (eventId) => ({ eventId, item: "Catering", estimatedCost: 1000, currency: "AED" }),
  },
  {
    name: "documents",
    path: "documents",
    body: (eventId) => ({ eventId, title: "Protocol Brief", docType: "general" }),
  },
];

describe.each(collections)("logistics CRUD: $name", ({ path, body }) => {
  it("creates, lists, updates, and reports 404 for a missing record", async () => {
    const event = await seedEvent();

    const created = await request(app).post(`/api/${path}`).send(body(event.id));
    expect(created.status).toBe(201);
    expect(created.body.id).toBeTypeOf("number");

    const listed = await request(app).get(`/api/events/${event.id}/${path}`);
    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(1);

    const updated = await request(app)
      .patch(`/api/${path}/${created.body.id}`)
      .send({ notes: "Updated note" });
    expect(updated.status).toBe(200);
    expect(updated.body.notes).toBe("Updated note");

    const missing = await request(app)
      .patch(`/api/${path}/999999`)
      .send({ notes: "nope" });
    expect(missing.status).toBe(404);

    const deleted = await request(app).delete(`/api/${path}/${created.body.id}`);
    expect(deleted.status).toBe(204);
  });
});
