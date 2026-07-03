
import { palette } from "@/theme";











import { LayoutDashboard, Search, Ticket, Users } from "lucide-react";



/* Extracted from flights-tab.tsx — tokens, constants, status styles. */
export const C = palette;

export type CabinClass = "first" | "business" | "economy";
export type Direction = "arrival" | "departure";
export type SubKey = "dashboard" | "search" | "bookings" | "guests";

export const SUB_TABS: { key: SubKey; icon: typeof Search }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "search", icon: Search },
  { key: "bookings", icon: Ticket },
  { key: "guests", icon: Users },
];

export const TRAVEL_STATUSES = ["confirmed", "pending", "delayed", "arrived", "departed", "cancelled"] as const;

export function statusStyle(status: string) {
  if (status === "cancelled" || status === "delayed") return { background: "#DC262610", color: "#DC2626" };
  if (status === "arrived" || status === "departed") return { background: C.mangrove + "1A", color: C.mangrove };
  if (status === "pending") return { background: C.sunset + "55", color: C.castleHill };
  return { background: C.calmTeal + "26", color: "#3F6663" };
}

