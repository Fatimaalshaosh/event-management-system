import { Router } from "express";
import { db } from "@workspace/db";
import { invitationsTable, guestsTable, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetRsvpParams, SubmitRsvpParams, SubmitRsvpBody } from "@workspace/api-zod";
import { serializeInvitation } from "./invitations";
import { serializeGuest } from "./guests";

const router = Router();

async function buildRsvpView(invitationId: number, eventId: number, token: string) {
  const [invitation] = await db
    .select()
    .from(invitationsTable)
    .where(eq(invitationsTable.id, invitationId));
  if (!invitation) return null;
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
  const members = await db
    .select()
    .from(guestsTable)
    .where(eq(guestsTable.invitationId, invitationId));
  return {
    invitation: serializeInvitation(invitation),
    eventName: event?.name ?? "",
    eventNameAr: event?.nameAr ?? null,
    eventDate: event?.date ?? null,
    eventLocation: event?.location ?? null,
    eventLocationAr: event?.locationAr ?? null,
    members: members.map(serializeGuest),
    token,
  };
}

router.get("/rsvp/:token", async (req, res) => {
  try {
    const { token } = GetRsvpParams.parse({ token: req.params.token });
    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(eq(invitationsTable.publicToken, token));
    if (!invitation) { res.status(404).json({ error: "Not found" }); return; }
    // Mark the invitation as opened on first view.
    if (!invitation.openedAt) {
      await db
        .update(invitationsTable)
        .set({ openedAt: new Date() })
        .where(eq(invitationsTable.id, invitation.id));
    }
    const view = await buildRsvpView(invitation.id, invitation.eventId, token);
    if (!view) { res.status(404).json({ error: "Not found" }); return; }
    res.json(view);
  } catch (err) {
    req.log.error({ err }, "Failed to load RSVP");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/rsvp/:token", async (req, res) => {
  try {
    const { token } = SubmitRsvpParams.parse({ token: req.params.token });
    const body = SubmitRsvpBody.parse(req.body);
    const [invitation] = await db
      .select()
      .from(invitationsTable)
      .where(eq(invitationsTable.publicToken, token));
    if (!invitation) { res.status(404).json({ error: "Not found" }); return; }

    await db
      .update(invitationsTable)
      .set({
        status: body.response,
        respondedAt: new Date(),
        openedAt: invitation.openedAt ?? new Date(),
        nationality: body.nationality ?? invitation.nationality,
        passportNumber: body.passportNumber ?? invitation.passportNumber,
        emiratesId: body.emiratesId ?? invitation.emiratesId,
        organization: body.organization ?? invitation.organization,
        jobTitle: body.jobTitle ?? invitation.jobTitle,
        mobile: body.mobile ?? invitation.mobile,
        email: body.email ?? invitation.email,
        requiresFlight: body.requiresFlight ?? invitation.requiresFlight,
        requiresHotel: body.requiresHotel ?? invitation.requiresHotel,
        requiresTransport: body.requiresTransport ?? invitation.requiresTransport,
        accompanyingCount: body.accompanyingCount ?? invitation.accompanyingCount,
      })
      .where(eq(invitationsTable.id, invitation.id));

    // Delegation: replace member list with the coordinator's submission.
    // On decline, always clear any previously submitted members.
    if (invitation.isDelegation && (Array.isArray(body.members) || body.response === "declined")) {
      await db.delete(guestsTable).where(eq(guestsTable.invitationId, invitation.id));
      if (body.response === "accepted" && Array.isArray(body.members) && body.members.length > 0) {
        await db.insert(guestsTable).values(
          body.members.map((m) => ({
            eventId: invitation.eventId,
            invitationId: invitation.id,
            fullName: m.fullName,
            fullNameAr: m.fullNameAr ?? null,
            nationality: m.nationality ?? null,
            passportNumber: m.passportNumber ?? null,
            emiratesId: m.emiratesId ?? null,
            organization: m.organization ?? null,
            jobTitle: m.jobTitle ?? null,
            mobile: m.mobile ?? null,
            email: m.email ?? null,
            requiresFlight: m.requiresFlight ?? false,
            requiresHotel: m.requiresHotel ?? false,
            requiresTransport: m.requiresTransport ?? false,
          })),
        );
      }
    }

    const view = await buildRsvpView(invitation.id, invitation.eventId, token);
    if (!view) { res.status(404).json({ error: "Not found" }); return; }
    res.json(view);
  } catch (err) {
    req.log.error({ err }, "Failed to submit RSVP");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
