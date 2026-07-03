import {
  db,
  pool,
  eventsTable,
  travelTable,
  hotelBookingsTable,
  fleetAssignmentsTable,
  giftsTable,
  documentsTable,
  budgetItemsTable,
  type InsertTravel,
  type InsertHotelBooking,
  type InsertFleetAssignment,
  type InsertGift,
  type InsertDocument,
  type InsertBudgetItem,
} from "@workspace/db";
import { asc } from "drizzle-orm";

async function main() {
  const events = await db
    .select({ id: eventsTable.id, name: eventsTable.name })
    .from(eventsTable)
    .orderBy(asc(eventsTable.id));

  if (events.length === 0) {
    console.error(
      "No events found. Create events before seeding logistics data.",
    );
    process.exitCode = 1;
    return;
  }

  // Pick a handful of real events to attach logistics to.
  const pick = (n: number) => events[n % events.length]!.id;
  const e0 = pick(0);
  const e1 = pick(1);
  const e2 = pick(2);
  const e3 = pick(3);
  const e4 = pick(4);

  // Idempotent: clear existing logistics rows so re-running produces a clean set.
  await db.delete(travelTable);
  await db.delete(hotelBookingsTable);
  await db.delete(fleetAssignmentsTable);
  await db.delete(giftsTable);
  await db.delete(documentsTable);
  await db.delete(budgetItemsTable);

  const travel: InsertTravel[] = [
    {
      eventId: e0,
      direction: "arrival",
      passengerName: "H.E. State Delegation Lead",
      passengerNameAr: "سعادة رئيس الوفد",
      flightNumber: "EK201",
      airline: "Emirates",
      origin: "Riyadh (RUH)",
      destination: "Abu Dhabi (AUH)",
      departureTime: "2026-06-12T08:00:00",
      arrivalTime: "2026-06-12T09:45:00",
      seatClass: "first",
      status: "scheduled",
      pnr: "EK7QX2",
      terminal: "Terminal 3",
      baggageAllowance: "2 × 32kg",
      fareCategory: "First Flex",
      duration: "1h 45m",
      bookingProvider: "demo",
      passengerCount: 1,
    },
    {
      eventId: e0,
      direction: "departure",
      passengerName: "H.E. State Delegation Lead",
      passengerNameAr: "سعادة رئيس الوفد",
      flightNumber: "EK202",
      airline: "Emirates",
      origin: "Abu Dhabi (AUH)",
      destination: "Riyadh (RUH)",
      departureTime: "2026-06-14T18:00:00",
      arrivalTime: "2026-06-14T19:45:00",
      seatClass: "first",
      status: "scheduled",
      pnr: "EK7QX2",
      terminal: "Terminal A",
      baggageAllowance: "2 × 32kg",
      fareCategory: "First Flex",
      duration: "1h 45m",
      bookingProvider: "demo",
      passengerCount: 1,
    },
    {
      eventId: e1,
      direction: "arrival",
      passengerName: "US Delegation Attaché",
      passengerNameAr: "ملحق الوفد الأمريكي",
      flightNumber: "EY101",
      airline: "Etihad Airways",
      origin: "Washington (IAD)",
      destination: "Abu Dhabi (AUH)",
      departureTime: "2026-06-15T22:30:00",
      arrivalTime: "2026-06-16T19:10:00",
      seatClass: "business",
      status: "confirmed",
      pnr: "EY3KP9",
      terminal: "Terminal A",
      baggageAllowance: "2 × 23kg",
      fareCategory: "Business Flex",
      duration: "13h 40m",
      bookingProvider: "demo",
      passengerCount: 1,
    },
    {
      eventId: e3,
      direction: "arrival",
      passengerName: "French Presidential Aide",
      passengerNameAr: "مساعد الرئاسة الفرنسية",
      flightNumber: "AF656",
      airline: "Air France",
      origin: "Paris (CDG)",
      destination: "Abu Dhabi (AUH)",
      departureTime: "2026-06-18T10:15:00",
      arrivalTime: "2026-06-18T19:20:00",
      seatClass: "business",
      status: "scheduled",
      pnr: "AF5RB7",
      terminal: "Terminal A",
      baggageAllowance: "2 × 23kg",
      fareCategory: "Business Flex",
      duration: "7h 05m",
      bookingProvider: "demo",
      passengerCount: 1,
    },
  ];

  const hotels: InsertHotelBooking[] = [
    {
      eventId: e0,
      guestName: "H.E. State Delegation Lead",
      guestNameAr: "سعادة رئيس الوفد",
      hotelName: "Emirates Palace Mandarin Oriental",
      hotelNameAr: "قصر الإمارات ماندارين أورينتال",
      hotelCategory: "presidential",
      rating: 5,
      location: "West Corniche, Abu Dhabi",
      locationAr: "الكورنيش الغربي، أبوظبي",
      distanceFromVenue: "2 km",
      roomType: "presidentialSuite",
      rooms: 1,
      nights: 2,
      checkIn: "2026-06-12",
      checkOut: "2026-06-14",
      vipLevel: "headOfState",
      amenities: "spa,fineDining,helipad,butler,concierge",
      vipServices: "majlis,dedicatedButler,securityFloor,motorcadeParking",
      estimatedCost: 96000,
      currency: "AED",
      securityNotes: "Dedicated security floor; motorcade access via VIP entrance.",
      dietaryNotes: "Halal only; no shellfish.",
      protocolNotes: "Head-of-state arrival protocol; majlis reception on arrival.",
      confirmationNumber: "EP-44218",
      bookingProvider: "demo",
      status: "confirmed",
    },
    {
      eventId: e0,
      guestName: "Delegation Support Team",
      guestNameAr: "فريق دعم الوفد",
      hotelName: "Emirates Palace Mandarin Oriental",
      hotelNameAr: "قصر الإمارات ماندارين أورينتال",
      hotelCategory: "luxury5",
      rating: 5,
      location: "West Corniche, Abu Dhabi",
      locationAr: "الكورنيش الغربي، أبوظبي",
      distanceFromVenue: "2 km",
      roomType: "executiveSuite",
      rooms: 6,
      nights: 2,
      checkIn: "2026-06-12",
      checkOut: "2026-06-14",
      vipLevel: "vip",
      amenities: "pool,fitness,fineDining,concierge",
      vipServices: "airportTransfer,privateCheckIn",
      estimatedCost: 72000,
      currency: "AED",
      confirmationNumber: "EP-44219",
      bookingProvider: "demo",
      status: "reserved",
    },
    {
      eventId: e1,
      guestName: "US Delegation",
      guestNameAr: "الوفد الأمريكي",
      hotelName: "St. Regis Abu Dhabi",
      hotelNameAr: "سانت ريجيس أبوظبي",
      hotelCategory: "fiveStar",
      rating: 5,
      location: "Corniche, Abu Dhabi",
      locationAr: "الكورنيش، أبوظبي",
      distanceFromVenue: "3 km",
      roomType: "royalSuite",
      rooms: 4,
      nights: 2,
      checkIn: "2026-06-16",
      checkOut: "2026-06-18",
      vipLevel: "vvip",
      amenities: "spa,butler,fineDining,ballroom,concierge",
      vipServices: "airportTransfer,dedicatedButler,securityFloor",
      estimatedCost: 88000,
      currency: "AED",
      securityNotes: "Adjoining secured rooms for protective detail.",
      protocolNotes: "VVIP protocol; private check-in.",
      confirmationNumber: "SR-90112",
      bookingProvider: "demo",
      status: "reserved",
    },
    {
      eventId: e3,
      guestName: "French Delegation",
      guestNameAr: "الوفد الفرنسي",
      hotelName: "Four Seasons Abu Dhabi",
      hotelNameAr: "فورسيزونز أبوظبي",
      hotelCategory: "presidential",
      rating: 5,
      location: "Al Maryah Island, Abu Dhabi",
      locationAr: "جزيرة المارية، أبوظبي",
      distanceFromVenue: "5 km",
      roomType: "presidentialSuite",
      rooms: 1,
      nights: 2,
      checkIn: "2026-06-18",
      checkOut: "2026-06-20",
      vipLevel: "headOfState",
      amenities: "spa,marina,fineDining,butler,concierge",
      vipServices: "majlis,dedicatedButler,motorcadeParking,privateDining",
      estimatedCost: 92000,
      currency: "AED",
      securityNotes: "Full floor reserved; helipad transfer arranged.",
      dietaryNotes: "Pescatarian options required.",
      protocolNotes: "Head-of-state arrival; private dining for delegation.",
      confirmationNumber: "FS-33571",
      bookingProvider: "demo",
      status: "confirmed",
    },
  ];

  const fleet: InsertFleetAssignment[] = [
    {
      eventId: e0,
      vehicleType: "limousine",
      plateNumber: "AD-1",
      driverName: "Khalid Al Mansoori",
      driverNameAr: "خالد المنصوري",
      assignedTo: "H.E. State Delegation Lead",
      assignedToAr: "سعادة رئيس الوفد",
      capacity: 4,
      pickupLocation: "Abu Dhabi International Airport",
      dropoffLocation: "Emirates Palace",
      pickupTime: "2026-06-12T09:45:00",
      status: "assigned",
    },
    {
      eventId: e0,
      vehicleType: "suv",
      plateNumber: "AD-1188",
      driverName: "Saeed Al Hammadi",
      driverNameAr: "سعيد الحمادي",
      assignedTo: "Security Detail",
      assignedToAr: "فريق الحماية",
      capacity: 6,
      pickupLocation: "Abu Dhabi International Airport",
      dropoffLocation: "Emirates Palace",
      pickupTime: "2026-06-12T09:45:00",
      status: "assigned",
    },
    {
      eventId: e1,
      vehicleType: "sedan",
      plateNumber: "AD-7720",
      driverName: "Omar Al Suwaidi",
      driverNameAr: "عمر السويدي",
      assignedTo: "US Delegation",
      assignedToAr: "الوفد الأمريكي",
      capacity: 4,
      pickupLocation: "St. Regis Abu Dhabi",
      dropoffLocation: "Qasr Al Watan",
      pickupTime: "2026-06-16T20:00:00",
      status: "assigned",
    },
    {
      eventId: e3,
      vehicleType: "limousine",
      plateNumber: "AD-2",
      driverName: "Rashid Al Nuaimi",
      driverNameAr: "راشد النعيمي",
      assignedTo: "French Delegation",
      assignedToAr: "الوفد الفرنسي",
      capacity: 4,
      pickupLocation: "Abu Dhabi International Airport",
      dropoffLocation: "Four Seasons Abu Dhabi",
      pickupTime: "2026-06-18T19:20:00",
      status: "confirmed",
    },
  ];

  const gifts: InsertGift[] = [
    {
      eventId: e0,
      recipient: "H.E. State Delegation Lead",
      recipientAr: "سعادة رئيس الوفد",
      item: "Gold-plated commemorative falcon",
      itemAr: "صقر تذكاري مطلي بالذهب",
      description: "Hand-crafted ceremonial gift in presentation case",
      quantity: 1,
      value: 18000,
      currency: "AED",
      status: "ordered",
    },
    {
      eventId: e1,
      recipient: "US Delegation",
      recipientAr: "الوفد الأمريكي",
      item: "Engraved oud incense set",
      itemAr: "طقم عود محفور",
      description: "Premium oud set with custom engraving",
      quantity: 4,
      value: 3200,
      currency: "AED",
      status: "planned",
    },
    {
      eventId: e3,
      recipient: "French Delegation",
      recipientAr: "الوفد الفرنسي",
      item: "Calligraphy artwork",
      itemAr: "لوحة خط عربي",
      description: "Framed Arabic calligraphy artwork",
      quantity: 2,
      value: 9500,
      currency: "AED",
      status: "ordered",
    },
  ];

  const documents: InsertDocument[] = [
    {
      eventId: e0,
      title: "Summit Protocol Order of Precedence",
      titleAr: "ترتيب الأسبقية البروتوكولية للقمة",
      docType: "protocol",
      referenceNumber: "PRT-2026-001",
      owner: "Protocol Office",
      status: "approved",
    },
    {
      eventId: e0,
      title: "Security Clearance Manifest",
      titleAr: "كشف التصاريح الأمنية",
      docType: "security",
      referenceNumber: "SEC-2026-014",
      owner: "Security Coordination",
      status: "pending",
    },
    {
      eventId: e1,
      title: "Delegation Itinerary",
      titleAr: "برنامج زيارة الوفد",
      docType: "itinerary",
      referenceNumber: "ITN-2026-007",
      owner: "Protocol Office",
      status: "approved",
    },
    {
      eventId: e3,
      title: "Bilateral Meeting Briefing Pack",
      titleAr: "حقيبة إحاطة الاجتماع الثنائي",
      docType: "briefing",
      referenceNumber: "BRF-2026-022",
      owner: "Foreign Affairs Liaison",
      status: "pending",
    },
  ];

  const budgetItems: InsertBudgetItem[] = [
    {
      eventId: e0,
      category: "accommodation",
      item: "Hotel accommodation (presidential + support)",
      itemAr: "الإقامة الفندقية",
      estimatedCost: 220000,
      actualCost: 248000,
      currency: "AED",
      vendor: "Emirates Palace",
      status: "actual",
    },
    {
      eventId: e0,
      category: "transport",
      item: "Fleet & motorcade",
      itemAr: "أسطول المركبات والموكب",
      estimatedCost: 85000,
      actualCost: 92000,
      currency: "AED",
      vendor: "VIP Fleet Services",
      status: "actual",
    },
    {
      eventId: e0,
      category: "hospitality",
      item: "Ceremonial gifts",
      itemAr: "الهدايا التذكارية",
      estimatedCost: 20000,
      actualCost: 18000,
      currency: "AED",
      vendor: "Heritage Crafts",
      status: "actual",
    },
    {
      eventId: e1,
      category: "accommodation",
      item: "Hotel accommodation",
      itemAr: "الإقامة الفندقية",
      estimatedCost: 96000,
      actualCost: 96000,
      currency: "AED",
      vendor: "St. Regis Abu Dhabi",
      status: "actual",
    },
    {
      eventId: e1,
      category: "catering",
      item: "Reception catering",
      itemAr: "تموين الاستقبال",
      estimatedCost: 60000,
      actualCost: null,
      currency: "AED",
      vendor: "Royal Catering",
      status: "estimated",
    },
    {
      eventId: e3,
      category: "accommodation",
      item: "Hotel accommodation",
      itemAr: "الإقامة الفندقية",
      estimatedCost: 140000,
      actualCost: 135000,
      currency: "AED",
      vendor: "Four Seasons Abu Dhabi",
      status: "actual",
    },
    {
      eventId: e3,
      category: "transport",
      item: "Fleet & motorcade",
      itemAr: "أسطول المركبات والموكب",
      estimatedCost: 70000,
      actualCost: null,
      currency: "AED",
      vendor: "VIP Fleet Services",
      status: "estimated",
    },
  ];

  await db.insert(travelTable).values(travel);
  await db.insert(hotelBookingsTable).values(hotels);
  await db.insert(fleetAssignmentsTable).values(fleet);
  await db.insert(giftsTable).values(gifts);
  await db.insert(documentsTable).values(documents);
  await db.insert(budgetItemsTable).values(budgetItems);

  console.log("Seeded logistics data:");
  console.log(`  travel:    ${travel.length}`);
  console.log(`  hotels:    ${hotels.length}`);
  console.log(`  fleet:     ${fleet.length}`);
  console.log(`  gifts:     ${gifts.length}`);
  console.log(`  documents: ${documents.length}`);
  console.log(`  budget:    ${budgetItems.length}`);
}

main()
  .catch((err) => {
    console.error("Failed to seed logistics data:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
