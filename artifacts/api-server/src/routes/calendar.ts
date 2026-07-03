import { Router } from "express";
import { db } from "@workspace/db";
import { calendarEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListCalendarEntriesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/calendar", async (req, res) => {
  try {
    const query = ListCalendarEntriesQueryParams.parse(req.query);
    let entries;
    if (query.date) {
      entries = await db
        .select()
        .from(calendarEntriesTable)
        .where(eq(calendarEntriesTable.date, query.date));
    } else {
      entries = await db.select().from(calendarEntriesTable);
    }
    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Failed to list calendar entries");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
