import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { db, pool, approvalsTable, type Approval } from "@workspace/db";
import app from "../app";

async function seedApproval(overrides: Partial<Approval> = {}): Promise<Approval> {
  const [approval] = await db
    .insert(approvalsTable)
    .values({
      title: "Motorcade route change",
      titleAr: "تغيير مسار الموكب",
      requestedBy: "Protocol Office",
      status: "pending",
      ...overrides,
    })
    .returning();
  return approval!;
}

beforeEach(async () => {
  await db.delete(approvalsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/approvals", () => {
  it("returns 200 with the list of approvals", async () => {
    await seedApproval();
    const res = await request(app).get("/api/approvals");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

describe("PATCH /api/approvals/:id", () => {
  it("approves an existing request", async () => {
    const approval = await seedApproval();
    const res = await request(app)
      .patch(`/api/approvals/${approval.id}`)
      .send({ status: "approved", notes: "Cleared by security" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
    expect(res.body.notes).toBe("Cleared by security");
  });

  it("returns 404 for a missing approval", async () => {
    const res = await request(app)
      .patch("/api/approvals/999999")
      .send({ status: "approved" });
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Not found" });
  });
});
