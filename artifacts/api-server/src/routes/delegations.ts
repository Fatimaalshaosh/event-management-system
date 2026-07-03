import { Router } from "express";
import { db } from "@workspace/db";
import {
  delegationsTable,
  delegationMembersTable,
  insertDelegationSchema,
  insertDelegationMemberSchema,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateDelegationBody,
  UpdateDelegationBody,
  AddDelegationMemberBody,
} from "@workspace/api-zod";

const router = Router();

type Row = { createdAt: Date };
const ser = <T extends Row>(r: T) => ({ ...r, createdAt: r.createdAt.toISOString() });

/* ── List (with member counts) ───────────────────────────── */
router.get("/delegations", async (req, res) => {
  try {
    const [delegations, members] = await Promise.all([
      db.select().from(delegationsTable),
      db.select().from(delegationMembersTable),
    ]);
    const counts = new Map<number, number>();
    for (const m of members) counts.set(m.delegationId, (counts.get(m.delegationId) ?? 0) + 1);
    res.json(delegations.map((d) => ({ ...ser(d), memberCount: counts.get(d.id) ?? 0 })));
  } catch (err) {
    req.log.error({ err }, "Failed to list delegations");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Get one (with members) ──────────────────────────────── */
router.get("/delegations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [delegation] = await db.select().from(delegationsTable).where(eq(delegationsTable.id, id));
    if (!delegation) { res.status(404).json({ error: "Delegation not found" }); return; }
    const members = await db.select().from(delegationMembersTable).where(eq(delegationMembersTable.delegationId, id));
    res.json({ ...ser(delegation), memberCount: members.length, members: members.map(ser) });
  } catch (err) {
    req.log.error({ err }, "Failed to get delegation");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Create ──────────────────────────────────────────────── */
router.post("/delegations", async (req, res) => {
  try {
    const body = CreateDelegationBody.parse(req.body);
    const parsed = insertDelegationSchema.parse(body);
    const [delegation] = await db.insert(delegationsTable).values(parsed).returning();
    if (!delegation) { res.status(500).json({ error: "Failed to create delegation" }); return; }
    res.status(201).json({ ...ser(delegation), memberCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create delegation");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Update ──────────────────────────────────────────────── */
router.put("/delegations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateDelegationBody.parse(req.body);
    const parsed = insertDelegationSchema.partial().parse(body);
    const [delegation] = await db.update(delegationsTable).set(parsed).where(eq(delegationsTable.id, id)).returning();
    if (!delegation) { res.status(404).json({ error: "Delegation not found" }); return; }
    res.json(ser(delegation));
  } catch (err) {
    req.log.error({ err }, "Failed to update delegation");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Add member ──────────────────────────────────────────── */
router.post("/delegations/:id/members", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = AddDelegationMemberBody.parse(req.body);
    const parsed = insertDelegationMemberSchema.parse({ ...body, delegationId: id });
    const [member] = await db.insert(delegationMembersTable).values(parsed).returning();
    if (!member) { res.status(500).json({ error: "Failed to add member" }); return; }
    res.status(201).json(ser(member));
  } catch (err) {
    req.log.error({ err }, "Failed to add delegation member");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Remove member ───────────────────────────────────────── */
router.delete("/delegations/:id/members/:memberId", async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    await db.delete(delegationMembersTable).where(eq(delegationMembersTable.id, memberId));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to remove delegation member");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
