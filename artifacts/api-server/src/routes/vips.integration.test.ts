import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, vipsTable } from "@workspace/db";
import app from "../app";

const validVip = {
  name: "Sheikh Ahmed",
  nameAr: "الشيخ أحمد",
  title: "Minister of Protocol",
  titleAr: "وزير المراسم",
  country: "UAE",
  countryAr: "الإمارات",
  clearanceLevel: "top-secret",
};

beforeEach(async () => {
  await db.delete(vipsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/vips", () => {
  it("returns 200 with the list of VIPs", async () => {
    await db.insert(vipsTable).values(validVip);
    const res = await request(app).get("/api/vips");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

describe("POST /api/vips", () => {
  it("creates a VIP and persists it", async () => {
    const res = await request(app).post("/api/vips").send(validVip);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: validVip.name, clearanceLevel: "top-secret" });

    const rows = await db.select().from(vipsTable);
    expect(rows).toHaveLength(1);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app).post("/api/vips").send({ name: "Missing fields" });
    expect(res.status).toBe(400);
  });
});
