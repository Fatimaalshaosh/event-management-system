/**
 * Country reference data (ISO 3166-1) used across the platform.
 *
 * Static, dependency-free, and shared between the API server and the frontend.
 * Flag emoji + flag image URL are *derived* from the alpha-2 code, so every
 * country gets a flag automatically. The dataset is curated to cover all GCC /
 * MENA states, major protocol partners, and every country referenced by the
 * airport dataset; it is trivially extensible to the full ISO list.
 */

export interface Country {
  /** ISO 3166-1 alpha-2, e.g. "AE" */
  code: string;
  /** ISO 3166-1 alpha-3, e.g. "ARE" */
  code3: string;
  nameEn: string;
  nameAr: string;
  region: string;
  subregion: string;
  capital: string;
  capitalAr: string;
  nationalityEn: string;
  nationalityAr: string;
}

export interface CountryWithFlag extends Country {
  /** Flag emoji derived from the alpha-2 code. */
  flag: string;
  /** Static SVG flag asset (flagcdn — free, no API key). */
  flagUrl: string;
}

/** Convert an ISO alpha-2 code to its flag emoji (regional indicator symbols). */
export function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "🏳️";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}

/** Static SVG flag URL (https://flagcdn.com/<cc>.svg). Offline-safe fallback is the emoji. */
export function flagUrl(code: string): string {
  return `https://flagcdn.com/${code.trim().toLowerCase()}.svg`;
}

export function withFlag(c: Country): CountryWithFlag {
  return { ...c, flag: flagEmoji(c.code), flagUrl: flagUrl(c.code) };
}

export const COUNTRIES: Country[] = [
  // ── GCC ──────────────────────────────────────────────
  { code: "AE", code3: "ARE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", region: "Asia", subregion: "Western Asia", capital: "Abu Dhabi", capitalAr: "أبوظبي", nationalityEn: "Emirati", nationalityAr: "إماراتي" },
  { code: "SA", code3: "SAU", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية", region: "Asia", subregion: "Western Asia", capital: "Riyadh", capitalAr: "الرياض", nationalityEn: "Saudi", nationalityAr: "سعودي" },
  { code: "QA", code3: "QAT", nameEn: "Qatar", nameAr: "قطر", region: "Asia", subregion: "Western Asia", capital: "Doha", capitalAr: "الدوحة", nationalityEn: "Qatari", nationalityAr: "قطري" },
  { code: "KW", code3: "KWT", nameEn: "Kuwait", nameAr: "الكويت", region: "Asia", subregion: "Western Asia", capital: "Kuwait City", capitalAr: "مدينة الكويت", nationalityEn: "Kuwaiti", nationalityAr: "كويتي" },
  { code: "BH", code3: "BHR", nameEn: "Bahrain", nameAr: "البحرين", region: "Asia", subregion: "Western Asia", capital: "Manama", capitalAr: "المنامة", nationalityEn: "Bahraini", nationalityAr: "بحريني" },
  { code: "OM", code3: "OMN", nameEn: "Oman", nameAr: "عُمان", region: "Asia", subregion: "Western Asia", capital: "Muscat", capitalAr: "مسقط", nationalityEn: "Omani", nationalityAr: "عُماني" },
  // ── MENA ─────────────────────────────────────────────
  { code: "EG", code3: "EGY", nameEn: "Egypt", nameAr: "مصر", region: "Africa", subregion: "Northern Africa", capital: "Cairo", capitalAr: "القاهرة", nationalityEn: "Egyptian", nationalityAr: "مصري" },
  { code: "JO", code3: "JOR", nameEn: "Jordan", nameAr: "الأردن", region: "Asia", subregion: "Western Asia", capital: "Amman", capitalAr: "عمّان", nationalityEn: "Jordanian", nationalityAr: "أردني" },
  { code: "LB", code3: "LBN", nameEn: "Lebanon", nameAr: "لبنان", region: "Asia", subregion: "Western Asia", capital: "Beirut", capitalAr: "بيروت", nationalityEn: "Lebanese", nationalityAr: "لبناني" },
  { code: "IQ", code3: "IRQ", nameEn: "Iraq", nameAr: "العراق", region: "Asia", subregion: "Western Asia", capital: "Baghdad", capitalAr: "بغداد", nationalityEn: "Iraqi", nationalityAr: "عراقي" },
  { code: "SY", code3: "SYR", nameEn: "Syria", nameAr: "سوريا", region: "Asia", subregion: "Western Asia", capital: "Damascus", capitalAr: "دمشق", nationalityEn: "Syrian", nationalityAr: "سوري" },
  { code: "PS", code3: "PSE", nameEn: "Palestine", nameAr: "فلسطين", region: "Asia", subregion: "Western Asia", capital: "Jerusalem", capitalAr: "القدس", nationalityEn: "Palestinian", nationalityAr: "فلسطيني" },
  { code: "YE", code3: "YEM", nameEn: "Yemen", nameAr: "اليمن", region: "Asia", subregion: "Western Asia", capital: "Sana'a", capitalAr: "صنعاء", nationalityEn: "Yemeni", nationalityAr: "يمني" },
  { code: "MA", code3: "MAR", nameEn: "Morocco", nameAr: "المغرب", region: "Africa", subregion: "Northern Africa", capital: "Rabat", capitalAr: "الرباط", nationalityEn: "Moroccan", nationalityAr: "مغربي" },
  { code: "TN", code3: "TUN", nameEn: "Tunisia", nameAr: "تونس", region: "Africa", subregion: "Northern Africa", capital: "Tunis", capitalAr: "تونس", nationalityEn: "Tunisian", nationalityAr: "تونسي" },
  { code: "DZ", code3: "DZA", nameEn: "Algeria", nameAr: "الجزائر", region: "Africa", subregion: "Northern Africa", capital: "Algiers", capitalAr: "الجزائر", nationalityEn: "Algerian", nationalityAr: "جزائري" },
  { code: "LY", code3: "LBY", nameEn: "Libya", nameAr: "ليبيا", region: "Africa", subregion: "Northern Africa", capital: "Tripoli", capitalAr: "طرابلس", nationalityEn: "Libyan", nationalityAr: "ليبي" },
  { code: "SD", code3: "SDN", nameEn: "Sudan", nameAr: "السودان", region: "Africa", subregion: "Northern Africa", capital: "Khartoum", capitalAr: "الخرطوم", nationalityEn: "Sudanese", nationalityAr: "سوداني" },
  { code: "TR", code3: "TUR", nameEn: "Türkiye", nameAr: "تركيا", region: "Asia", subregion: "Western Asia", capital: "Ankara", capitalAr: "أنقرة", nationalityEn: "Turkish", nationalityAr: "تركي" },
  { code: "IR", code3: "IRN", nameEn: "Iran", nameAr: "إيران", region: "Asia", subregion: "Southern Asia", capital: "Tehran", capitalAr: "طهران", nationalityEn: "Iranian", nationalityAr: "إيراني" },
  // ── Europe ───────────────────────────────────────────
  { code: "GB", code3: "GBR", nameEn: "United Kingdom", nameAr: "المملكة المتحدة", region: "Europe", subregion: "Northern Europe", capital: "London", capitalAr: "لندن", nationalityEn: "British", nationalityAr: "بريطاني" },
  { code: "FR", code3: "FRA", nameEn: "France", nameAr: "فرنسا", region: "Europe", subregion: "Western Europe", capital: "Paris", capitalAr: "باريس", nationalityEn: "French", nationalityAr: "فرنسي" },
  { code: "DE", code3: "DEU", nameEn: "Germany", nameAr: "ألمانيا", region: "Europe", subregion: "Western Europe", capital: "Berlin", capitalAr: "برلين", nationalityEn: "German", nationalityAr: "ألماني" },
  { code: "IT", code3: "ITA", nameEn: "Italy", nameAr: "إيطاليا", region: "Europe", subregion: "Southern Europe", capital: "Rome", capitalAr: "روما", nationalityEn: "Italian", nationalityAr: "إيطالي" },
  { code: "ES", code3: "ESP", nameEn: "Spain", nameAr: "إسبانيا", region: "Europe", subregion: "Southern Europe", capital: "Madrid", capitalAr: "مدريد", nationalityEn: "Spanish", nationalityAr: "إسباني" },
  { code: "CH", code3: "CHE", nameEn: "Switzerland", nameAr: "سويسرا", region: "Europe", subregion: "Western Europe", capital: "Bern", capitalAr: "برن", nationalityEn: "Swiss", nationalityAr: "سويسري" },
  { code: "NL", code3: "NLD", nameEn: "Netherlands", nameAr: "هولندا", region: "Europe", subregion: "Western Europe", capital: "Amsterdam", capitalAr: "أمستردام", nationalityEn: "Dutch", nationalityAr: "هولندي" },
  { code: "BE", code3: "BEL", nameEn: "Belgium", nameAr: "بلجيكا", region: "Europe", subregion: "Western Europe", capital: "Brussels", capitalAr: "بروكسل", nationalityEn: "Belgian", nationalityAr: "بلجيكي" },
  { code: "AT", code3: "AUT", nameEn: "Austria", nameAr: "النمسا", region: "Europe", subregion: "Western Europe", capital: "Vienna", capitalAr: "فيينا", nationalityEn: "Austrian", nationalityAr: "نمساوي" },
  { code: "SE", code3: "SWE", nameEn: "Sweden", nameAr: "السويد", region: "Europe", subregion: "Northern Europe", capital: "Stockholm", capitalAr: "ستوكهولم", nationalityEn: "Swedish", nationalityAr: "سويدي" },
  { code: "NO", code3: "NOR", nameEn: "Norway", nameAr: "النرويج", region: "Europe", subregion: "Northern Europe", capital: "Oslo", capitalAr: "أوسلو", nationalityEn: "Norwegian", nationalityAr: "نرويجي" },
  { code: "DK", code3: "DNK", nameEn: "Denmark", nameAr: "الدنمارك", region: "Europe", subregion: "Northern Europe", capital: "Copenhagen", capitalAr: "كوبنهاغن", nationalityEn: "Danish", nationalityAr: "دنماركي" },
  { code: "FI", code3: "FIN", nameEn: "Finland", nameAr: "فنلندا", region: "Europe", subregion: "Northern Europe", capital: "Helsinki", capitalAr: "هلسنكي", nationalityEn: "Finnish", nationalityAr: "فنلندي" },
  { code: "PT", code3: "PRT", nameEn: "Portugal", nameAr: "البرتغال", region: "Europe", subregion: "Southern Europe", capital: "Lisbon", capitalAr: "لشبونة", nationalityEn: "Portuguese", nationalityAr: "برتغالي" },
  { code: "IE", code3: "IRL", nameEn: "Ireland", nameAr: "أيرلندا", region: "Europe", subregion: "Northern Europe", capital: "Dublin", capitalAr: "دبلن", nationalityEn: "Irish", nationalityAr: "أيرلندي" },
  { code: "GR", code3: "GRC", nameEn: "Greece", nameAr: "اليونان", region: "Europe", subregion: "Southern Europe", capital: "Athens", capitalAr: "أثينا", nationalityEn: "Greek", nationalityAr: "يوناني" },
  { code: "PL", code3: "POL", nameEn: "Poland", nameAr: "بولندا", region: "Europe", subregion: "Eastern Europe", capital: "Warsaw", capitalAr: "وارسو", nationalityEn: "Polish", nationalityAr: "بولندي" },
  { code: "RU", code3: "RUS", nameEn: "Russia", nameAr: "روسيا", region: "Europe", subregion: "Eastern Europe", capital: "Moscow", capitalAr: "موسكو", nationalityEn: "Russian", nationalityAr: "روسي" },
  { code: "UA", code3: "UKR", nameEn: "Ukraine", nameAr: "أوكرانيا", region: "Europe", subregion: "Eastern Europe", capital: "Kyiv", capitalAr: "كييف", nationalityEn: "Ukrainian", nationalityAr: "أوكراني" },
  // ── Americas ─────────────────────────────────────────
  { code: "US", code3: "USA", nameEn: "United States", nameAr: "الولايات المتحدة", region: "Americas", subregion: "North America", capital: "Washington, D.C.", capitalAr: "واشنطن", nationalityEn: "American", nationalityAr: "أمريكي" },
  { code: "CA", code3: "CAN", nameEn: "Canada", nameAr: "كندا", region: "Americas", subregion: "North America", capital: "Ottawa", capitalAr: "أوتاوا", nationalityEn: "Canadian", nationalityAr: "كندي" },
  { code: "MX", code3: "MEX", nameEn: "Mexico", nameAr: "المكسيك", region: "Americas", subregion: "North America", capital: "Mexico City", capitalAr: "مكسيكو سيتي", nationalityEn: "Mexican", nationalityAr: "مكسيكي" },
  { code: "BR", code3: "BRA", nameEn: "Brazil", nameAr: "البرازيل", region: "Americas", subregion: "South America", capital: "Brasília", capitalAr: "برازيليا", nationalityEn: "Brazilian", nationalityAr: "برازيلي" },
  { code: "AR", code3: "ARG", nameEn: "Argentina", nameAr: "الأرجنتين", region: "Americas", subregion: "South America", capital: "Buenos Aires", capitalAr: "بوينس آيرس", nationalityEn: "Argentine", nationalityAr: "أرجنتيني" },
  // ── Asia ─────────────────────────────────────────────
  { code: "CN", code3: "CHN", nameEn: "China", nameAr: "الصين", region: "Asia", subregion: "Eastern Asia", capital: "Beijing", capitalAr: "بكين", nationalityEn: "Chinese", nationalityAr: "صيني" },
  { code: "JP", code3: "JPN", nameEn: "Japan", nameAr: "اليابان", region: "Asia", subregion: "Eastern Asia", capital: "Tokyo", capitalAr: "طوكيو", nationalityEn: "Japanese", nationalityAr: "ياباني" },
  { code: "KR", code3: "KOR", nameEn: "South Korea", nameAr: "كوريا الجنوبية", region: "Asia", subregion: "Eastern Asia", capital: "Seoul", capitalAr: "سيول", nationalityEn: "Korean", nationalityAr: "كوري" },
  { code: "IN", code3: "IND", nameEn: "India", nameAr: "الهند", region: "Asia", subregion: "Southern Asia", capital: "New Delhi", capitalAr: "نيودلهي", nationalityEn: "Indian", nationalityAr: "هندي" },
  { code: "ID", code3: "IDN", nameEn: "Indonesia", nameAr: "إندونيسيا", region: "Asia", subregion: "South-Eastern Asia", capital: "Jakarta", capitalAr: "جاكرتا", nationalityEn: "Indonesian", nationalityAr: "إندونيسي" },
  { code: "MY", code3: "MYS", nameEn: "Malaysia", nameAr: "ماليزيا", region: "Asia", subregion: "South-Eastern Asia", capital: "Kuala Lumpur", capitalAr: "كوالالمبور", nationalityEn: "Malaysian", nationalityAr: "ماليزي" },
  { code: "SG", code3: "SGP", nameEn: "Singapore", nameAr: "سنغافورة", region: "Asia", subregion: "South-Eastern Asia", capital: "Singapore", capitalAr: "سنغافورة", nationalityEn: "Singaporean", nationalityAr: "سنغافوري" },
  { code: "TH", code3: "THA", nameEn: "Thailand", nameAr: "تايلاند", region: "Asia", subregion: "South-Eastern Asia", capital: "Bangkok", capitalAr: "بانكوك", nationalityEn: "Thai", nationalityAr: "تايلاندي" },
  { code: "PH", code3: "PHL", nameEn: "Philippines", nameAr: "الفلبين", region: "Asia", subregion: "South-Eastern Asia", capital: "Manila", capitalAr: "مانيلا", nationalityEn: "Filipino", nationalityAr: "فلبيني" },
  { code: "VN", code3: "VNM", nameEn: "Vietnam", nameAr: "فيتنام", region: "Asia", subregion: "South-Eastern Asia", capital: "Hanoi", capitalAr: "هانوي", nationalityEn: "Vietnamese", nationalityAr: "فيتنامي" },
  { code: "PK", code3: "PAK", nameEn: "Pakistan", nameAr: "باكستان", region: "Asia", subregion: "Southern Asia", capital: "Islamabad", capitalAr: "إسلام آباد", nationalityEn: "Pakistani", nationalityAr: "باكستاني" },
  { code: "BD", code3: "BGD", nameEn: "Bangladesh", nameAr: "بنغلاديش", region: "Asia", subregion: "Southern Asia", capital: "Dhaka", capitalAr: "دكا", nationalityEn: "Bangladeshi", nationalityAr: "بنغلاديشي" },
  { code: "LK", code3: "LKA", nameEn: "Sri Lanka", nameAr: "سريلانكا", region: "Asia", subregion: "Southern Asia", capital: "Colombo", capitalAr: "كولومبو", nationalityEn: "Sri Lankan", nationalityAr: "سريلانكي" },
  { code: "KZ", code3: "KAZ", nameEn: "Kazakhstan", nameAr: "كازاخستان", region: "Asia", subregion: "Central Asia", capital: "Astana", capitalAr: "أستانا", nationalityEn: "Kazakhstani", nationalityAr: "كازاخستاني" },
  { code: "AZ", code3: "AZE", nameEn: "Azerbaijan", nameAr: "أذربيجان", region: "Asia", subregion: "Western Asia", capital: "Baku", capitalAr: "باكو", nationalityEn: "Azerbaijani", nationalityAr: "أذربيجاني" },
  // ── Oceania ──────────────────────────────────────────
  { code: "AU", code3: "AUS", nameEn: "Australia", nameAr: "أستراليا", region: "Oceania", subregion: "Australia and New Zealand", capital: "Canberra", capitalAr: "كانبرا", nationalityEn: "Australian", nationalityAr: "أسترالي" },
  { code: "NZ", code3: "NZL", nameEn: "New Zealand", nameAr: "نيوزيلندا", region: "Oceania", subregion: "Australia and New Zealand", capital: "Wellington", capitalAr: "ويلينغتون", nationalityEn: "New Zealander", nationalityAr: "نيوزيلندي" },
  // ── Sub-Saharan Africa ───────────────────────────────
  { code: "ZA", code3: "ZAF", nameEn: "South Africa", nameAr: "جنوب أفريقيا", region: "Africa", subregion: "Southern Africa", capital: "Pretoria", capitalAr: "بريتوريا", nationalityEn: "South African", nationalityAr: "جنوب أفريقي" },
  { code: "NG", code3: "NGA", nameEn: "Nigeria", nameAr: "نيجيريا", region: "Africa", subregion: "Western Africa", capital: "Abuja", capitalAr: "أبوجا", nationalityEn: "Nigerian", nationalityAr: "نيجيري" },
  { code: "KE", code3: "KEN", nameEn: "Kenya", nameAr: "كينيا", region: "Africa", subregion: "Eastern Africa", capital: "Nairobi", capitalAr: "نيروبي", nationalityEn: "Kenyan", nationalityAr: "كيني" },
  { code: "ET", code3: "ETH", nameEn: "Ethiopia", nameAr: "إثيوبيا", region: "Africa", subregion: "Eastern Africa", capital: "Addis Ababa", capitalAr: "أديس أبابا", nationalityEn: "Ethiopian", nationalityAr: "إثيوبي" },
];

/* ── Lookup + search ─────────────────────────────────── */

const BY_CODE = new Map<string, Country>();
for (const c of COUNTRIES) {
  BY_CODE.set(c.code.toUpperCase(), c);
  BY_CODE.set(c.code3.toUpperCase(), c);
}

/** Look up a country by alpha-2 or alpha-3 code (case-insensitive). */
export function getCountry(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.trim().toUpperCase());
}

/** Resolve a flag emoji from a country code OR a free-text country name (EN/AR). */
export function flagForCountry(value: string | null | undefined): string {
  if (!value) return "";
  const byCode = getCountry(value);
  if (byCode) return flagEmoji(byCode.code);
  const needle = value.trim().toLowerCase();
  const byName = COUNTRIES.find(
    (c) => c.nameEn.toLowerCase() === needle || c.nameAr === value.trim(),
  );
  return byName ? flagEmoji(byName.code) : "";
}

/** Search by EN/AR name, code, capital, region or nationality. */
export function searchCountries(query: string, limit = 30): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES.slice(0, limit);
  const out = COUNTRIES.filter((c) =>
    c.nameEn.toLowerCase().includes(q) ||
    c.nameAr.includes(query.trim()) ||
    c.code.toLowerCase() === q ||
    c.code3.toLowerCase() === q ||
    c.capital.toLowerCase().includes(q) ||
    c.capitalAr.includes(query.trim()) ||
    c.region.toLowerCase().includes(q) ||
    c.subregion.toLowerCase().includes(q) ||
    c.nationalityEn.toLowerCase().includes(q) ||
    c.nationalityAr.includes(query.trim()),
  );
  return out.slice(0, limit);
}
