import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export type DashboardWidgetSize = "sm" | "md" | "lg" | "full";

export type DashboardWidgetConfig = {
  id: string;
  hidden: boolean;
  size?: DashboardWidgetSize;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

export const dashboardProfilesTable = pgTable("dashboard_profiles", {
  id: serial("id").primaryKey(),
  ownerKey: text("owner_key").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  items: jsonb("items").$type<DashboardWidgetConfig[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type DashboardProfile = typeof dashboardProfilesTable.$inferSelect;
