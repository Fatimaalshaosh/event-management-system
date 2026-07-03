import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  date: text("date").notNull(),
  location: text("location").notNull(),
  locationAr: text("location_ar"),
  status: text("status").notNull().default("upcoming"),
  readinessPercent: integer("readiness_percent").notNull().default(0),
  riskLevel: text("risk_level").default("low"),
  pendingTasksCount: integer("pending_tasks_count").notNull().default(0),
  time: text("time"),
  eventType: text("event_type").default("internalEvent"),
  country: text("country"),
  countryAr: text("country_ar"),
  vipLevel: text("vip_level").default("standard"),
  priority: text("priority").default("medium"),
  notes: text("notes"),
  pinned: boolean("pinned").notNull().default(false),
  pinOrder: integer("pin_order").notNull().default(0),
  colorTag: text("color_tag"),
  watched: boolean("watched").notNull().default(false),
  cancellationReason: text("cancellation_reason"),
  cancelledBy: text("cancelled_by"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

export const readinessCategoriesTable = pgTable("readiness_categories", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  status: text("status").notNull().default("pending"),
  percent: integer("percent").notNull().default(0),
});

export const insertReadinessCategorySchema = createInsertSchema(readinessCategoriesTable).omit({ id: true });
export type InsertReadinessCategory = z.infer<typeof insertReadinessCategorySchema>;
export type ReadinessCategory = typeof readinessCategoriesTable.$inferSelect;
