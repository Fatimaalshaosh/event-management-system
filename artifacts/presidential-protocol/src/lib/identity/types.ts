/* Executive Identity System — core types.
 * One identity per person, resolved once and reused everywhere. */

export type Gender = "male" | "female";
export type Presence = "available" | "busy" | "meeting" | "offline" | "leave";

/* ── Explicit portrait identity (never inferred from the name) ── */
export type Attire =
  | "emirati_kandura_ghutra_agal"
  | "emirati_black_abaya_shaila"
  | "business_suit"
  | "security_uniform"
  | "driver_uniform"
  | "operations_uniform"
  | "media_business_attire"
  | "diplomatic_business_attire";

export type PortraitStyle =
  | "government_executive_headshot"
  | "diplomatic_official_headshot"
  | "security_officer_headshot"
  | "protocol_officer_headshot"
  | "corporate_office_headshot"
  | "transport_staff_headshot";

export type EthnicityPreset =
  | "emirati" | "gulf_arab" | "japanese" | "french" | "european"
  | "british" | "american" | "indian" | "pakistani" | "chinese";

/** Explicit, role/nationality-correct portrait identity for a human. */
export interface PortraitIdentity {
  gender: Gender;
  nationality: string; // explicit name, e.g. "UAE", "France"
  attire: Attire;
  portraitStyle: PortraitStyle;
  ethnicityPreset: EthnicityPreset;
}

/** Raw identity input — what any caller knows about a person. */
export interface IdentityInput {
  id?: string | number;
  name: string;
  nameAr?: string;
  gender?: Gender;
  nationality?: string; // ISO-3166 alpha-2, defaults to "AE"
  role?: string;
  roleAr?: string;
  department?: string; // DeptKey
  presence?: Presence;
  email?: string;
  phone?: string;
  office?: string;
  tasks?: number;
  nextMeeting?: string;
  // Explicit portrait identity overrides (else derived from the fields above).
  attire?: Attire;
  portraitStyle?: PortraitStyle;
  ethnicityPreset?: EthnicityPreset;
}

export interface BadgeInfo {
  key: string;
  glyph: string; // emoji glyph
  color: string;
}

/** Fully resolved identity — deterministic portrait + presentation metadata. */
export interface ResolvedIdentity {
  key: string; // stable signature
  employeeId?: string; // stable portrait ownership key
  name: string;
  nameAr?: string;
  gender: Gender;
  nationality: string;
  role?: string;
  roleAr?: string;
  department?: string;
  presence: Presence;
  email?: string;
  phone?: string;
  office?: string;
  tasks?: number;
  nextMeeting?: string;
  portraitUrl: string;
  coverUrl: string;
  deptColor: string;
  badge: BadgeInfo;
  initials: string;
  // Explicit, resolved portrait identity (role/nationality-correct).
  nationalityLabel: string;
  attire: Attire;
  portraitStyle: PortraitStyle;
  ethnicityPreset: EthnicityPreset;
}

/** A pluggable portrait generator. Swap the active provider to connect a real
 * enterprise image service (OpenAI Images, Gemini, Flux, Azure OpenAI, …)
 * without touching any UI. */
export interface PortraitProvider {
  id: string;
  /** sync providers return a data URI immediately; async resolve a remote URL. */
  kind: "sync" | "async";
  generate(identity: PortraitRequest): string | Promise<string>;
}

/** The minimal identity facts a provider needs to render a face. The portrait is
 * OWNED by `employeeId` (stable primary key) when present — never by order/index. */
export interface PortraitRequest {
  key: string;
  employeeId?: string;
  name: string;
  gender: Gender;
  nationality: string;
  role?: string;
  department?: string;
}
