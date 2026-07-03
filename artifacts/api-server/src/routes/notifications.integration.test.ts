import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  eventsTable,
  budgetItemsTable,
  notificationsTable,
  budgetAlertStatesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../app";

const OWNER = "officer-notif";

async function seedEvent(opts: {
  name: string;
  nameAr?: string;
  estimated: number;
  actual: number;
}): Promise<number> {
  const [event] = await db
    .insert(eventsTable)
    .values({
      name: opts.name,
      nameAr: opts.nameAr ?? null,
      date: "2026-07-01",
      location: "Abu Dhabi",
    })
    .returning();
  await db.insert(budgetItemsTable).values({
    eventId: event!.id,
    item: "Catering",
    estimatedCost: opts.estimated,
    actualCost: opts.actual,
    currency: "AED",
  });
  return event!.id;
}

async function setActual(eventId: number, actual: number) {
  await db
    .update(budgetItemsTable)
    .set({ actualCost: actual })
    .where(eq(budgetItemsTable.eventId, eventId));
}

beforeEach(async () => {
  await db.delete(notificationsTable);
  await db.delete(budgetAlertStatesTable);
  await db.delete(budgetItemsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/dashboard/notifications", () => {
  it("creates a notification when an event crosses into the warning state", async () => {
    await seedEvent({ name: "Summit", nameAr: "قمة", estimated: 100, actual: 95 });

    const res = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });

    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBe(1);
    expect(res.body.notifications).toHaveLength(1);
    expect(res.body.notifications[0]).toMatchObject({
      status: "warning",
      eventName: "Summit",
      read: false,
    });
  });

  it("does not re-notify on repeated polls with the same state (dedup)", async () => {
    await seedEvent({ name: "Summit", estimated: 100, actual: 150 });

    const first = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });
    expect(first.body.notifications).toHaveLength(1);
    expect(first.body.notifications[0].status).toBe("over");

    const second = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });
    expect(second.body.notifications).toHaveLength(1);
  });

  it("notifies again when an event escalates from warning to over", async () => {
    const eventId = await seedEvent({
      name: "Summit",
      estimated: 100,
      actual: 95,
    });

    await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });

    await setActual(eventId, 150);

    const res = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });

    expect(res.body.notifications).toHaveLength(2);
    expect(res.body.notifications.map((n: { status: string }) => n.status)).toContain(
      "over",
    );
  });

  it("scopes notifications to the owner key", async () => {
    await seedEvent({ name: "Summit", estimated: 100, actual: 150 });

    await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });

    const other = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: "someone-else", budgetThreshold: 90 });

    // The other owner sees their own (freshly created) notification, not double-counts.
    expect(other.body.notifications).toHaveLength(1);

    const mine = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });
    expect(mine.body.notifications).toHaveLength(1);
  });
});

describe("marking notifications read", () => {
  it("marks all notifications read for an owner", async () => {
    await seedEvent({ name: "Summit", estimated: 100, actual: 150 });
    await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });

    const res = await request(app)
      .post("/api/dashboard/notifications")
      .query({ ownerKey: OWNER });

    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBe(0);
    expect(res.body.notifications[0].read).toBe(true);
  });

  it("marks a single notification read", async () => {
    await seedEvent({ name: "Summit", estimated: 100, actual: 150 });
    const list = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });
    const id = list.body.notifications[0].id as number;

    const res = await request(app)
      .patch(`/api/dashboard/notifications/${id}/read`)
      .query({ ownerKey: OWNER });

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("returns 404 when marking another owner's notification read", async () => {
    await seedEvent({ name: "Summit", estimated: 100, actual: 150 });
    const list = await request(app)
      .get("/api/dashboard/notifications")
      .query({ ownerKey: OWNER, budgetThreshold: 90 });
    const id = list.body.notifications[0].id as number;

    const res = await request(app)
      .patch(`/api/dashboard/notifications/${id}/read`)
      .query({ ownerKey: "intruder" });

    expect(res.status).toBe(404);
  });
});
