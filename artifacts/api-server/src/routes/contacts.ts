import { Router } from "express";
import { db } from "@workspace/db";
import {
  contactsTable,
  contactNotesTable,
  contactEventLinksTable,
  contactDocumentsTable,
  insertContactSchema,
  insertContactNoteSchema,
  insertContactEventLinkSchema,
  insertContactDocumentSchema,
} from "@workspace/db";
import { eq, or, ilike, desc } from "drizzle-orm";
import {
  CreateContactBody,
  UpdateContactBody,
  AddContactNoteBody,
  LinkContactEventBody,
  AddContactDocumentBody,
} from "@workspace/api-zod";

const router = Router();

type Row = { createdAt: Date };
const ser = <T extends Row>(r: T) => ({ ...r, createdAt: r.createdAt.toISOString() });

/* ── List (optional ?type= & ?country=) ──────────────────── */
router.get("/contacts", async (req, res) => {
  try {
    const rows = await db.select().from(contactsTable).orderBy(desc(contactsTable.pinned), contactsTable.nameEn);
    let list = rows;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const country = typeof req.query.country === "string" ? req.query.country : undefined;
    if (type) list = list.filter((c) => c.type === type);
    if (country) list = list.filter((c) => c.countryCode === country);
    res.json(list.map(ser));
  } catch (err) {
    req.log.error({ err }, "Failed to list contacts");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Search ──────────────────────────────────────────────── */
router.get("/contacts/search", async (req, res) => {
  try {
    const q = (typeof req.query.q === "string" ? req.query.q : "").trim();
    if (!q) { res.json([]); return; }
    const like = `%${q}%`;
    const rows = await db
      .select()
      .from(contactsTable)
      .where(
        or(
          ilike(contactsTable.nameEn, like),
          ilike(contactsTable.nameAr, like),
          ilike(contactsTable.organization, like),
          ilike(contactsTable.organizationAr, like),
          ilike(contactsTable.jobTitle, like),
          ilike(contactsTable.nationality, like),
          ilike(contactsTable.email, like),
          ilike(contactsTable.mobile, like),
        ),
      );
    res.json(rows.map(ser));
  } catch (err) {
    req.log.error({ err }, "Failed to search contacts");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── By type ─────────────────────────────────────────────── */
router.get("/contacts/type/:type", async (req, res) => {
  try {
    const rows = await db.select().from(contactsTable).where(eq(contactsTable.type, req.params.type));
    res.json(rows.map(ser));
  } catch (err) {
    req.log.error({ err }, "Failed to list contacts by type");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── By country ──────────────────────────────────────────── */
router.get("/contacts/country/:countryCode", async (req, res) => {
  try {
    const rows = await db.select().from(contactsTable).where(eq(contactsTable.countryCode, req.params.countryCode));
    res.json(rows.map(ser));
  } catch (err) {
    req.log.error({ err }, "Failed to list contacts by country");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Get one (with notes / event links / documents) ──────── */
router.get("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.id, id));
    if (!contact) { res.status(404).json({ error: "Contact not found" }); return; }
    const [notes, eventLinks, documents] = await Promise.all([
      db.select().from(contactNotesTable).where(eq(contactNotesTable.contactId, id)).orderBy(desc(contactNotesTable.createdAt)),
      db.select().from(contactEventLinksTable).where(eq(contactEventLinksTable.contactId, id)),
      db.select().from(contactDocumentsTable).where(eq(contactDocumentsTable.contactId, id)),
    ]);
    res.json({
      ...ser(contact),
      notes: notes.map(ser),
      eventLinks: eventLinks.map(ser),
      documents: documents.map(ser),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get contact");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Create ──────────────────────────────────────────────── */
router.post("/contacts", async (req, res) => {
  try {
    const body = CreateContactBody.parse(req.body);
    const parsed = insertContactSchema.parse(body);
    const [contact] = await db.insert(contactsTable).values(parsed).returning();
    if (!contact) { res.status(500).json({ error: "Failed to create contact" }); return; }
    res.status(201).json(ser(contact));
  } catch (err) {
    req.log.error({ err }, "Failed to create contact");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Update ──────────────────────────────────────────────── */
router.put("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = UpdateContactBody.parse(req.body);
    const parsed = insertContactSchema.partial().parse(body);
    const [contact] = await db.update(contactsTable).set(parsed).where(eq(contactsTable.id, id)).returning();
    if (!contact) { res.status(404).json({ error: "Contact not found" }); return; }
    res.json(ser(contact));
  } catch (err) {
    req.log.error({ err }, "Failed to update contact");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Delete ──────────────────────────────────────────────── */
router.delete("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(contactsTable).where(eq(contactsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete contact");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── Add note ────────────────────────────────────────────── */
router.post("/contacts/:id/notes", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = AddContactNoteBody.parse(req.body);
    const parsed = insertContactNoteSchema.parse({ ...body, contactId: id });
    const [note] = await db.insert(contactNotesTable).values(parsed).returning();
    if (!note) { res.status(500).json({ error: "Failed to add note" }); return; }
    res.status(201).json(ser(note));
  } catch (err) {
    req.log.error({ err }, "Failed to add contact note");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Link event ──────────────────────────────────────────── */
router.post("/contacts/:id/link-event", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = LinkContactEventBody.parse(req.body);
    const parsed = insertContactEventLinkSchema.parse({ ...body, contactId: id });
    const [link] = await db.insert(contactEventLinksTable).values(parsed).returning();
    if (!link) { res.status(500).json({ error: "Failed to link event" }); return; }
    res.status(201).json(ser(link));
  } catch (err) {
    req.log.error({ err }, "Failed to link contact to event");
    res.status(400).json({ error: "Bad request" });
  }
});

/* ── Add document ────────────────────────────────────────── */
router.post("/contacts/:id/documents", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = AddContactDocumentBody.parse(req.body);
    const parsed = insertContactDocumentSchema.parse({ ...body, contactId: id });
    const [doc] = await db.insert(contactDocumentsTable).values(parsed).returning();
    if (!doc) { res.status(500).json({ error: "Failed to add document" }); return; }
    res.status(201).json(ser(doc));
  } catch (err) {
    req.log.error({ err }, "Failed to add contact document");
    res.status(400).json({ error: "Bad request" });
  }
});

export default router;
