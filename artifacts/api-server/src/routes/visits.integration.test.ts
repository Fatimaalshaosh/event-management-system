import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, visitsTable } from "@workspace/db";
import app from "../app";

const validVisit = {
  guestName: "President of France",
  guestNameAr: "رئيس فرنسا",
  country: "France",
  countryAr: "فرنسا",
  arrivalDate: "2026-09-01",
  departureDate: "2026-09-03",
  status: "scheduled",
  protocolLevel: "state",
};

beforeEach(async () => {
  await db.delete(visitsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/visits", () => {
  it("returns 200 with the list of visits", async () => {
    await db.insert(visitsTable).values(validVisit);
    const res = await request(app).get("/api/visits");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

describe("POST /api/visits", () => {
  it("creates a visit and persists it", async () => {
    const res = await request(app).post("/api/visits").send(validVisit);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ guestName: validVisit.guestName, country: "France" });

    const rows = await db.select().from(visitsTable);
    expect(rows).toHaveLength(1);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app).post("/api/visits").send({ guestName: "Incomplete" });
    expect(res.status).toBe(400);
  });
});
