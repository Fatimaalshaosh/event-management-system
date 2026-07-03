import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  db,
  pool,
  eventsTable,
  visitsTable,
  tasksTable,
  approvalsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  documentsTable,
  budgetItemsTable,
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
  await db.delete(documentsTable);
  await db.delete(budgetItemsTable);
  await db.delete(tasksTable);
  await db.delete(approvalsTable);
  await db.delete(visitsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/dashboard/summary", () => {
  it("returns 200 and queries every table the summary depends on", async () => {
    // A missing table/column on any of these joins would surface here as a 500.
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      upcomingEvents: 0,
      officialVisits: 0,
      pendingRequests: 0,
      pendingApprovals: 0,
    });
    expect(res.body.logistics).toBeDefined();
    expect(Array.isArray(res.body.budgetAlerts)).toBe(true);
  });

  it("reflects seeded counts and over-budget alerts", async () => {
    const event = await seedEvent({ status: "upcoming" });
    await db.insert(visitsTable).values({
      guestName: "Envoy",
      country: "Italy",
      arrivalDate: "2026-07-01",
      status: "scheduled",
    });
    await db.insert(tasksTable).values({ title: "Brief detail", status: "pending" });
    await db.insert(approvalsTable).values({
      title: "Route change",
      requestedBy: "Protocol",
      status: "pending",
    });
    await db.insert(travelTable).values({ passengerName: "VIP", eventId: event.id });
    await db.insert(budgetItemsTable).values({
      eventId: event.id,
      item: "Catering",
      estimatedCost: 1000,
      actualCost: 5000,
      currency: "AED",
    });

    const res = await request(app).get("/api/dashboard/summary");
    expect(res.status).toBe(200);
    expect(res.body.upcomingEvents).toBe(1);
    expect(res.body.officialVisits).toBe(1);
    expect(res.body.pendingRequests).toBe(1);
    expect(res.body.pendingApprovals).toBe(1);
    expect(res.body.logistics.travel).toBe(1);
    expect(res.body.budgetAlerts.length).toBeGreaterThan(0);
  });
});
