import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool, dashboardProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../app";

const OWNER = "officer-1";

beforeEach(async () => {
  await db.delete(dashboardProfilesTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/dashboard/profiles", () => {
  it("lists profiles scoped to the owner key", async () => {
    await db.insert(dashboardProfilesTable).values([
      { ownerKey: OWNER, name: "Daily Brief", items: [{ id: "kpis", hidden: false }] },
      { ownerKey: "other", name: "Someone Else", items: [] },
    ]);

    const res = await request(app).get("/api/dashboard/profiles").query({ ownerKey: OWNER });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: "Daily Brief", ownerKey: OWNER });
    expect(res.body[0].createdAt).toBeTypeOf("string");
    expect(res.body[0].updatedAt).toBeTypeOf("string");
  });

  it("returns an empty list for an owner with no profiles", async () => {
    const res = await request(app)
      .get("/api/dashboard/profiles")
      .query({ ownerKey: "nobody" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("dashboard profile lifecycle", () => {
  it("creates, updates, and deletes a profile", async () => {
    const created = await request(app)
      .post("/api/dashboard/profiles")
      .send({
        ownerKey: OWNER,
        name: "Command View",
        items: [{ id: "readiness", hidden: false, size: "lg" }],
      });
    expect(created.status).toBe(201);
    const profileId = created.body.id as number;

    const updated = await request(app)
      .patch(`/api/dashboard/profiles/${profileId}`)
      .query({ ownerKey: OWNER })
      .send({ name: "Renamed View" });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe("Renamed View");

    const deleted = await request(app)
      .delete(`/api/dashboard/profiles/${profileId}`)
      .query({ ownerKey: OWNER });
    expect(deleted.status).toBe(204);

    const rows = await db
      .select()
      .from(dashboardProfilesTable)
      .where(eq(dashboardProfilesTable.id, profileId));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 when updating a profile owned by someone else", async () => {
    const [profile] = await db
      .insert(dashboardProfilesTable)
      .values({ ownerKey: OWNER, name: "Private", items: [] })
      .returning();

    const res = await request(app)
      .patch(`/api/dashboard/profiles/${profile!.id}`)
      .query({ ownerKey: "intruder" })
      .send({ name: "Hijacked" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid create body", async () => {
    const res = await request(app)
      .post("/api/dashboard/profiles")
      .send({ ownerKey: OWNER });
    expect(res.status).toBe(400);
  });
});
