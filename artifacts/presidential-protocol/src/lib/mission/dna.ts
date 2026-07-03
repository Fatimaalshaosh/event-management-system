import type { MissionContext, MissionDNA } from "./types";

/** Reusable mission DNA fingerprints (demo). The resolver maps any mission
 * context to the closest archetype by country, VIP level and type. */
export const MISSION_DNA: MissionDNA[] = [
  {
    key: "france-presidential",
    label: { en: "France Presidential Visit", ar: "زيارة رئيس فرنسا" },
    countryCode: "FR", vipLevel: "headOfState",
    protocolLevel: "veryHigh", securityLevel: "high", mediaLevel: "international", riskSensitivity: "high",
    language: { en: "French", ar: "الفرنسية" },
    interpreterRequired: true, giftsRequired: true, fleetRequired: true, hotelRequired: true,
    airportProtocolRequired: true, culturalConsiderations: true, previousVisitMemory: true, specialProtocolRules: true,
    traits: [
      { en: "Head of State — full honours", ar: "رئيس دولة — مراسم كاملة" },
      { en: "International media coverage", ar: "تغطية إعلامية دولية" },
      { en: "Reciprocity expectations active", ar: "اعتبارات المعاملة بالمثل" },
    ],
  },
  {
    key: "japan-pm",
    label: { en: "Japan Prime Minister Visit", ar: "زيارة رئيس وزراء اليابان" },
    countryCode: "JP", vipLevel: "headOfState",
    protocolLevel: "veryHigh", securityLevel: "high", mediaLevel: "international", riskSensitivity: "medium",
    language: { en: "Japanese", ar: "اليابانية" },
    interpreterRequired: true, giftsRequired: true, fleetRequired: true, hotelRequired: true,
    airportProtocolRequired: true, culturalConsiderations: true, previousVisitMemory: true, specialProtocolRules: true,
    traits: [
      { en: "Strict ceremonial etiquette", ar: "آداب مراسم دقيقة" },
      { en: "Economic cooperation focus", ar: "تركيز على التعاون الاقتصادي" },
    ],
  },
  {
    key: "saudi-royal",
    label: { en: "Saudi Royal Delegation", ar: "وفد ملكي سعودي" },
    countryCode: "SA", vipLevel: "headOfState",
    protocolLevel: "veryHigh", securityLevel: "veryHigh", mediaLevel: "national", riskSensitivity: "high",
    language: { en: "Arabic", ar: "العربية" },
    interpreterRequired: false, giftsRequired: true, fleetRequired: true, hotelRequired: true,
    airportProtocolRequired: true, culturalConsiderations: true, previousVisitMemory: true, specialProtocolRules: true,
    traits: [
      { en: "Gulf royal protocol", ar: "بروتوكول ملكي خليجي" },
      { en: "Large delegation", ar: "وفد كبير" },
      { en: "Heightened security tier", ar: "مستوى أمني مرتفع" },
    ],
  },
  {
    key: "china-trade",
    label: { en: "China Trade Delegation", ar: "وفد تجاري صيني" },
    countryCode: "CN", vipLevel: "minister",
    protocolLevel: "high", securityLevel: "medium", mediaLevel: "national", riskSensitivity: "medium",
    language: { en: "Mandarin", ar: "الماندرين" },
    interpreterRequired: true, giftsRequired: true, fleetRequired: true, hotelRequired: true,
    airportProtocolRequired: true, culturalConsiderations: true, previousVisitMemory: false, specialProtocolRules: false,
    traits: [
      { en: "Trade & investment agenda", ar: "أجندة تجارة واستثمار" },
      { en: "Signing ceremony likely", ar: "احتمال مراسم توقيع" },
    ],
  },
  {
    key: "uae-internal",
    label: { en: "UAE Internal Ceremony", ar: "مراسم داخلية إماراتية" },
    countryCode: "AE", vipLevel: "seniorOfficial",
    protocolLevel: "medium", securityLevel: "medium", mediaLevel: "internal", riskSensitivity: "low",
    interpreterRequired: false, giftsRequired: false, fleetRequired: true, hotelRequired: false,
    airportProtocolRequired: false, culturalConsiderations: false, previousVisitMemory: false, specialProtocolRules: false,
    traits: [
      { en: "Internal executive event", ar: "فعالية تنفيذية داخلية" },
      { en: "Streamlined coordination", ar: "تنسيق مبسّط" },
    ],
  },
  {
    key: "national-day",
    label: { en: "National Day Ceremony", ar: "احتفال اليوم الوطني" },
    countryCode: "AE", vipLevel: "headOfState",
    protocolLevel: "veryHigh", securityLevel: "high", mediaLevel: "national", riskSensitivity: "medium",
    interpreterRequired: false, giftsRequired: false, fleetRequired: true, hotelRequired: false,
    airportProtocolRequired: false, culturalConsiderations: true, previousVisitMemory: true, specialProtocolRules: true,
    traits: [
      { en: "National ceremony", ar: "احتفال وطني" },
      { en: "Large public & media footprint", ar: "حضور جماهيري وإعلامي كبير" },
    ],
  },
  {
    key: "diplomatic-reception",
    label: { en: "Diplomatic Reception", ar: "استقبال دبلوماسي" },
    vipLevel: "ambassador",
    protocolLevel: "high", securityLevel: "medium", mediaLevel: "internal", riskSensitivity: "low",
    interpreterRequired: false, giftsRequired: true, fleetRequired: false, hotelRequired: false,
    airportProtocolRequired: false, culturalConsiderations: true, previousVisitMemory: false, specialProtocolRules: false,
    traits: [
      { en: "Diplomatic corps hospitality", ar: "ضيافة السلك الدبلوماسي" },
      { en: "Seating & titles sensitive", ar: "حساسية الجلوس والألقاب" },
    ],
  },
];

const BY_KEY = Object.fromEntries(MISSION_DNA.map((d) => [d.key, d]));

/** Pick the closest DNA for a mission context (demo heuristic). */
export function resolveDNA(ctx: MissionContext): MissionDNA {
  const cc = ctx.countryCode;
  const vip = ctx.vipLevel;
  // Country + head-of-state archetypes
  if (cc === "FR" && vip === "headOfState") return BY_KEY["france-presidential"];
  if (cc === "JP" && vip === "headOfState") return BY_KEY["japan-pm"];
  if (cc === "SA") return BY_KEY["saudi-royal"];
  if (cc === "CN") return BY_KEY["china-trade"];
  if (ctx.missionType === "ceremony" && cc === "AE") return BY_KEY["national-day"];
  if (ctx.missionType === "reception") return BY_KEY["diplomatic-reception"];
  if (ctx.missionType === "internal" || cc === "AE") return BY_KEY["uae-internal"];
  // Fallback: nearest by VIP level
  if (vip === "headOfState") return BY_KEY["france-presidential"];
  if (vip === "ambassador") return BY_KEY["diplomatic-reception"];
  return BY_KEY["china-trade"];
}
