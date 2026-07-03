import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invitationsTable = pgTable("invitations", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  guestNameAr: text("guest_name_ar"),
  email: text("email"),
  eventId: integer("event_id").notNull(),
  // pending | accepted | declined
  status: text("status").notNull().default("pending"),
  // domestic | international | vip | delegation
  inviteType: text("invite_type").notNull().default("domestic"),
  // email | sms | whatsapp
  channel: text("channel").notNull().default("email"),
  publicToken: text("public_token").notNull().unique(),
  isDelegation: boolean("is_delegation").notNull().default(false),
  delegationName: text("delegation_name"),
  delegationNameAr: text("delegation_name_ar"),
  // Guest-submitted RSVP details (individual invitations)
  nationality: text("nationality"),
  passportNumber: text("passport_number"),
  emiratesId: text("emirates_id"),
  organization: text("organization"),
  jobTitle: text("job_title"),
  mobile: text("mobile"),
  requiresFlight: boolean("requires_flight").notNull().default(false),
  requiresHotel: boolean("requires_hotel").notNull().default(false),
  requiresTransport: boolean("requires_transport").notNull().default(false),
  accompanyingCount: integer("accompanying_count").notNull().default(0),
  vipLevel: text("vip_level"),
  attended: boolean("attended").notNull().default(false),
  vipVerified: boolean("vip_verified").notNull().default(false),
  qrCode: text("qr_code"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  respondedAt: timestamp("responded_at"),
});

export const insertInvitationSchema = createInsertSchema(invitationsTable).omit({
  id: true,
  sentAt: true,
  deliveredAt: true,
  openedAt: true,
  respondedAt: true,
});
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitationsTable.$inferSelect;
