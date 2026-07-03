import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visitsTable = pgTable("visits", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  guestNameAr: text("guest_name_ar"),
  country: text("country").notNull(),
  countryAr: text("country_ar"),
  arrivalDate: text("arrival_date").notNull(),
  departureDate: text("departure_date"),
  status: text("status").notNull().default("scheduled"),
  purpose: text("purpose"),
  purposeAr: text("purpose_ar"),
  protocolLevel: text("protocol_level").notNull().default("standard"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVisitSchema = createInsertSchema(visitsTable).omit({ id: true, createdAt: true });
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visitsTable.$inferSelect;
