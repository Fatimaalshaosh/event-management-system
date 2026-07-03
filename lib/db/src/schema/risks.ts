import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const risksTable = pgTable("risks", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id"),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull().default("operational"),
  severity: text("severity").notNull().default("medium"),
  likelihood: text("likelihood").notNull().default("possible"),
  impact: text("impact"),
  impactAr: text("impact_ar"),
  mitigation: text("mitigation"),
  mitigationAr: text("mitigation_ar"),
  owner: text("owner"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRiskSchema = createInsertSchema(risksTable).omit({ id: true, createdAt: true });
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type Risk = typeof risksTable.$inferSelect;
