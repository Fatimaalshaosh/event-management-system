import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, calendarEntriesTable } from "@workspace/db";
import app from "../app";

beforeEach(async () => {
  await db.delete(calendarEntriesTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/calendar", () => {
  it("returns 200 with the list of calendar entries", async () => {
    await db.insert(calendarEntriesTable).values({
      title: "Arrival Ceremony",
      titleAr: "مراسم الاستقبال",
      time: "10:00",
      date: "2026-07-01",
      type: "event",
    });

    const res = await request(app).get("/api/calendar");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("filters by date without erroring", async () => {
    await db.insert(calendarEntriesTable).values([
      { title: "Day One", time: "10:00", date: "2026-07-01", type: "event" },
      { title: "Day Two", time: "11:00", date: "2026-07-02", type: "event" },
    ]);

    const res = await request(app).get("/api/calendar").query({ date: "2026-07-02" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Day Two");
  });
});
