/* Role-Based Portrait Intelligence.
 *
 * Deterministically maps an employee's role / seniority / department / gender /
 * nationality to a portrait PROFILE (attire, age band, seniority, setting) and a
 * precise generation PROMPT. This is provider-agnostic: a real AI image provider
 * (OpenAI Images, Azure OpenAI, Gemini, Flux) consumes `buildPortraitPrompt`,
 * and the offline renderer consumes the same profile — so every employee always
 * looks correct for their position, consistently, across the app. */

import { buildPortraitIdentity } from "./portrait-identity";
import type { Attire, PortraitRequest } from "./types";

export type SilhouetteAttire = "kandura" | "abaya" | "suitMale" | "suitFemale" | "security" | "driver";
export type Seniority = "executive" | "senior" | "staff";

export interface PortraitProfile {
  gender: "male" | "female";
  emirati: boolean;
  attire: SilhouetteAttire;
  seniority: Seniority;
  ageBand: [number, number];
  setting: string;
}

const EXEC = /director|chief|chairman|president|general|deputy|head of|sector/i;
const SENIOR = /manager|lead|senior|advisor|supervisor/i;
const DRIVER = /driver|chauffeur/i;
const SECURITY = /security|protection|guard|field supervisor/i;

export function portraitProfile(req: PortraitRequest): PortraitProfile {
  const emirati = (req.nationality || "AE").toUpperCase() === "AE";
  const female = req.gender === "female";
  const role = (req.role || "").toLowerCase();

  const seniority: Seniority = EXEC.test(role) ? "executive" : SENIOR.test(role) ? "senior" : "staff";
  const ageBand: [number, number] = seniority === "executive" ? [46, 60] : seniority === "senior" ? [38, 52] : [30, 46];

  let attire: SilhouetteAttire;
  if (DRIVER.test(role)) attire = "driver";
  else if (SECURITY.test(role) && !emirati) attire = "security";
  else if (emirati) attire = female ? "abaya" : "kandura";
  else attire = female ? "suitFemale" : "suitMale";

  const setting = seniority === "executive" ? "executive office" : "neutral studio";
  return { gender: female ? "female" : "male", emirati, attire, seniority, ageBand, setting };
}

/* ── Nationality-matched, attire-correct, age-correct, consistent-studio prompt ── */

const ATTIRE_PROMPT: Record<Attire, string> = {
  emirati_kandura_ghutra_agal: "wearing a pristine pressed white Emirati kandura with a white ghutra headdress held by a black agal",
  emirati_black_abaya_shaila: "wearing an elegant formal black abaya with a neatly draped black shayla headscarf",
  business_suit: "wearing a tailored dark navy business suit, a crisp white shirt and a conservative tie",
  security_uniform: "wearing a formal dark government security-service uniform with subtle insignia",
  driver_uniform: "wearing a formal grey government chauffeur uniform",
  operations_uniform: "wearing a dark government field-operations uniform with subtle insignia",
  media_business_attire: "wearing a modern dark business suit suited to a government communications official",
  diplomatic_business_attire: "wearing a formal dark diplomatic business suit",
};

/** Nationality (ISO) → explicit ethnicity phrase for the portrait prompt.
 * Unknown nationalities get a neutral appearance — NEVER defaulted to European. */
const ETHNICITY_BY_NATION: Record<string, string> = {
  AE: "Emirati Gulf-Arab", SA: "Saudi Gulf-Arab", QA: "Qatari Gulf-Arab", KW: "Kuwaiti Gulf-Arab", BH: "Bahraini Gulf-Arab", OM: "Omani Gulf-Arab",
  EG: "Egyptian Arab North-African", JO: "Jordanian Levantine Arab", MA: "Moroccan North-African Arab",
  FR: "French European", GB: "British European", DE: "German European", IT: "Italian European", ES: "Spanish European", CH: "Swiss European",
  US: "American", CA: "Canadian", AU: "Australian",
  JP: "Japanese", CN: "Chinese", KR: "Korean East-Asian", IN: "Indian South-Asian", PK: "Pakistani South-Asian", SG: "Singaporean Southeast-Asian", RU: "Russian Slavic",
};
export function ethnicityPhrase(iso?: string): { phrase: string; known: boolean } {
  const p = ETHNICITY_BY_NATION[(iso || "AE").toUpperCase()];
  return p ? { phrase: p, known: true } : { phrase: "neutral international", known: false };
}

/** Mature age band by role/seniority (no young faces). */
export function ageBandFor(role: string): [number, number] {
  const r = role.toLowerCase();
  if (/king|emir|president|prime minister|head of state|minister|ambassador|envoy|royal|highness|excellency/.test(r)) return [55, 72];
  if (/chairman|vice chairman|director general|chief|secretary general/.test(r)) return [50, 65];
  if (/director/.test(r)) return [44, 60];
  if (/manager/.test(r)) return [38, 55];
  if (/driver|chauffeur/.test(r)) return [38, 55];
  if (/security|guard|protection/.test(r)) return [34, 50];
  if (/senior/.test(r)) return [40, 52];
  if (/engineer|officer|coordinator|analyst|specialist|assistant|secretary|translator|interpreter|reception|photographer/.test(r)) return [30, 45];
  return [35, 52];
}

/** A single consistent "government studio photographer" style — identical for all. */
const STUDIO = "official government employee ID headshot, head-and-shoulders framing, soft even frontal key lighting, 85mm portrait lens, sharp focus, neutral composed professional expression (not smiling), looking directly at the camera, formal corporate government style, ultra-realistic photograph, high resolution, no fashion styling. Plain seamless light-grey studio backdrop only. No flags, no emblems, no banners, no logos, no text, no buildings, no scenery behind the subject";

/** A precise prompt for a real AI portrait provider — nationality, attire, age and
 * studio style all derived explicitly from the identity (never from the name). */
export function buildPortraitPrompt(req: PortraitRequest): string {
  const id = buildPortraitIdentity(req);
  const [lo, hi] = ageBandFor(req.role || "");
  const age = Math.round((lo + hi) / 2);
  const g = id.gender === "female" ? "woman" : "man";
  const eth = ethnicityPhrase(req.nationality);
  const person = eth.known
    ? `a ${age}-year-old mature, experienced ${eth.phrase} ${g}`
    : `a ${age}-year-old mature, experienced ${g} of neutral international professional appearance`;
  return [`Professional government executive portrait of ${person}`, ATTIRE_PROMPT[id.attire], STUDIO].join(", ");
}
