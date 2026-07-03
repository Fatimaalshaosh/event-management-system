import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Contact Directory — people and entities across protocol operations.
 *
 * A single wide `contacts` table backs all seven contact categories
 * (internal / external / delegation / vip / government / vendor / embassy);
 * type-specific fields are nullable and surfaced conditionally in the UI.
 * Delegations get their own table + members; notes, event links and documents
 * are normalized side tables.
 */
export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  // Classification
  type: text("type").notNull().default("external"), // internal|external|delegation|vip|government|vendor|embassy
  status: text("status").notNull().default("active"), // active|inactive|pending|vip|confidential
  // Personal
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  gender: text("gender"),
  nationality: text("nationality"),          // country name
  countryCode: text("country_code"),         // ISO alpha-2 for the flag
  preferredLanguage: text("preferred_language").default("ar"),
  protocolTitle: text("protocol_title"),
  protocolTitleAr: text("protocol_title_ar"),
  salutation: text("salutation"),            // formal greeting / honorific
  passportNumber: text("passport_number"),
  emiratesId: text("emirates_id"),
  photoUrl: text("photo_url"),
  // Work
  organization: text("organization"),
  organizationAr: text("organization_ar"),
  department: text("department"),
  jobTitle: text("job_title"),
  jobTitleAr: text("job_title_ar"),
  roleInProtocol: text("role_in_protocol"),
  classification: text("classification"),    // internal|external
  reportingLine: text("reporting_line"),
  // Contact info
  email: text("email"),
  mobile: text("mobile"),
  officeNumber: text("office_number"),
  whatsapp: text("whatsapp"),
  assistantContact: text("assistant_contact"),
  // Protocol
  vipLevel: text("vip_level"),               // headOfState|minister|ambassador|seniorOfficial|standard
  delegationRole: text("delegation_role"),
  securityClearance: text("security_clearance"),
  protocolRank: text("protocol_rank"),
  seatingPreference: text("seating_preference"),
  giftPreference: text("gift_preference"),
  specialRequirements: text("special_requirements"),
  dietaryRequirements: text("dietary_requirements"),
  accessibilityRequirements: text("accessibility_requirements"),
  culturalNotes: text("cultural_notes"),
  // Internal org / workflow (mainly for type=internal users)
  departmentKey: text("department_key"),
  workflowRoles: text("workflow_roles"),          // comma-separated role keys
  permissionLevel: text("permission_level"),       // viewer|editor|approver|executive
  approvalAuthority: text("approval_authority"),
  availability: text("availability"),              // available|busy|leave
  taskCapacity: integer("task_capacity"),
  activeTasks: integer("active_tasks"),
  skills: text("skills"),                          // comma-separated
  extension: text("extension"),
  employeeType: text("employee_type"),             // fulltime|contractor|secondment
  eventResponsibilities: text("event_responsibilities"),
  // Flags
  pinned: boolean("pinned").notNull().default(false),
  confidential: boolean("confidential").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const delegationsTable = pgTable("delegations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  countryCode: text("country_code"),
  country: text("country"),
  countryAr: text("country_ar"),
  headContactId: integer("head_contact_id"),
  headName: text("head_name"),
  headNameAr: text("head_name_ar"),
  eventId: integer("event_id"),
  visitId: integer("visit_id"),
  readinessStatus: text("readiness_status").notNull().default("planning"), // planning|inProgress|ready
  status: text("status").notNull().default("active"),
  protocolNotes: text("protocol_notes"),
  protocolNotesAr: text("protocol_notes_ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const delegationMembersTable = pgTable("delegation_members", {
  id: serial("id").primaryKey(),
  delegationId: integer("delegation_id").notNull(),
  contactId: integer("contact_id"),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  role: text("role"),
  roleAr: text("role_ar"),
  isHead: boolean("is_head").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactNotesTable = pgTable("contact_notes", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  body: text("body").notNull(),
  author: text("author"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactEventLinksTable = pgTable("contact_event_links", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  eventId: integer("event_id").notNull(),
  role: text("role"),                        // speaker|vip|guest|organizer
  rsvpStatus: text("rsvp_status"),           // pending|accepted|declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactDocumentsTable = pgTable("contact_documents", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  kind: text("kind").notNull(),              // passport|emiratesId|clearance|invitation|note
  label: text("label").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;

export const insertDelegationSchema = createInsertSchema(delegationsTable).omit({ id: true, createdAt: true });
export type InsertDelegation = z.infer<typeof insertDelegationSchema>;
export type Delegation = typeof delegationsTable.$inferSelect;

export const insertDelegationMemberSchema = createInsertSchema(delegationMembersTable).omit({ id: true, createdAt: true });
export type InsertDelegationMember = z.infer<typeof insertDelegationMemberSchema>;
export type DelegationMember = typeof delegationMembersTable.$inferSelect;

export const insertContactNoteSchema = createInsertSchema(contactNotesTable).omit({ id: true, createdAt: true });
export type InsertContactNote = z.infer<typeof insertContactNoteSchema>;
export type ContactNote = typeof contactNotesTable.$inferSelect;

export const insertContactEventLinkSchema = createInsertSchema(contactEventLinksTable).omit({ id: true, createdAt: true });
export type InsertContactEventLink = z.infer<typeof insertContactEventLinkSchema>;
export type ContactEventLink = typeof contactEventLinksTable.$inferSelect;

export const insertContactDocumentSchema = createInsertSchema(contactDocumentsTable).omit({ id: true, createdAt: true });
export type InsertContactDocument = z.infer<typeof insertContactDocumentSchema>;
export type ContactDocument = typeof contactDocumentsTable.$inferSelect;
