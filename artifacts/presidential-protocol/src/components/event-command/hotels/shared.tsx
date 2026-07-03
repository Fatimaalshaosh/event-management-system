
import { palette } from "@/theme";













import { LayoutDashboard, Search, BedDouble, Users, ShieldCheck, MapPin, Building2, Hotel, Coffee, Plane, Sparkles } from "lucide-react";



/* Extracted from hotels-tab.tsx — tokens, constants, status styles. */
export const C = palette;

export type VipLevel = "standard" | "vip" | "vvip" | "headOfState";
export type Category = "any" | "luxury5" | "fiveStar" | "fourStar" | "boutique" | "resort" | "presidential";
export type SubKey = "dashboard" | "search" | "reservations" | "guests" | "protocol";

export const SUB_TABS: { key: SubKey; icon: typeof Search }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "search", icon: Search },
  { key: "reservations", icon: BedDouble },
  { key: "guests", icon: Users },
  { key: "protocol", icon: ShieldCheck },
];

export const HOTEL_STATUSES = ["reserved", "confirmed", "checked_in", "checked_out", "cancelled"] as const;
export const ROOM_TYPES = [
  "standard", "deluxe", "executive", "club",
  "juniorSuite", "executiveSuite", "royalSuite", "presidentialSuite",
] as const;
export const CATEGORIES: Category[] = ["any", "luxury5", "fiveStar", "fourStar", "boutique", "resort", "presidential"];
export const VIP_LEVELS: VipLevel[] = ["standard", "vip", "vvip", "headOfState"];

export const AMENITY_ICONS: Record<string, typeof Coffee> = {
  spa: Sparkles, privateBeach: MapPin, butler: Users, fineDining: Coffee,
  pool: Hotel, fitness: Hotel, helipad: Plane, marina: MapPin,
  ballroom: Building2, concierge: ShieldCheck,
};

export function statusStyle(status: string) {
  if (status === "cancelled") return { background: "#DC262610", color: "#DC2626" };
  if (status === "checked_in") return { background: C.mangrove + "1A", color: C.mangrove };
  if (status === "checked_out") return { background: C.calmTeal + "26", color: "#3F6663" };
  if (status === "reserved") return { background: C.sunset + "55", color: C.castleHill };
  return { background: C.calmTeal + "26", color: "#3F6663" };
}

export function availabilityStyle(a: string) {
  if (a === "available") return { background: C.mangrove + "1A", color: C.mangrove };
  if (a === "limited") return { background: C.sunset + "66", color: C.castleHill };
  return { background: "#DC262610", color: "#DC2626" };
}

