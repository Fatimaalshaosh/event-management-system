/**
 * Airport reference data, linked to countries by ISO alpha-2 `countryCode`.
 * Static and dependency-free; shared by the API server and frontend. Covers the
 * major international gateways for every country in the platform's protocol
 * scope. Country name + flag are derived by joining with the country dataset.
 */
import { getCountry, flagEmoji, type Country } from "./countries";

export type AirportType = "International" | "Domestic" | "Regional";

export interface Airport {
  iata: string;
  icao?: string;
  nameEn: string;
  nameAr?: string;
  cityEn: string;
  cityAr?: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
  type: AirportType;
}

export interface AirportWithCountry extends Airport {
  countryNameEn: string;
  countryNameAr: string;
  flag: string;
}

export const AIRPORTS: Airport[] = [
  // ── UAE ──────────────────────────────────────────────
  { iata: "AUH", icao: "OMAA", nameEn: "Zayed International Airport", nameAr: "مطار زايد الدولي", cityEn: "Abu Dhabi", cityAr: "أبوظبي", countryCode: "AE", timezone: "Asia/Dubai", lat: 24.4330, lng: 54.6511, type: "International" },
  { iata: "DXB", icao: "OMDB", nameEn: "Dubai International Airport", nameAr: "مطار دبي الدولي", cityEn: "Dubai", cityAr: "دبي", countryCode: "AE", timezone: "Asia/Dubai", lat: 25.2532, lng: 55.3657, type: "International" },
  { iata: "DWC", icao: "OMDW", nameEn: "Al Maktoum International Airport", nameAr: "مطار آل مكتوم الدولي", cityEn: "Dubai", cityAr: "دبي", countryCode: "AE", timezone: "Asia/Dubai", lat: 24.8964, lng: 55.1614, type: "International" },
  { iata: "SHJ", icao: "OMSJ", nameEn: "Sharjah International Airport", nameAr: "مطار الشارقة الدولي", cityEn: "Sharjah", cityAr: "الشارقة", countryCode: "AE", timezone: "Asia/Dubai", lat: 25.3286, lng: 55.5172, type: "International" },
  // ── Saudi Arabia ─────────────────────────────────────
  { iata: "RUH", icao: "OERK", nameEn: "King Khalid International Airport", nameAr: "مطار الملك خالد الدولي", cityEn: "Riyadh", cityAr: "الرياض", countryCode: "SA", timezone: "Asia/Riyadh", lat: 24.9576, lng: 46.6988, type: "International" },
  { iata: "JED", icao: "OEJN", nameEn: "King Abdulaziz International Airport", nameAr: "مطار الملك عبدالعزيز الدولي", cityEn: "Jeddah", cityAr: "جدة", countryCode: "SA", timezone: "Asia/Riyadh", lat: 21.6796, lng: 39.1565, type: "International" },
  { iata: "DMM", icao: "OEDF", nameEn: "King Fahd International Airport", nameAr: "مطار الملك فهد الدولي", cityEn: "Dammam", cityAr: "الدمام", countryCode: "SA", timezone: "Asia/Riyadh", lat: 26.4712, lng: 49.7979, type: "International" },
  { iata: "MED", icao: "OEMA", nameEn: "Prince Mohammad bin Abdulaziz Airport", nameAr: "مطار الأمير محمد بن عبدالعزيز", cityEn: "Madinah", cityAr: "المدينة المنورة", countryCode: "SA", timezone: "Asia/Riyadh", lat: 24.5534, lng: 39.7051, type: "International" },
  // ── Qatar ────────────────────────────────────────────
  { iata: "DOH", icao: "OTHH", nameEn: "Hamad International Airport", nameAr: "مطار حمد الدولي", cityEn: "Doha", cityAr: "الدوحة", countryCode: "QA", timezone: "Asia/Qatar", lat: 25.2731, lng: 51.6080, type: "International" },
  // ── Kuwait ───────────────────────────────────────────
  { iata: "KWI", icao: "OKBK", nameEn: "Kuwait International Airport", nameAr: "مطار الكويت الدولي", cityEn: "Kuwait City", cityAr: "مدينة الكويت", countryCode: "KW", timezone: "Asia/Kuwait", lat: 29.2266, lng: 47.9689, type: "International" },
  // ── Bahrain ──────────────────────────────────────────
  { iata: "BAH", icao: "OBBI", nameEn: "Bahrain International Airport", nameAr: "مطار البحرين الدولي", cityEn: "Manama", cityAr: "المنامة", countryCode: "BH", timezone: "Asia/Bahrain", lat: 26.2708, lng: 50.6336, type: "International" },
  // ── Oman ─────────────────────────────────────────────
  { iata: "MCT", icao: "OOMS", nameEn: "Muscat International Airport", nameAr: "مطار مسقط الدولي", cityEn: "Muscat", cityAr: "مسقط", countryCode: "OM", timezone: "Asia/Muscat", lat: 23.5933, lng: 58.2844, type: "International" },
  { iata: "SLL", icao: "OOSA", nameEn: "Salalah Airport", nameAr: "مطار صلالة", cityEn: "Salalah", cityAr: "صلالة", countryCode: "OM", timezone: "Asia/Muscat", lat: 17.0387, lng: 54.0913, type: "International" },
  // ── Egypt ────────────────────────────────────────────
  { iata: "CAI", icao: "HECA", nameEn: "Cairo International Airport", nameAr: "مطار القاهرة الدولي", cityEn: "Cairo", cityAr: "القاهرة", countryCode: "EG", timezone: "Africa/Cairo", lat: 30.1219, lng: 31.4056, type: "International" },
  { iata: "SSH", icao: "HESH", nameEn: "Sharm El Sheikh International Airport", nameAr: "مطار شرم الشيخ الدولي", cityEn: "Sharm El Sheikh", cityAr: "شرم الشيخ", countryCode: "EG", timezone: "Africa/Cairo", lat: 27.9773, lng: 34.3950, type: "International" },
  // ── Jordan ───────────────────────────────────────────
  { iata: "AMM", icao: "OJAI", nameEn: "Queen Alia International Airport", nameAr: "مطار الملكة علياء الدولي", cityEn: "Amman", cityAr: "عمّان", countryCode: "JO", timezone: "Asia/Amman", lat: 31.7226, lng: 35.9932, type: "International" },
  { iata: "AQJ", icao: "OJAQ", nameEn: "King Hussein International Airport", nameAr: "مطار الملك الحسين الدولي", cityEn: "Aqaba", cityAr: "العقبة", countryCode: "JO", timezone: "Asia/Amman", lat: 29.6116, lng: 35.0181, type: "International" },
  // ── United Kingdom ───────────────────────────────────
  { iata: "LHR", icao: "EGLL", nameEn: "Heathrow Airport", cityEn: "London", cityAr: "لندن", countryCode: "GB", timezone: "Europe/London", lat: 51.4700, lng: -0.4543, type: "International" },
  { iata: "LGW", icao: "EGKK", nameEn: "Gatwick Airport", cityEn: "London", cityAr: "لندن", countryCode: "GB", timezone: "Europe/London", lat: 51.1537, lng: -0.1821, type: "International" },
  { iata: "MAN", icao: "EGCC", nameEn: "Manchester Airport", cityEn: "Manchester", cityAr: "مانشستر", countryCode: "GB", timezone: "Europe/London", lat: 53.3537, lng: -2.2750, type: "International" },
  // ── France ───────────────────────────────────────────
  { iata: "CDG", icao: "LFPG", nameEn: "Charles de Gaulle Airport", cityEn: "Paris", cityAr: "باريس", countryCode: "FR", timezone: "Europe/Paris", lat: 49.0097, lng: 2.5479, type: "International" },
  { iata: "ORY", icao: "LFPO", nameEn: "Orly Airport", cityEn: "Paris", cityAr: "باريس", countryCode: "FR", timezone: "Europe/Paris", lat: 48.7233, lng: 2.3794, type: "International" },
  { iata: "NCE", icao: "LFMN", nameEn: "Nice Côte d'Azur Airport", cityEn: "Nice", cityAr: "نيس", countryCode: "FR", timezone: "Europe/Paris", lat: 43.6584, lng: 7.2159, type: "International" },
  // ── Germany ──────────────────────────────────────────
  { iata: "FRA", icao: "EDDF", nameEn: "Frankfurt Airport", cityEn: "Frankfurt", cityAr: "فرانكفورت", countryCode: "DE", timezone: "Europe/Berlin", lat: 50.0379, lng: 8.5622, type: "International" },
  { iata: "MUC", icao: "EDDM", nameEn: "Munich Airport", cityEn: "Munich", cityAr: "ميونخ", countryCode: "DE", timezone: "Europe/Berlin", lat: 48.3538, lng: 11.7861, type: "International" },
  { iata: "BER", icao: "EDDB", nameEn: "Berlin Brandenburg Airport", cityEn: "Berlin", cityAr: "برلين", countryCode: "DE", timezone: "Europe/Berlin", lat: 52.3667, lng: 13.5033, type: "International" },
  // ── Italy ────────────────────────────────────────────
  { iata: "FCO", icao: "LIRF", nameEn: "Leonardo da Vinci–Fiumicino Airport", cityEn: "Rome", cityAr: "روما", countryCode: "IT", timezone: "Europe/Rome", lat: 41.8003, lng: 12.2389, type: "International" },
  { iata: "MXP", icao: "LIMC", nameEn: "Milan Malpensa Airport", cityEn: "Milan", cityAr: "ميلانو", countryCode: "IT", timezone: "Europe/Rome", lat: 45.6306, lng: 8.7281, type: "International" },
  // ── Spain ────────────────────────────────────────────
  { iata: "MAD", icao: "LEMD", nameEn: "Adolfo Suárez Madrid–Barajas Airport", cityEn: "Madrid", cityAr: "مدريد", countryCode: "ES", timezone: "Europe/Madrid", lat: 40.4719, lng: -3.5626, type: "International" },
  { iata: "BCN", icao: "LEBL", nameEn: "Barcelona–El Prat Airport", cityEn: "Barcelona", cityAr: "برشلونة", countryCode: "ES", timezone: "Europe/Madrid", lat: 41.2974, lng: 2.0833, type: "International" },
  // ── Switzerland ──────────────────────────────────────
  { iata: "ZRH", icao: "LSZH", nameEn: "Zurich Airport", cityEn: "Zurich", cityAr: "زيورخ", countryCode: "CH", timezone: "Europe/Zurich", lat: 47.4647, lng: 8.5492, type: "International" },
  { iata: "GVA", icao: "LSGG", nameEn: "Geneva Airport", cityEn: "Geneva", cityAr: "جنيف", countryCode: "CH", timezone: "Europe/Zurich", lat: 46.2381, lng: 6.1089, type: "International" },
  // ── United States ────────────────────────────────────
  { iata: "JFK", icao: "KJFK", nameEn: "John F. Kennedy International Airport", cityEn: "New York", cityAr: "نيويورك", countryCode: "US", timezone: "America/New_York", lat: 40.6413, lng: -73.7781, type: "International" },
  { iata: "IAD", icao: "KIAD", nameEn: "Washington Dulles International Airport", cityEn: "Washington, D.C.", cityAr: "واشنطن", countryCode: "US", timezone: "America/New_York", lat: 38.9531, lng: -77.4565, type: "International" },
  { iata: "LAX", icao: "KLAX", nameEn: "Los Angeles International Airport", cityEn: "Los Angeles", cityAr: "لوس أنجلوس", countryCode: "US", timezone: "America/Los_Angeles", lat: 33.9416, lng: -118.4085, type: "International" },
  { iata: "ORD", icao: "KORD", nameEn: "O'Hare International Airport", cityEn: "Chicago", cityAr: "شيكاغو", countryCode: "US", timezone: "America/Chicago", lat: 41.9742, lng: -87.9073, type: "International" },
  // ── China ────────────────────────────────────────────
  { iata: "PEK", icao: "ZBAA", nameEn: "Beijing Capital International Airport", cityEn: "Beijing", cityAr: "بكين", countryCode: "CN", timezone: "Asia/Shanghai", lat: 40.0801, lng: 116.5846, type: "International" },
  { iata: "PVG", icao: "ZSPD", nameEn: "Shanghai Pudong International Airport", cityEn: "Shanghai", cityAr: "شنغهاي", countryCode: "CN", timezone: "Asia/Shanghai", lat: 31.1443, lng: 121.8083, type: "International" },
  { iata: "CAN", icao: "ZGGG", nameEn: "Guangzhou Baiyun International Airport", cityEn: "Guangzhou", cityAr: "قوانغتشو", countryCode: "CN", timezone: "Asia/Shanghai", lat: 23.3924, lng: 113.2988, type: "International" },
  // ── Japan ────────────────────────────────────────────
  { iata: "HND", icao: "RJTT", nameEn: "Haneda Airport", nameAr: "مطار هانيدا", cityEn: "Tokyo", cityAr: "طوكيو", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.5494, lng: 139.7798, type: "International" },
  { iata: "NRT", icao: "RJAA", nameEn: "Narita International Airport", nameAr: "مطار ناريتا الدولي", cityEn: "Tokyo", cityAr: "طوكيو", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.7720, lng: 140.3929, type: "International" },
  { iata: "KIX", icao: "RJBB", nameEn: "Kansai International Airport", cityEn: "Osaka", cityAr: "أوساكا", countryCode: "JP", timezone: "Asia/Tokyo", lat: 34.4273, lng: 135.2440, type: "International" },
  // ── South Korea ──────────────────────────────────────
  { iata: "ICN", icao: "RKSI", nameEn: "Incheon International Airport", cityEn: "Seoul", cityAr: "سيول", countryCode: "KR", timezone: "Asia/Seoul", lat: 37.4602, lng: 126.4407, type: "International" },
  { iata: "GMP", icao: "RKSS", nameEn: "Gimpo International Airport", cityEn: "Seoul", cityAr: "سيول", countryCode: "KR", timezone: "Asia/Seoul", lat: 37.5583, lng: 126.7906, type: "International" },
  // ── India ────────────────────────────────────────────
  { iata: "DEL", icao: "VIDP", nameEn: "Indira Gandhi International Airport", cityEn: "New Delhi", cityAr: "نيودلهي", countryCode: "IN", timezone: "Asia/Kolkata", lat: 28.5562, lng: 77.1000, type: "International" },
  { iata: "BOM", icao: "VABB", nameEn: "Chhatrapati Shivaji Maharaj International Airport", cityEn: "Mumbai", cityAr: "مومباي", countryCode: "IN", timezone: "Asia/Kolkata", lat: 19.0896, lng: 72.8656, type: "International" },
  // ── Indonesia ────────────────────────────────────────
  { iata: "CGK", icao: "WIII", nameEn: "Soekarno–Hatta International Airport", cityEn: "Jakarta", cityAr: "جاكرتا", countryCode: "ID", timezone: "Asia/Jakarta", lat: -6.1256, lng: 106.6559, type: "International" },
  { iata: "DPS", icao: "WADD", nameEn: "Ngurah Rai International Airport", cityEn: "Bali", cityAr: "بالي", countryCode: "ID", timezone: "Asia/Makassar", lat: -8.7482, lng: 115.1672, type: "International" },
  // ── Malaysia ─────────────────────────────────────────
  { iata: "KUL", icao: "WMKK", nameEn: "Kuala Lumpur International Airport", cityEn: "Kuala Lumpur", cityAr: "كوالالمبور", countryCode: "MY", timezone: "Asia/Kuala_Lumpur", lat: 2.7456, lng: 101.7099, type: "International" },
  // ── Singapore ────────────────────────────────────────
  { iata: "SIN", icao: "WSSS", nameEn: "Singapore Changi Airport", cityEn: "Singapore", cityAr: "سنغافورة", countryCode: "SG", timezone: "Asia/Singapore", lat: 1.3644, lng: 103.9915, type: "International" },
  // ── Australia ────────────────────────────────────────
  { iata: "SYD", icao: "YSSY", nameEn: "Sydney Kingsford Smith Airport", cityEn: "Sydney", cityAr: "سيدني", countryCode: "AU", timezone: "Australia/Sydney", lat: -33.9399, lng: 151.1753, type: "International" },
  { iata: "MEL", icao: "YMML", nameEn: "Melbourne Airport", cityEn: "Melbourne", cityAr: "ملبورن", countryCode: "AU", timezone: "Australia/Melbourne", lat: -37.6690, lng: 144.8410, type: "International" },
];

/* ── Joins + search ──────────────────────────────────── */

export function withCountry(a: Airport): AirportWithCountry {
  const c: Country | undefined = getCountry(a.countryCode);
  return {
    ...a,
    countryNameEn: c?.nameEn ?? a.countryCode,
    countryNameAr: c?.nameAr ?? a.countryCode,
    flag: flagEmoji(a.countryCode),
  };
}

const BY_IATA = new Map<string, Airport>();
for (const a of AIRPORTS) BY_IATA.set(a.iata.toUpperCase(), a);

export function getAirport(iata: string | null | undefined): Airport | undefined {
  if (!iata) return undefined;
  return BY_IATA.get(iata.trim().toUpperCase());
}

export function airportsByCountry(countryCode: string): Airport[] {
  const cc = countryCode.trim().toUpperCase();
  return AIRPORTS.filter((a) => a.countryCode.toUpperCase() === cc);
}

/**
 * Search by IATA/ICAO code, airport name, city (EN/AR), or the airport's
 * country name (EN/AR) and region — so "France" / "فرنسا" return French
 * airports, "Abu Dhabi" / "أبوظبي" return AUH, "DXB" returns Dubai, etc.
 */
export function searchAirports(query: string, limit = 25): Airport[] {
  const raw = query.trim();
  const q = raw.toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);
  const scored: Array<{ a: Airport; score: number }> = [];
  for (const a of AIRPORTS) {
    const c = getCountry(a.countryCode);
    let score = 0;
    if (a.iata.toLowerCase() === q) score = 100;
    else if (a.iata.toLowerCase().includes(q)) score = 80;
    else if (a.cityEn.toLowerCase().includes(q)) score = 70;
    else if (a.cityAr && a.cityAr.includes(raw)) score = 70;
    else if (a.nameEn.toLowerCase().includes(q)) score = 60;
    else if (a.nameAr && a.nameAr.includes(raw)) score = 60;
    else if (a.icao && a.icao.toLowerCase().includes(q)) score = 50;
    else if (c && (c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(raw))) score = 40;
    else if (c && (c.code.toLowerCase() === q || c.code3.toLowerCase() === q)) score = 40;
    else if (c && (c.region.toLowerCase().includes(q) || c.subregion.toLowerCase().includes(q))) score = 20;
    if (score > 0) scored.push({ a, score });
  }
  scored.sort((x, y) => y.score - x.score || x.a.iata.localeCompare(y.a.iata));
  return scored.slice(0, limit).map((s) => s.a);
}
