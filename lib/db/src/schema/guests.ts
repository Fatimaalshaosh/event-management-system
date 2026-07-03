import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Delegation members submitted by a coordinator via the public RSVP link.
 * Each row belongs to a delegation invitation (invitationId).
 */
export const guestsTable = pgTable("event_guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  invitationId: integer("invitation_id"),
  fullName: text("full_name").notNull(),
  fullNameAr: text("full_name_ar"),
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  emiratesId: text("emirates_id"),
  organization: text("organization"),
  jobTitle: text("job_title"),
  mobile: text("mobile"),
  email: text("email"),
  requiresFlight: boolean("requires_flight").notNull().default(false),
  requiresHotel: boolean("requires_hotel").notNull().default(false),
  requiresTransport: boolean("requires_transport").notNull().default(false),
  attended: boolean("attended").notNull().default(false),
  vipVerified: boolean("vip_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGuestSchema = createInsertSchema(guestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guestsTable.$inferSelect;
