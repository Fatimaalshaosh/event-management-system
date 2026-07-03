import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db } from "@workspace/db";
import { invitationsTable, insertInvitationSchema, type Invitation } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListInvitationsQueryParams,
  CreateInvitationBody,
  UpdateInvitationParams,
  UpdateInvitationBody,
} from "@workspace/api-zod";

const router = Router();

export function serializeInvitation(inv: Invitation) {
  return {
    ...inv,
    sentAt: inv.sentAt.toISOString(),
    deliveredAt: inv.deliveredAt?.toISOString() ?? null,
    openedAt: inv.openedAt?.toISOString() ?? null,
    respondedAt: inv.respondedAt?.toISOString() ?? null,
  };
}

router.get("/invitations", async (req, res) => {
  try {
    const query = ListInvitationsQueryParams.parse(req.query);
    const invitations = query.eventId
      ? await db.select().from(invitationsTable).where(eq(invitationsTable.eventId, query.eventId))
      : await db.select().from(invitationsTable);
    res.json(invitations.map(serializeInvitation));
  } catch (err) {
    req.log.error({ err }, "Failed to list invitations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invitations", async (req, res) => {
  try {
    const body = CreateInvitationBody.parse(req.body);
    const publicToken = randomBytes(16).toString("hex");
    const qrCode = `QR-${body.eventId}-${publicToken.slice(0, 10)}`;
    const parsed = insertInvitationSchema.parse({ ...body, publicToken, qrCode });
    // Email/SMS delivery is simulated — mark delivered immediately.
    const [invitation] = await db
      .insert(invitationsTable)
      .values({ ...parsed, deliveredAt: new Date() })
      .returning();
    if (!invitation) { res.status(500).json({ error: "Failed to create invitation" }); return; }
    res.status(201).json(serializeInvitation(invitation));
  } catch (err) {
    req.log.error({ err }, "Failed to create invitation");
    res.status(400).json({ error: "Bad request" });
  }
});

router.patch("/invitations/:id", async (req, res) => {
  try {
    const { id } = UpdateInvitationParams.parse({ id: Number(req.params.id) });
    const body = UpdateInvitationBody.parse(req.body);
    const patch: Partial<Invitation> = { ...body };
    if (body.status === "accepted" || body.status === "declined") {
      patch.respondedAt = new Date();
    }
    const [invitation] = await db
      .update(invitationsTable)
      .set(patch)
      .where(eq(invitationsTable.id, id))
      .returning();
    if (!invitation) { res.status(404).json({ error: "Not found" }); return; }
    res.json(serializeInvitation(invitation));
  } catch (err) {
    req.log.error({ err }, "Failed to update invitation");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
