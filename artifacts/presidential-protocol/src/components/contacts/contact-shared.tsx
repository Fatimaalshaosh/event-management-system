import { type ElementType } from "react";
import { useTranslation } from "react-i18next";
import { palette } from "@/theme";
import type { Contact } from "@workspace/api-client-react";
import { UserRound, UserPlus, Users, Crown, Landmark, Briefcase, Building2, ShieldCheck, CalendarClock, Plane, Target, MinusCircle } from "lucide-react";
import { ExecutiveAvatar } from "@/components/identity";
import type { Gender, IdentityInput, Presence } from "@/lib/identity";
import { DEPARTMENT_BY_KEY } from "./org-structure";

export const C = palette;

export type ContactType =
  | "internal" | "external" | "delegation" | "vip" | "government" | "vendor" | "embassy";

export const CONTACT_TYPES: ContactType[] = [
  "internal", "external", "delegation", "vip", "government", "vendor", "embassy",
];

export const TYPE_META: Record<string, { icon: ElementType; color: string }> = {
  internal:   { icon: UserRound, color: C.mangrove },
  external:   { icon: UserPlus,  color: C.calmTeal },
  delegation: { icon: Users,     color: C.mediumWood },
  vip:        { icon: Crown,     color: C.gold },
  government: { icon: Landmark,  color: C.castleHill },
  vendor:     { icon: Briefcase, color: C.warmGray },
  embassy:    { icon: Building2, color: C.teal },
};

export const STATUS_META: Record<string, { bg: string; color: string }> = {
  active:       { bg: C.mangrove + "1A", color: C.mangrove },
  inactive:     { bg: C.warmGray + "22", color: C.warmGray },
  pending:      { bg: C.sunset + "44",   color: C.mediumWood },
  vip:          { bg: C.gold + "26",     color: C.mediumWood },
  confidential: { bg: C.castleHill + "1A", color: C.castleHill },
};

export const VIP_LEVELS = ["headOfState", "minister", "ambassador", "seniorOfficial", "standard"];

export const nameOf = (c: Contact, lang: string) =>
  lang === "en" ? (c.nameEn || c.nameAr || "") : (c.nameAr || c.nameEn || "");
export const roleOf = (c: Contact, lang: string) =>
  lang === "en"
    ? (c.jobTitle || c.protocolTitle || "")
    : (c.jobTitleAr || c.protocolTitleAr || c.jobTitle || c.protocolTitle || "");
export const orgOf = (c: Contact, lang: string) =>
  lang === "en" ? (c.organization || "") : (c.organizationAr || c.organization || "");

export function initials(name: string): string {
  const parts = name.replace(/^(H\.E\.|H\.R\.H\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, "").trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "•";
}

const availToPresence = (a?: string | null): Presence | undefined =>
  a === "available" ? "available" : a === "busy" ? "busy" : a === "leave" ? "leave" : a === "meeting" ? "meeting" : undefined;

/** Map a Contact record onto the shared Executive Identity. */
export function contactIdentity(c: Contact): IdentityInput {
  return {
    id: c.id,
    name: c.nameEn || c.nameAr || "",
    nameAr: c.nameAr ?? undefined,
    gender: c.gender === "male" || c.gender === "female" ? (c.gender as Gender) : undefined,
    nationality: c.countryCode || (c.type === "internal" ? "AE" : undefined), // ISO code, not full name

    role: c.jobTitle ?? undefined,
    department: c.departmentKey ?? undefined,
    email: c.email ?? undefined,
    presence: availToPresence(c.availability),
  };
}

/** Contact types that represent a person (→ realistic human portrait) vs an
 * organization (→ tinted org icon). */
const HUMAN_TYPES = new Set(["internal", "external", "delegation", "vip"]);

/** Avatar for a contact. People get a realistic portrait via ExecutiveAvatar;
 * organizations (embassy/vendor/government) get a tinted organization icon.
 * A real photoUrl always wins. */
export function ContactAvatar({ contact, size = 44, hover = true }: { contact: Contact; size?: number; hover?: boolean }) {
  if (contact.photoUrl) {
    return (
      <img src={contact.photoUrl} alt="" style={{ width: size, height: size, borderRadius: size, objectFit: "cover" }} className="shrink-0" />
    );
  }
  if (!HUMAN_TYPES.has(contact.type)) {
    const meta = TYPE_META[contact.type] ?? TYPE_META.external;
    const Icon = meta.icon;
    return (
      <div
        className="shrink-0 flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: size, background: meta.color + "1A", color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}33` }}
      >
        <Icon size={size * 0.42} strokeWidth={1.6} />
      </div>
    );
  }
  return (
    <ExecutiveAvatar identity={contactIdentity(contact)} size={size} hover={hover} showPresence={contact.type === "internal"} />
  );
}

export function TypeBadge({ type }: { type: string }) {
  const { t } = useTranslation();
  const meta = TYPE_META[type] ?? TYPE_META.external;
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-[3px] rounded-md tracking-[0.02em]"
      style={{ background: meta.color + "12", color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}26` }}
    >
      <Icon size={10} strokeWidth={1.9} />
      {t(`contacts.types.${type}`)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const s = STATUS_META[status] ?? { bg: C.border, color: C.warmGray };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-[3px] rounded-md tracking-[0.02em]" style={{ background: s.bg, color: s.color, boxShadow: `inset 0 0 0 1px ${s.color}22` }}>
      {status === "confidential" && <ShieldCheck size={10} strokeWidth={2} />}
      {t(`contacts.status.${status}`)}
    </span>
  );
}

export function VipBadge({ level }: { level: string }) {
  const { t } = useTranslation();
  const key = VIP_LEVELS.includes(level) ? level : "standard";
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[3px] rounded-md tracking-[0.02em]"
      style={{ background: `linear-gradient(180deg, ${C.gold}26, ${C.gold}14)`, color: C.mediumWood, boxShadow: `inset 0 0 0 1px ${C.gold}66` }}
    >
      <Crown size={10} strokeWidth={1.9} style={{ color: C.gold }} />
      {t(`contacts.vipLevels.${key}`)}
    </span>
  );
}

/* ── Executive directory helpers (premium card / compact / table views) ── */

/** Tiny bilingual label helper for the new directory chrome (presence, view
 * modes, table headers) without expanding the i18n bundle. */
export const tl = (lang: string, en: string, ar: string) => (lang === "en" ? en : ar);

export type PresenceState = "available" | "meeting" | "mission" | "vip" | "travelling" | "offline";

/** Richer executive presence: dot color + bilingual label + tinted background. */
export const PRESENCE_META: Record<PresenceState, { color: string; en: string; ar: string; icon: ElementType | null }> = {
  available:  { color: C.mangrove,   en: "Available",  ar: "متاح",        icon: null },
  meeting:    { color: C.gold,       en: "In Meeting", ar: "في اجتماع",  icon: CalendarClock },
  mission:    { color: C.calmTeal,   en: "On Mission", ar: "في مهمة",    icon: Target },
  vip:        { color: C.castleHill, en: "VIP Visit",  ar: "زيارة كبار", icon: Crown },
  travelling: { color: C.sunset,     en: "Travelling", ar: "مسافر",       icon: Plane },
  offline:    { color: C.warmGray,   en: "Offline",    ar: "غير متصل",   icon: MinusCircle },
};

/** Map a contact's stored availability to an executive presence state. */
export function presenceFor(c: Contact): PresenceState {
  switch (c.availability) {
    case "available": return "available";
    case "busy":
    case "meeting": return "meeting";
    case "mission": return "mission";
    case "vip":
    case "vipVisit": return "vip";
    case "travel":
    case "travelling": return "travelling";
    case "leave":
    case "offline": return "offline";
    default: return c.type === "internal" ? "available" : "offline";
  }
}

/** People show presence; organizations do not. */
export const IS_PERSON = (type: string) => HUMAN_TYPES.has(type);

/** Subtle role/department accent (used for cover gradients + small cues, never
 * the whole card). Internal users take their department color; others take the
 * contact-type color. */
export function accentFor(c: Contact): string {
  if (c.type === "internal" && c.departmentKey && DEPARTMENT_BY_KEY[c.departmentKey]?.color) {
    return DEPARTMENT_BY_KEY[c.departmentKey].color;
  }
  return (TYPE_META[c.type] ?? TYPE_META.external).color;
}

/** A very soft executive cover gradient derived from the accent. */
export const coverGradient = (accent: string) => `linear-gradient(120deg, ${accent}1F 0%, ${accent}0A 55%, ${accent}05 100%)`;

/** Premium near-white card surface (top #FFFFFF → bottom #FCFAF6). */
export const CARD_SURFACE = "linear-gradient(180deg, #FFFFFF 0%, #FCFAF6 100%)";

/** Small executive presence chip: dot + label + tinted background. */
export function PresenceChip({ state, lang }: { state: PresenceState; lang: string }) {
  const m = PRESENCE_META[state];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-[3px] rounded-md"
      style={{ background: m.color + "14", color: m.color, boxShadow: `inset 0 0 0 1px ${m.color}26` }}>
      {Icon ? <Icon size={10} strokeWidth={2} /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />}
      {tl(lang, m.en, m.ar)}
    </span>
  );
}

/** Soft, role/department-based executive cover tones (desaturated, premium). */
const COVER_TONE: Record<string, string> = {
  chairmanOffice: "#C7B393", secretaryGeneral: "#CBBC9F", protocol: "#6FAEAB", security: "#828C99",
  operations: "#869AA0", it: "#8FA3B5", legal: "#CBBE9C", finance: "#B79B73", planning: "#9FAE86",
  agenda: "#9FAE86", media: "#B3A4AE", procurement: "#B79B73", generalServices: "#B0AA9E", logistics: "#A9A79B",
  government: "#ABB1A6", embassy: "#94A6B2", vendor: "#9A958D", vip: "#CBB075", internal: "#9CB397", external: "#86AFAB",
};

/** Cover tone for a contact — department for internal users, type otherwise. */
export function coverToneFor(c: Contact): string {
  if (c.type === "internal" && c.departmentKey && COVER_TONE[c.departmentKey]) return COVER_TONE[c.departmentKey];
  return COVER_TONE[c.type] ?? COVER_TONE.external;
}

/** Executive rank (1 = staff … 6 = head of state) for subtle visual hierarchy. */
export function rankFor(c: Contact): number {
  const r = `${c.jobTitle ?? ""} ${c.protocolTitle ?? ""} ${c.vipLevel ?? ""}`.toLowerCase();
  if (c.vipLevel === "headOfState" || /head of state|king|emir|president|prime minister|highness|royal/.test(r)) return 6;
  if (/\bchairman\b/.test(r) && !/vice|deputy/.test(r)) return 5;
  if (/vice chairman|deputy chairman|secretary general|director general|\bminister\b/.test(r)) return 4;
  if (/\bdirector\b|\bchief\b|ambassador/.test(r)) return 3;
  if (/manager|\blead\b|head of/.test(r)) return 2;
  return 1;
}
