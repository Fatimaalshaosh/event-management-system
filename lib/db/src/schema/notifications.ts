import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// A budget situation an event can be in, relative to the configured warning
// threshold. "none" means it is below the threshold (healthy).
export type BudgetNotificationStatus = "none" | "warning" | "over";

// Per-owner, per-event last-known budget status. Used to deduplicate budget
// notifications so an officer is only notified when an event escalates into a
// worse budget state, not on every dashboard refresh.
export const budgetAlertStatesTable = pgTable(
  "budget_alert_states",
  {
    id: serial("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    eventId: integer("event_id").notNull(),
    status: text("status").$type<BudgetNotificationStatus>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    ownerEvent: unique("budget_alert_states_owner_event").on(
      t.ownerKey,
      t.eventId,
    ),
  }),
);

// In-app notification feed entries. Currently only budget notifications are
// produced, but the `type` column leaves room for the feed to grow.
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  ownerKey: text("owner_key").notNull(),
  type: text("type").notNull().default("budget"),
  eventId: integer("event_id"),
  status: text("status").$type<BudgetNotificationStatus>(),
  spentPercent: integer("spent_percent"),
  overByPercent: integer("over_by_percent"),
  estimated: integer("estimated"),
  actual: integer("actual"),
  currency: text("currency"),
  eventName: text("event_name"),
  eventNameAr: text("event_name_ar"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type NotificationRow = typeof notificationsTable.$inferSelect;
export type BudgetAlertStateRow = typeof budgetAlertStatesTable.$inferSelect;
