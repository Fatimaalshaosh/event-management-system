import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vipsTable = pgTable("vips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  country: text("country").notNull(),
  countryAr: text("country_ar"),
  clearanceLevel: text("clearance_level").notNull().default("standard"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVipSchema = createInsertSchema(vipsTable).omit({ id: true, createdAt: true });
export type InsertVip = z.infer<typeof insertVipSchema>;
export type Vip = typeof vipsTable.$inferSelect;
