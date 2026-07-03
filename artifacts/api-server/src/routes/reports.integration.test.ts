import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  eventsTable,
  reportsTable,
  budgetItemsTable,
  travelTable,
  type Event,
} from "@workspace/db";
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
  await db.delete(travelTable);
  await db.delete(budgetItemsTable);
  await db.delete(reportsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/reports", () => {
  it("lists generated reports", async () => {
    await db.insert(reportsTable).values({
      name: "Attendance Report",
      type: "attendance",
      format: "pdf",
    });

    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: "Attendance Report", format: "pdf" });
    expect(res.body[0].createdAt).toBeTypeOf("string");
  });

  it("returns an empty list when no reports exist", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /api/reports", () => {
  it("creates a report", async () => {
    const res = await request(app)
      .post("/api/reports")
      .send({ name: "Budget Export", type: "budget", format: "excel" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Budget Export", format: "excel" });
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app).post("/api/reports").send({ name: "Missing fields" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/reports/logistics", () => {
  it("aggregates logistics totals across every dependent table", async () => {
    // A missing table/column on any of the aggregated sources would surface here.
    const event = await seedEvent();
    await db.insert(travelTable).values({
      eventId: event.id,
      direction: "arrival",
      passengerName: "Head of Delegation",
    });
    await db.insert(budgetItemsTable).values({
      eventId: event.id,
      category: "transport",
      item: "Coaches",
      estimatedCost: 5000,
      actualCost: 4200,
      currency: "AED",
    });

    const res = await request(app).get("/api/reports/logistics");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      travel: 1,
      budgetEstimated: 5000,
      budgetActual: 4200,
      currency: "AED",
    });
  });

  it("returns zeroed totals for an empty event scope", async () => {
    const res = await request(app).get("/api/reports/logistics").query({ eventIds: "" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      travel: 0,
      hotel: 0,
      fleet: 0,
      gifts: 0,
      documents: 0,
      budgetEstimated: 0,
      budgetActual: 0,
    });
  });
});
