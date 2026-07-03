import { Router } from "express";
import { db } from "@workspace/db";
import {
  travelTable,
  insertTravelSchema,
  hotelBookingsTable,
  insertHotelBookingSchema,
  fleetAssignmentsTable,
  insertFleetAssignmentSchema,
  giftsTable,
  insertGiftSchema,
  budgetItemsTable,
  insertBudgetItemSchema,
  documentsTable,
  insertDocumentSchema,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router = Router();
const objectStorageService = new ObjectStorageService();

function serialize<T extends { createdAt: Date }>(row: T) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

// Each logistics entity exposes identical CRUD shape, so register them generically.
// Tables are loosely typed here because they share the eventId / id / createdAt columns.
/* eslint-disable @typescript-eslint/no-explicit-any */
function registerCrud(
  collection: string,
  table: any,
  insertSchema: { parse: (input: unknown) => Record<string, unknown> },
  label: string,
) {
  router.get(`/events/:id/${collection}`, async (req, res) => {
    try {
      const eventId = Number(req.params.id);
      const rows = await db.select().from(table).where(eq(table.eventId, eventId));
      res.json(rows.map((r: { createdAt: Date }) => serialize(r)));
    } catch (err) {
      req.log.error({ err }, `Failed to list ${label}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post(`/${collection}`, async (req, res) => {
    try {
      const parsed = insertSchema.parse(req.body);
      const [row] = (await db.insert(table).values(parsed).returning()) as any[];
      if (!row) {
        res.status(500).json({ error: `Failed to create ${label}` });
        return;
      }
      res.status(201).json(serialize(row as { createdAt: Date }));
    } catch (err) {
      req.log.error({ err }, `Failed to create ${label}`);
      res.status(400).json({ error: "Bad request" });
    }
  });

  router.patch(`/${collection}/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const body = (insertSchema as any).partial().parse(req.body);
      const [row] = (await db.update(table).set(body).where(eq(table.id, id)).returning()) as any[];
      if (!row) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(serialize(row as { createdAt: Date }));
    } catch (err) {
      req.log.error({ err }, `Failed to update ${label}`);
      res.status(400).json({ error: "Bad request" });
    }
  });

  router.delete(`/${collection}/:id`, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(table).where(eq(table.id, id));
      res.status(204).send();
    } catch (err) {
      req.log.error({ err }, `Failed to delete ${label}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

registerCrud("travel", travelTable, insertTravelSchema, "travel record");
registerCrud("hotel-bookings", hotelBookingsTable, insertHotelBookingSchema, "hotel booking");
registerCrud("fleet", fleetAssignmentsTable, insertFleetAssignmentSchema, "fleet assignment");
registerCrud("gifts", giftsTable, insertGiftSchema, "gift");
registerCrud("budget", budgetItemsTable, insertBudgetItemSchema, "budget item");
registerCrud("documents", documentsTable, insertDocumentSchema, "document");

// Event-scoped download for an uploaded document file.
// Retrieval is verified against the owning event + document so private uploads
// are not globally reachable by their object key.
router.get("/events/:eventId/documents/:docId/file", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const docId = Number(req.params.docId);

    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, docId));

    if (!doc || doc.eventId !== eventId || !doc.filePath) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(doc.filePath);
    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-disposition") res.setHeader(key, value);
    });
    if (doc.fileName) {
      res.setHeader(
        "Content-Disposition",
        `inline; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      );
    }

    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    req.log.error({ err }, "Failed to serve document file");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
