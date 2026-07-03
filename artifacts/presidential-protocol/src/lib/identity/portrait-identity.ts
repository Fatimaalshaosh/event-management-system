/* Explicit portrait identity derivation.
 *
 * Computes {gender, nationality, attire, portraitStyle, ethnicityPreset} ONLY
 * from explicit identity fields (gender, nationality, department, role) — never
 * from the name. Missing values get a safe explicit default by role / type.
 * The result is stored on each employee/contact identity record. */

import type { Attire, EthnicityPreset, Gender, PortraitIdentity, PortraitStyle } from "./types";

const NATION_NAME: Record<string, string> = {
  AE: "UAE", SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman",
  FR: "France", JP: "Japan", GB: "UK", US: "USA", IN: "India", PK: "Pakistan", CN: "China",
  DE: "Germany", IT: "Italy", ES: "Spain", NL: "Netherlands", RU: "Russia", KR: "South Korea",
  EG: "Egypt", JO: "Jordan", LB: "Lebanon", TR: "Turkey",
};
const ETHNICITY: Record<string, EthnicityPreset> = {
  AE: "emirati", SA: "gulf_arab", QA: "gulf_arab", KW: "gulf_arab", BH: "gulf_arab", OM: "gulf_arab",
  JP: "japanese", FR: "french", GB: "british", US: "american", IN: "indian", PK: "pakistani", CN: "chinese",
};
const EUROPEAN = new Set(["DE", "IT", "ES", "NL", "BE", "SE", "NO", "CH", "AT", "PT", "IE", "PL", "GR", "RU", "TR"]);

export function nationalityLabel(iso?: string): string {
  const k = (iso || "AE").toUpperCase();
  return NATION_NAME[k] ?? k;
}

export function ethnicityFor(iso?: string): EthnicityPreset {
  const k = (iso || "AE").toUpperCase();
  if (ETHNICITY[k]) return ETHNICITY[k];
  if (EUROPEAN.has(k)) return "european";
  return "european"; // safe default for unspecified international
}

function attireFor(p: { gender: Gender; nationality?: string; department?: string; role?: string }): Attire {
  const role = (p.role || "").toLowerCase();
  const dept = p.department || "";
  const emirati = (p.nationality || "AE").toUpperCase() === "AE";
  const female = p.gender === "female";
  const exec = /director|chief|chairman|deputy|general|head of|sector/.test(role);

  // Operational uniforms apply only to non-executive field staff.
  if (!exec) {
    if (/\bdriver\b|chauffeur/.test(role)) return "driver_uniform";
    if (/security|guard|protection/.test(role)) return "security_uniform";
    if (dept === "operations" && /officer|field|supervisor|live ops|patrol/.test(role)) return "operations_uniform";
  }
  if (emirati) return female ? "emirati_black_abaya_shaila" : "emirati_kandura_ghutra_agal";
  if (dept === "media" || /media|communications|press|broadcast/.test(role)) return "media_business_attire";
  if (dept === "protocol" || /diplomat|liaison|protocol|ambassador|embassy/.test(role)) return "diplomatic_business_attire";
  return "business_suit";
}

function styleFor(p: { department?: string; role?: string; attire: Attire }): PortraitStyle {
  const role = (p.role || "").toLowerCase();
  const dept = p.department || "";
  if (p.attire === "driver_uniform") return "transport_staff_headshot";
  if (p.attire === "security_uniform" || p.attire === "operations_uniform") return "security_officer_headshot";
  if (dept === "protocol") return "protocol_officer_headshot";
  if (dept === "chairmanOffice" || dept === "secretaryGeneral" || /director|chief|chairman|general|deputy|head of|sector/.test(role)) {
    return "government_executive_headshot";
  }
  if (p.attire === "diplomatic_business_attire" || /diplomat|ambassador|liaison|embassy/.test(role)) return "diplomatic_official_headshot";
  return "corporate_office_headshot";
}

/** The one explicit derivation used by the resolver and the demo data. */
export function buildPortraitIdentity(p: { gender?: Gender; nationality?: string; department?: string; role?: string }): PortraitIdentity {
  const gender: Gender = p.gender ?? "male"; // safe explicit default — never name-inferred
  const attire = attireFor({ gender, nationality: p.nationality, department: p.department, role: p.role });
  return {
    gender,
    nationality: nationalityLabel(p.nationality),
    attire,
    portraitStyle: styleFor({ department: p.department, role: p.role, attire }),
    ethnicityPreset: ethnicityFor(p.nationality),
  };
}
