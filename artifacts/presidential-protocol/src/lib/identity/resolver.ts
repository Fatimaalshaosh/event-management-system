import { palette } from "@/theme";
import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import { badgeFor } from "./badges";
import { buildCoverDataUri } from "./cover";
import { buildPortraitIdentity } from "./portrait-identity";
import { portraitService } from "./service";
import type { Gender, IdentityInput, Presence, ResolvedIdentity } from "./types";

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const PRESENCE: Presence[] = ["available", "available", "busy", "meeting", "available", "busy", "offline", "leave"];

function initialsOf(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

/** Resolve any person into one deterministic, reusable executive identity. */
export function resolveIdentity(input: IdentityInput): ResolvedIdentity {
  const nationality = (input.nationality || "AE").toUpperCase();
  const gender: Gender = input.gender ?? "male"; // explicit safe default — never name-inferred
  const employeeId = input.id != null ? String(input.id) : undefined;
  const key = [input.id ?? "", input.name, gender, nationality, input.department ?? ""].join("|");
  const deptColor = (input.department && DEPARTMENT_BY_KEY[input.department]?.color) || palette.mediumWood;
  const badge = badgeFor(input.department);
  const presence: Presence = input.presence ?? PRESENCE[hash("p:" + key) % PRESENCE.length];
  const portraitUrl = portraitService.getPlaceholder({ key, employeeId, name: input.name, gender, nationality, role: input.role, department: input.department });
  const pid = buildPortraitIdentity({ gender, nationality: input.nationality, department: input.department, role: input.role });
  return {
    ...input,
    key, employeeId, gender, nationality, presence, deptColor, badge, portraitUrl,
    coverUrl: buildCoverDataUri(deptColor, badge.glyph),
    initials: initialsOf(input.name),
    nationalityLabel: pid.nationality,
    attire: input.attire ?? pid.attire,
    portraitStyle: input.portraitStyle ?? pid.portraitStyle,
    ethnicityPreset: input.ethnicityPreset ?? pid.ethnicityPreset,
  };
}
