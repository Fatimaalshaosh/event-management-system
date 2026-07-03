import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Internal & external participants attached to an event.
 * category: internal | external
 * subType (internal): protocol | logistics | planning | media | security
 * subType (external): delegation | vip | speaker | vendor | government
 * attendanceStatus: present | expected | absent
 */
export const participantsTable = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  category: text("category").notNull().default("internal"),
  subType: text("sub_type").notNull().default("protocol"),
  role: text("role"),
  roleAr: text("role_ar"),
  organization: text("organization"),
  organizationAr: text("organization_ar"),
  email: text("email"),
  phone: text("phone"),
  attendanceStatus: text("attendance_status").notNull().default("expected"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParticipantSchema = createInsertSchema(participantsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participantsTable.$inferSelect;
