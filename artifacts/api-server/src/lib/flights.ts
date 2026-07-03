// Pure flight-booking helpers, decoupled from the database and any external
// provider so they can be unit-tested in isolation. The Demo provider builds
// deterministic offers from the search criteria — no network, no API keys.

export type CabinClass = "first" | "business" | "economy";

export type FlightSearchCriteria = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  cabinClass: CabinClass;
};

export type FlightOffer = {
  id: string;
  airline: string;
  airlineAr: string;
  flightNumber: string;
  aircraft: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  terminal: string;
  baggageAllowance: string;
  fareCategory: string;
  cabinClass: CabinClass;
  price: number;
  currency: string;
  seatsAvailable: number;
};

type Carrier = {
  code: string;
  name: string;
  nameAr: string;
  basePrice: number;
  fleet: string[];
};

// A small fixed roster of carriers gives the Demo provider a realistic spread
// of offers while staying fully deterministic.
const CARRIERS: Carrier[] = [
  { code: "EY", name: "Etihad Airways", nameAr: "الاتحاد للطيران", basePrice: 4200, fleet: ["Boeing 787-9 Dreamliner", "Airbus A380-800", "Boeing 777-300ER"] },
  { code: "EK", name: "Emirates", nameAr: "طيران الإمارات", basePrice: 4500, fleet: ["Airbus A380-800", "Boeing 777-300ER", "Boeing 777-200LR"] },
  { code: "WY", name: "Oman Air", nameAr: "الطيران العماني", basePrice: 3100, fleet: ["Boeing 787-9 Dreamliner", "Boeing 737 MAX 8", "Airbus A330-300"] },
  { code: "QR", name: "Qatar Airways", nameAr: "الخطوط الجوية القطرية", basePrice: 3900, fleet: ["Airbus A350-1000", "Boeing 777-300ER", "Airbus A380-800"] },
  { code: "SV", name: "Saudia", nameAr: "الخطوط السعودية", basePrice: 2800, fleet: ["Boeing 787-10 Dreamliner", "Airbus A330-300", "Boeing 777-300ER"] },
  { code: "GF", name: "Gulf Air", nameAr: "طيران الخليج", basePrice: 2600, fleet: ["Boeing 787-9 Dreamliner", "Airbus A321neo", "Airbus A320neo"] },
];

const FARE_CATEGORIES = ["Flex", "Saver", "Classic"];
const TERMINALS = ["1", "2", "3"];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  first: 2.6,
  business: 1.6,
  economy: 1,
};

const CABIN_BAGGAGE: Record<CabinClass, string> = {
  first: "3 × 32kg",
  business: "2 × 32kg",
  economy: "1 × 23kg",
};

// Simple deterministic string hash so the same criteria always yields the same
// offers (stable demo experience, reproducible tests).
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// Produce HH:MM from a minute-of-day value, wrapping past midnight.
function minutesToTime(total: number): string {
  const m = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function generateFlightOffers(criteria: FlightSearchCriteria): FlightOffer[] {
  const { origin, destination, date, cabinClass } = criteria;
  const seed = hash(`${origin}|${destination}|${date}|${cabinClass}`);
  const count = 4 + (seed % 3); // 4–6 offers

  const offers: FlightOffer[] = [];
  for (let i = 0; i < count; i++) {
    const carrier = CARRIERS[(seed + i * 7) % CARRIERS.length]!;
    const aircraft = carrier.fleet[(seed + i * 3) % carrier.fleet.length]!;
    const flightNo = 100 + ((seed >> (i + 1)) % 899);
    const departMinutes = (6 * 60 + ((seed + i * 137) % (15 * 60))) % 1440; // 06:00–21:00 window
    const durationMinutes = 75 + ((seed + i * 53) % 240); // 1h15m – 5h15m
    const arriveMinutes = departMinutes + durationMinutes;
    const fareCategory = FARE_CATEGORIES[(seed + i) % FARE_CATEGORIES.length]!;
    const terminal = TERMINALS[(seed + i) % TERMINALS.length]!;
    const priceVariance = (seed + i * 211) % 800;
    const price = Math.round(
      (carrier.basePrice + priceVariance) * CABIN_MULTIPLIER[cabinClass],
    );

    offers.push({
      id: `${carrier.code}${flightNo}-${i}`,
      airline: carrier.name,
      airlineAr: carrier.nameAr,
      flightNumber: `${carrier.code} ${flightNo}`,
      aircraft,
      origin,
      destination,
      departureTime: `${date} ${minutesToTime(departMinutes)}`,
      arrivalTime: `${date} ${minutesToTime(arriveMinutes)}`,
      duration: `${Math.floor(durationMinutes / 60)}h ${pad(durationMinutes % 60)}m`,
      terminal: `T${terminal}`,
      baggageAllowance: CABIN_BAGGAGE[cabinClass],
      fareCategory,
      cabinClass,
      price,
      currency: "AED",
      seatsAvailable: 3 + ((seed + i * 17) % 8),
    });
  }

  // Cheapest first — protocol teams usually scan by fare, then timing.
  return offers.sort((a, b) => a.price - b.price);
}

const PNR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"; // no I/O for legibility

// Generate a 6-character booking reference. Accepts an optional seed so tests
// can assert deterministic output; otherwise uses time + randomness.
export function generatePnr(seed?: string): string {
  let h = seed != null ? hash(seed) : (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += PNR_ALPHABET[h % PNR_ALPHABET.length];
    h = Math.floor(h / PNR_ALPHABET.length) + (i + 1) * 2654435761;
    h = h >>> 0;
  }
  return out;
}

// IATA-style 13-digit e-ticket number: a 3-digit airline accounting prefix
// followed by a 10-digit serial. Demo only — not a real ticket stock number.
const AIRLINE_TICKET_PREFIX: Record<string, string> = {
  EY: "607",
  EK: "176",
  WY: "910",
  QR: "157",
  SV: "065",
  GF: "072",
};

export function generateETicketNumber(carrierCode: string, seed?: string): string {
  const prefix = AIRLINE_TICKET_PREFIX[carrierCode] ?? "000";
  let h = seed != null ? hash(seed) : (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
  let serial = "";
  for (let i = 0; i < 10; i++) {
    serial += (h % 10).toString();
    h = Math.floor(h / 10) + (i + 1) * 2654435761;
    h = h >>> 0;
  }
  return `${prefix}-${serial}`;
}

// Build the return-leg offers for a round-trip by searching the reversed route
// on the return date. Keeps the demo deterministic and symmetric.
export function generateReturnOffers(
  criteria: FlightSearchCriteria,
  returnDate: string,
): FlightOffer[] {
  return generateFlightOffers({
    ...criteria,
    origin: criteria.destination,
    destination: criteria.origin,
    date: returnDate,
  });
}

export type TravelDashboardRow = {
  direction: string | null;
  status: string;
  departureTime: string | null;
  arrivalTime: string | null;
};

export type TravelDashboard = {
  total: number;
  arrivingToday: number;
  departingToday: number;
  confirmed: number;
  pending: number;
  delayed: number;
  cancelled: number;
};

// `today` is an ISO date prefix (YYYY-MM-DD). A row counts as arriving/departing
// today when its relevant timestamp string starts with that date.
export function buildTravelDashboard(
  rows: TravelDashboardRow[],
  today: string,
): TravelDashboard {
  const dash: TravelDashboard = {
    total: rows.length,
    arrivingToday: 0,
    departingToday: 0,
    confirmed: 0,
    pending: 0,
    delayed: 0,
    cancelled: 0,
  };

  for (const r of rows) {
    if (r.status === "confirmed") dash.confirmed++;
    if (r.status === "pending") dash.pending++;
    if (r.status === "delayed") dash.delayed++;
    if (r.status === "cancelled") dash.cancelled++;

    if (r.status === "cancelled") continue;
    const isArrival = r.direction === "arrival";
    const stamp = (isArrival ? r.arrivalTime : r.departureTime) ?? "";
    if (stamp.startsWith(today)) {
      if (isArrival) dash.arrivingToday++;
      else dash.departingToday++;
    }
  }

  return dash;
}
