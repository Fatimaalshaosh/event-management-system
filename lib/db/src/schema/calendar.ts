import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const calendarEntriesTable = pgTable("calendar_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  time: text("time").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull().default("event"),
  eventId: integer("event_id"),
  location: text("location"),
  locationAr: text("location_ar"),
});

export const insertCalendarEntrySchema = createInsertSchema(calendarEntriesTable).omit({ id: true });
export type InsertCalendarEntry = z.infer<typeof insertCalendarEntrySchema>;
export type CalendarEntry = typeof calendarEntriesTable.$inferSelect;
