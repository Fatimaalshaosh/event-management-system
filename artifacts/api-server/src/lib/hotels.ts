// Pure hotel-booking helpers, decoupled from the database and any external
// provider so they can be unit-tested in isolation. The Demo provider builds
// deterministic luxury-hotel offers from the search criteria — no network, no
// API keys.

export type HotelCategory =
  | "luxury5"
  | "fiveStar"
  | "fourStar"
  | "boutique"
  | "resort"
  | "presidential";

export type RoomType =
  | "standard"
  | "deluxe"
  | "executive"
  | "club"
  | "juniorSuite"
  | "executiveSuite"
  | "royalSuite"
  | "presidentialSuite";

export type VipLevel = "standard" | "vip" | "vvip" | "headOfState";

export type HotelSearchCriteria = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  vipLevel: VipLevel;
  category?: HotelCategory | "any";
};

export type RoomOption = {
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  available: number;
};

export type HotelOffer = {
  id: string;
  name: string;
  nameAr: string;
  category: HotelCategory;
  rating: number;
  location: string;
  locationAr: string;
  distanceFromVenue: string;
  image: string;
  amenities: string[];
  vipServices: string[];
  cancellationPolicy: string;
  cancellationPolicyAr: string;
  rooms: RoomOption[];
  currency: string;
  availability: "available" | "limited" | "waitlist";
};

type HotelSeed = {
  code: string;
  name: string;
  nameAr: string;
  category: HotelCategory;
  rating: number;
  location: string;
  locationAr: string;
  basePrice: number;
};

// A fixed roster of real luxury UAE hotels gives the Demo provider a realistic,
// fully deterministic spread of results.
const HOTELS: HotelSeed[] = [
  {
    code: "EP",
    name: "Emirates Palace Mandarin Oriental",
    nameAr: "قصر الإمارات ماندارين أورينتال",
    category: "presidential",
    rating: 5,
    location: "West Corniche, Abu Dhabi",
    locationAr: "الكورنيش الغربي، أبوظبي",
    basePrice: 4200,
  },
  {
    code: "SR",
    name: "The St. Regis Abu Dhabi",
    nameAr: "سانت ريجيس أبوظبي",
    category: "luxury5",
    rating: 5,
    location: "Corniche, Abu Dhabi",
    locationAr: "الكورنيش، أبوظبي",
    basePrice: 2600,
  },
  {
    code: "CN",
    name: "Conrad Abu Dhabi Etihad Towers",
    nameAr: "كونراد أبوظبي أبراج الاتحاد",
    category: "luxury5",
    rating: 5,
    location: "Corniche, Abu Dhabi",
    locationAr: "الكورنيش، أبوظبي",
    basePrice: 2200,
  },
  {
    code: "RC",
    name: "The Ritz-Carlton Abu Dhabi, Grand Canal",
    nameAr: "ريتز كارلتون أبوظبي، القناة الكبرى",
    category: "luxury5",
    rating: 5,
    location: "Grand Canal, Abu Dhabi",
    locationAr: "القناة الكبرى، أبوظبي",
    basePrice: 2400,
  },
  {
    code: "FS",
    name: "Four Seasons Abu Dhabi at Al Maryah Island",
    nameAr: "فورسيزونز أبوظبي في جزيرة الماريه",
    category: "luxury5",
    rating: 5,
    location: "Al Maryah Island, Abu Dhabi",
    locationAr: "جزيرة الماريه، أبوظبي",
    basePrice: 2300,
  },
  {
    code: "QS",
    name: "Qasr Al Sarab Desert Resort by Anantara",
    nameAr: "قصر السراب منتجع الصحراء أنانتارا",
    category: "resort",
    rating: 5,
    location: "Liwa Desert, Abu Dhabi",
    locationAr: "صحراء ليوا، أبوظبي",
    basePrice: 1900,
  },
  {
    code: "JM",
    name: "Jumeirah at Saadiyat Island Resort",
    nameAr: "جميرا في جزيرة السعديات",
    category: "resort",
    rating: 5,
    location: "Saadiyat Island, Abu Dhabi",
    locationAr: "جزيرة السعديات، أبوظبي",
    basePrice: 2000,
  },
  {
    code: "RX",
    name: "Rosewood Abu Dhabi",
    nameAr: "روزوود أبوظبي",
    category: "fiveStar",
    rating: 5,
    location: "Al Maryah Island, Abu Dhabi",
    locationAr: "جزيرة الماريه، أبوظبي",
    basePrice: 1700,
  },
];

const ROOM_CATALOG: { type: RoomType; capacity: number; multiplier: number }[] = [
  { type: "standard", capacity: 2, multiplier: 1 },
  { type: "deluxe", capacity: 2, multiplier: 1.3 },
  { type: "executive", capacity: 2, multiplier: 1.6 },
  { type: "club", capacity: 3, multiplier: 1.9 },
  { type: "juniorSuite", capacity: 3, multiplier: 2.4 },
  { type: "executiveSuite", capacity: 4, multiplier: 3.1 },
  { type: "royalSuite", capacity: 5, multiplier: 4.5 },
  { type: "presidentialSuite", capacity: 6, multiplier: 6.5 },
];

const AMENITIES = [
  "spa",
  "privateBeach",
  "butler",
  "fineDining",
  "pool",
  "fitness",
  "helipad",
  "marina",
  "ballroom",
  "concierge",
];

const VIP_SERVICES = [
  "airportTransfer",
  "privateCheckIn",
  "dedicatedButler",
  "securityFloor",
  "motorcadeParking",
  "privateDining",
  "majlis",
];

const CANCELLATION = [
  { en: "Free cancellation up to 72 hours before check-in", ar: "إلغاء مجاني حتى 72 ساعة قبل الوصول" },
  { en: "Free cancellation up to 48 hours before check-in", ar: "إلغاء مجاني حتى 48 ساعة قبل الوصول" },
  { en: "Non-refundable diplomatic rate", ar: "تعرفة دبلوماسية غير قابلة للاسترداد" },
];

// Simple deterministic string hash so the same criteria always yields the same
// offers (stable demo experience, reproducible tests).
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

const VIP_MULTIPLIER: Record<VipLevel, number> = {
  standard: 1,
  vip: 1.15,
  vvip: 1.35,
  headOfState: 1.6,
};

function pickAmenities(seed: number, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < count && i < AMENITIES.length * 2; i++) {
    const a = AMENITIES[(seed + i * 13) % AMENITIES.length]!;
    if (!out.includes(a)) out.push(a);
  }
  return out;
}

function pickVipServices(seed: number, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < count && i < VIP_SERVICES.length * 2; i++) {
    const a = VIP_SERVICES[(seed + i * 7) % VIP_SERVICES.length]!;
    if (!out.includes(a)) out.push(a);
  }
  return out;
}

// Calendar-day difference between two YYYY-MM-DD strings. Always >= 1 so a demo
// search never produces a zero-night stay.
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn);
  const b = Date.parse(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  const diff = Math.round((b - a) / 86_400_000);
  return diff > 0 ? diff : 1;
}

export function generateHotelOffers(criteria: HotelSearchCriteria): HotelOffer[] {
  const { city, checkIn, checkOut, vipLevel, category } = criteria;
  const seed = hash(`${city}|${checkIn}|${checkOut}|${vipLevel}|${category ?? "any"}`);

  const pool =
    category && category !== "any"
      ? HOTELS.filter((h) => h.category === category)
      : HOTELS;
  const source = pool.length > 0 ? pool : HOTELS;

  const count = Math.min(source.length, 4 + (seed % 3)); // 4–6 offers (capped)
  const offers: HotelOffer[] = [];

  for (let i = 0; i < count; i++) {
    const hotel = source[(seed + i * 5) % source.length]!;
    const localSeed = hash(`${hotel.code}|${seed}|${i}`);

    const rooms: RoomOption[] = ROOM_CATALOG.map((r, ri) => {
      const variance = (localSeed + ri * 211) % 600;
      const pricePerNight = Math.round(
        (hotel.basePrice + variance) * r.multiplier * VIP_MULTIPLIER[vipLevel],
      );
      return {
        type: r.type,
        capacity: r.capacity,
        pricePerNight,
        available: 1 + ((localSeed + ri * 17) % 6),
      };
    });

    const availabilityRoll = (localSeed >> 3) % 10;
    const availability: HotelOffer["availability"] =
      availabilityRoll < 6 ? "available" : availabilityRoll < 9 ? "limited" : "waitlist";

    offers.push({
      id: `${hotel.code}-${i}`,
      name: hotel.name,
      nameAr: hotel.nameAr,
      category: hotel.category,
      rating: hotel.rating,
      location: hotel.location,
      locationAr: hotel.locationAr,
      distanceFromVenue: `${1 + (localSeed % 25)} km`,
      image: hotelImage(hotel.code),
      amenities: pickAmenities(localSeed, 4 + (localSeed % 3)),
      vipServices: pickVipServices(localSeed, 3 + (localSeed % 3)),
      cancellationPolicy: CANCELLATION[localSeed % CANCELLATION.length]!.en,
      cancellationPolicyAr: CANCELLATION[localSeed % CANCELLATION.length]!.ar,
      rooms,
      currency: "AED",
      availability,
    });
  }

  // Highest rated first, then by lead (standard) room price ascending.
  return offers.sort(
    (a, b) => b.rating - a.rating || a.rooms[0]!.pricePerNight - b.rooms[0]!.pricePerNight,
  );
}

// Deterministic Unsplash source URL keyed by hotel code so demo cards always
// show stable luxury imagery without bundling binary assets.
function hotelImage(code: string): string {
  const ids: Record<string, string> = {
    EP: "photo-1566073771259-6a8506099945",
    SR: "photo-1571896349842-33c89424de2d",
    CN: "photo-1564501049412-61c2a3083791",
    RC: "photo-1551882547-ff40c63fe5fa",
    FS: "photo-1542314831-068cd1dbfeeb",
    QS: "photo-1582719478250-c89cae4dc85b",
    JM: "photo-1520250497591-112f2f40a3f4",
    RX: "photo-1455587734955-081b22074882",
  };
  const id = ids[code] ?? "photo-1566073771259-6a8506099945";
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
}

const CONF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"; // no I/O for legibility

// Generate a hotel confirmation code like "HTL-A1B2C3". Accepts an optional seed
// so tests can assert deterministic output; otherwise uses time + randomness.
export function generateConfirmationNumber(seed?: string): string {
  let h = seed != null ? hash(seed) : (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += CONF_ALPHABET[h % CONF_ALPHABET.length];
    h = Math.floor(h / CONF_ALPHABET.length) + (i + 1) * 2654435761;
    h = h >>> 0;
  }
  return `HTL-${out}`;
}

export type HotelDashboardRow = {
  status: string;
  vipLevel: string | null;
  roomType: string | null;
  checkIn: string | null;
  checkOut: string | null;
};

export type HotelDashboard = {
  total: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
  confirmed: number;
  vipGuests: number;
  presidentialSuites: number;
  arrivingToday: number;
  departingToday: number;
};

// `today` is an ISO date prefix (YYYY-MM-DD). A row counts as arriving/departing
// today when its checkIn/checkOut string starts with that date.
export function buildHotelDashboard(
  rows: HotelDashboardRow[],
  today: string,
): HotelDashboard {
  const dash: HotelDashboard = {
    total: rows.length,
    checkedIn: 0,
    checkedOut: 0,
    pending: 0,
    confirmed: 0,
    vipGuests: 0,
    presidentialSuites: 0,
    arrivingToday: 0,
    departingToday: 0,
  };

  for (const r of rows) {
    if (r.status === "checked_in") dash.checkedIn++;
    if (r.status === "checked_out") dash.checkedOut++;
    if (r.status === "pending" || r.status === "reserved") dash.pending++;
    if (r.status === "confirmed") dash.confirmed++;

    if (r.vipLevel === "vip" || r.vipLevel === "vvip" || r.vipLevel === "headOfState") {
      dash.vipGuests++;
    }
    if (r.roomType === "presidentialSuite") dash.presidentialSuites++;

    if (r.status === "cancelled") continue;
    if ((r.checkIn ?? "").startsWith(today)) dash.arrivingToday++;
    if ((r.checkOut ?? "").startsWith(today)) dash.departingToday++;
  }

  return dash;
}
