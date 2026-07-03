import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool, userPreferencesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../app";

const OWNER = "officer-1";

beforeEach(async () => {
  await db.delete(userPreferencesTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/dashboard/preferences", () => {
  it("falls back to the default threshold when no preference is set", async () => {
    const res = await request(app)
      .get("/api/dashboard/preferences")
      .query({ ownerKey: OWNER });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ownerKey: OWNER, budgetThreshold: 90 });
  });

  it("returns the stored threshold scoped to the owner key", async () => {
    await db.insert(userPreferencesTable).values([
      { ownerKey: OWNER, budgetThreshold: 70 },
      { ownerKey: "other", budgetThreshold: 55 },
    ]);

    const res = await request(app)
      .get("/api/dashboard/preferences")
      .query({ ownerKey: OWNER });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ownerKey: OWNER, budgetThreshold: 70 });
  });
});

describe("PUT /api/dashboard/preferences", () => {
  it("creates a preference row when none exists", async () => {
    const res = await request(app)
      .put("/api/dashboard/preferences")
      .send({ ownerKey: OWNER, budgetThreshold: 80 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ownerKey: OWNER, budgetThreshold: 80 });

    const rows = await db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.ownerKey, OWNER));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.budgetThreshold).toBe(80);
  });

  it("updates the existing preference in place (no duplicate rows)", async () => {
    await db
      .insert(userPreferencesTable)
      .values({ ownerKey: OWNER, budgetThreshold: 60 });

    const res = await request(app)
      .put("/api/dashboard/preferences")
      .send({ ownerKey: OWNER, budgetThreshold: 95 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ownerKey: OWNER, budgetThreshold: 95 });

    const rows = await db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.ownerKey, OWNER));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.budgetThreshold).toBe(95);
  });

  it("rejects an out-of-range threshold", async () => {
    const res = await request(app)
      .put("/api/dashboard/preferences")
      .send({ ownerKey: OWNER, budgetThreshold: 120 });
    expect(res.status).toBe(400);
  });
});
