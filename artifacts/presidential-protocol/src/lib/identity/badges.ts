import { palette } from "@/theme";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type { BadgeInfo } from "./types";

/** Role/department badge glyphs shown beside avatars. */
const GLYPH: Record<string, string> = {
  protocol: "🏛", operations: "🛡", media: "🎙", logistics: "✈",
  chairmanOffice: "💼", secretaryGeneral: "🏛", planning: "📊", agenda: "🗓",
  procurement: "🛒", finance: "💰", it: "💻", generalServices: "🛠",
  executive: "💼", security: "🛡", strategy: "📊", translation: "🎤",
};

export function badgeFor(department?: string): BadgeInfo {
  const key = department && GLYPH[department] ? department : "executive";
  const color = (department && DEPARTMENT_BY_KEY[department]?.color) || palette.mediumWood;
  return { key, glyph: GLYPH[key] ?? "💼", color };
}
