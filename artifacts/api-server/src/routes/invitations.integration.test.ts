import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import {
  db,
  pool,
  eventsTable,
  invitationsTable,
  guestsTable,
  type Event,
} from "@workspace/db";
import { eq } from "drizzle-orm";
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
  await db.delete(guestsTable);
  await db.delete(invitationsTable);
  await db.delete(eventsTable);
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/invitations", () => {
  it("creates an invitation with a public token and QR code", async () => {
    const event = await seedEvent();
    const res = await request(app)
      .post("/api/invitations")
      .send({ guestName: "Guest One", eventId: event.id });

    expect(res.status).toBe(201);
    expect(res.body.publicToken).toBeTypeOf("string");
    expect(res.body.qrCode).toBeTypeOf("string");
    expect(res.body.deliveredAt).not.toBeNull();
  });

  it("returns 400 for an invalid body", async () => {
    const res = await request(app).post("/api/invitations").send({ guestName: "No event" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/invitations", () => {
  it("lists invitations and filters by event", async () => {
    const eventA = await seedEvent();
    const eventB = await seedEvent({ name: "Other" });
    await request(app).post("/api/invitations").send({ guestName: "A", eventId: eventA.id });
    await request(app).post("/api/invitations").send({ guestName: "B", eventId: eventB.id });

    const all = await request(app).get("/api/invitations");
    expect(all.status).toBe(200);
    expect(all.body).toHaveLength(2);

    const filtered = await request(app).get("/api/invitations").query({ eventId: eventA.id });
    expect(filtered.status).toBe(200);
    expect(filtered.body).toHaveLength(1);
    expect(filtered.body[0].guestName).toBe("A");
  });
});

describe("PATCH /api/invitations/:id", () => {
  it("updates status and stamps respondedAt on acceptance", async () => {
    const event = await seedEvent();
    const created = await request(app)
      .post("/api/invitations")
      .send({ guestName: "Guest", eventId: event.id });

    const res = await request(app)
      .patch(`/api/invitations/${created.body.id}`)
      .send({ status: "accepted" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("accepted");
    expect(res.body.respondedAt).not.toBeNull();
  });

  it("returns 404 for a missing invitation", async () => {
    const res = await request(app)
      .patch("/api/invitations/999999")
      .send({ status: "accepted" });
    expect(res.status).toBe(404);
  });
});

describe("RSVP flow", () => {
  it("loads the RSVP view by public token and marks it opened", async () => {
    const event = await seedEvent();
    const created = await request(app)
      .post("/api/invitations")
      .send({ guestName: "Coordinator", eventId: event.id });
    const token = created.body.publicToken as string;

    const res = await request(app).get(`/api/rsvp/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.eventName).toBe(event.name);
    expect(res.body.invitation.openedAt).not.toBeNull();
  });

  it("returns 404 for an unknown token", async () => {
    const res = await request(app).get("/api/rsvp/not-a-real-token");
    expect(res.status).toBe(404);
  });

  it("submits an individual acceptance", async () => {
    const event = await seedEvent();
    const created = await request(app)
      .post("/api/invitations")
      .send({ guestName: "Guest", eventId: event.id });
    const token = created.body.publicToken as string;

    const res = await request(app)
      .post(`/api/rsvp/${token}`)
      .send({ response: "accepted", nationality: "FR" });
    expect(res.status).toBe(200);
    expect(res.body.invitation.status).toBe("accepted");
  });

  it("replaces delegation members on a delegation acceptance", async () => {
    const event = await seedEvent();
    const created = await request(app)
      .post("/api/invitations")
      .send({ guestName: "Lead", eventId: event.id, isDelegation: true });
    const token = created.body.publicToken as string;

    const res = await request(app)
      .post(`/api/rsvp/${token}`)
      .send({
        response: "accepted",
        members: [
          { fullName: "Member One" },
          { fullName: "Member Two" },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(2);

    const rows = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.invitationId, created.body.id));
    expect(rows).toHaveLength(2);
  });
});
