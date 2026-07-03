import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Per-officer preferences, scoped by the same `ownerKey` used for dashboard
// profiles (the app has no real auth user id). One row per owner.
export const userPreferencesTable = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  ownerKey: text("owner_key").notNull().unique(),
  budgetThreshold: integer("budget_threshold").notNull().default(90),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserPreferences = typeof userPreferencesTable.$inferSelect;
