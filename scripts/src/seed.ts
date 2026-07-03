/**
 * Rich demo seed for the Presidential Protocol platform.
 *
 *   DATABASE_URL=... pnpm --filter @workspace/scripts run seed
 *
 * Idempotent: truncates all demo tables and reinserts a realistic UAE protocol
 * dataset across events, visits, delegations, guests, invitations/RSVP, tasks,
 * readiness, approvals, flights, hotels, fleet, risks, reports, and budget
 * (which drives the computed budget notifications).
 */
import {
  db, pool,
  eventsTable, readinessCategoriesTable, visitsTable, tasksTable, approvalsTable,
  risksTable, invitationsTable, guestsTable, travelTable, hotelBookingsTable,
  fleetAssignmentsTable, giftsTable, budgetItemsTable, documentsTable, reportsTable,
  participantsTable, vipsTable, calendarEntriesTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

const DAY = 86400000;
function d(offsetDays: number, h = 9, m = 0): string {
  const dt = new Date(Date.now() + offsetDays * DAY);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}
const day = (o: number) => d(o, 12).slice(0, 10);

async function main() {
  console.log("Clearing existing demo data…");
  await db.execute(sql`TRUNCATE TABLE
    readiness_categories, event_guests, event_participants, invitations, tasks,
    approvals, risks, travel, hotel_bookings, fleet_assignments, gifts,
    budget_items, documents, reports, visits, vips, calendar_entries,
    notifications, budget_alert_states, events
    RESTART IDENTITY CASCADE`);

  /* ── Events ──────────────────────────────────────────── */
  const events = await db.insert(eventsTable).values([
    { name: "State Banquet for the President of France", nameAr: "مأدبة رسمية لرئيس الجمهورية الفرنسية", date: d(5, 18), location: "Qasr Al Watan", locationAr: "قصر الوطن", status: "confirmed", readinessPercent: 78, riskLevel: "medium", pendingTasksCount: 3, time: "18:00", eventType: "visitOfficial", country: "France", countryAr: "فرنسا", vipLevel: "headOfState", priority: "high", notes: "زيارة دولة تتضمن مأدبة عشاء رسمية وجلسة مباحثات ثنائية.", pinned: true, pinOrder: 1, watched: true, colorTag: "vipVisit" },
    { name: "GCC Summit Delegation Reception", nameAr: "استقبال وفد القمة الخليجية", date: d(9, 10), location: "Presidential Palace", locationAr: "القصر الرئاسي", status: "upcoming", readinessPercent: 52, riskLevel: "high", pendingTasksCount: 5, time: "10:00", eventType: "delegationReception", country: "Saudi Arabia", countryAr: "المملكة العربية السعودية", vipLevel: "minister", priority: "urgent", notes: "وفد رفيع المستوى يضم عدداً من الوزراء.", pinned: true, pinOrder: 2, watched: true, colorTag: "highPriority" },
    { name: "55th National Day Ceremony", nameAr: "احتفال اليوم الوطني الخامس والخمسين", date: d(20, 17), location: "Union House", locationAr: "دار الاتحاد", status: "planned", readinessPercent: 35, riskLevel: "low", pendingTasksCount: 8, time: "17:00", eventType: "nationalEvent", country: "UAE", countryAr: "الإمارات", vipLevel: "standard", priority: "medium", pinned: false, pinOrder: 0, watched: false, colorTag: "nationalEvent" },
    { name: "Protocol Coordination Meeting", nameAr: "اجتماع تنسيق المراسم", date: d(2, 11), location: "Protocol Office", locationAr: "مكتب المراسم", status: "confirmed", readinessPercent: 92, riskLevel: "low", pendingTasksCount: 1, time: "11:00", eventType: "coordinationMeeting", country: "UAE", countryAr: "الإمارات", vipLevel: "standard", priority: "low", pinned: false, pinOrder: 0, watched: false },
    { name: "Ambassadors Credentials Ceremony", nameAr: "مراسم تقديم أوراق اعتماد السفراء", date: d(14, 12), location: "Qasr Al Watan", locationAr: "قصر الوطن", status: "upcoming", readinessPercent: 64, riskLevel: "medium", pendingTasksCount: 4, time: "12:00", eventType: "protocolMeeting", country: "Japan", countryAr: "اليابان", vipLevel: "ambassador", priority: "high", pinned: false, pinOrder: 0, watched: true },
    { name: "UAE–Germany Investment Forum", nameAr: "منتدى الاستثمار الإماراتي الألماني", date: d(12, 9), location: "ADNEC", locationAr: "أدنيك", status: "confirmed", readinessPercent: 70, riskLevel: "medium", pendingTasksCount: 4, time: "09:00", eventType: "visitOfficial", country: "Germany", countryAr: "ألمانيا", vipLevel: "minister", priority: "high", pinned: false, pinOrder: 0, watched: false },
    { name: "Arab Cultural Summit", nameAr: "القمة الثقافية العربية", date: d(-10, 19), location: "Louvre Abu Dhabi", locationAr: "اللوفر أبوظبي", status: "completed", readinessPercent: 100, riskLevel: "low", pendingTasksCount: 0, time: "19:00", eventType: "nationalEvent", country: "Egypt", countryAr: "مصر", vipLevel: "minister", priority: "medium", pinned: false, pinOrder: 0, watched: false },
  ]).returning({ id: eventsTable.id });
  const E = events.map((e) => e.id);
  console.log(`  + ${E.length} events`);

  /* ── Readiness categories ────────────────────────────── */
  const CATS: Array<[string, string]> = [
    ["protocol", "المراسم"], ["security", "الأمن"], ["logistics", "اللوجستيات"], ["media", "الإعلام"], ["hospitality", "الضيافة"],
  ];
  const readiness = E.flatMap((id, i) => {
    const base = [78, 52, 35, 92, 64, 70, 100][i];
    return CATS.map(([name, nameAr], j) => {
      const percent = Math.max(0, Math.min(100, base + [6, -8, 10, -4, 2][j]));
      return { eventId: id, name, nameAr, percent, status: percent >= 80 ? "confirmed" : percent >= 50 ? "inProgress" : "pending" };
    });
  });
  await db.insert(readinessCategoriesTable).values(readiness);
  console.log(`  + ${readiness.length} readiness categories`);

  /* ── Tasks ───────────────────────────────────────────── */
  const tasks = [
    { eventId: E[0], title: "Confirm seating plan", titleAr: "تأكيد مخطط الجلوس", status: "done", priority: "high", category: "protocol", team: "Protocol", assignedTo: "Ahmed Al Mansoori", readinessImpact: 15, dueDate: day(3) },
    { eventId: E[0], title: "Finalize banquet menu", titleAr: "اعتماد قائمة المأدبة", status: "done", priority: "medium", category: "hospitality", team: "Hospitality", assignedTo: "Sara Al Ali", readinessImpact: 10, dueDate: day(2) },
    { eventId: E[0], title: "Security sweep & motorcade", titleAr: "تمشيط أمني وتأمين الموكب", status: "pending", priority: "critical", category: "security", team: "Security", assignedTo: "Khalid Saeed", readinessImpact: 20, dueDate: day(4) },
    { eventId: E[0], title: "Press accreditation pack", titleAr: "حزمة اعتماد الصحافة", status: "pending", priority: "medium", category: "media", team: "Media", readinessImpact: 8, dueDate: day(4) },
    { eventId: E[0], title: "Run of show rehearsal", titleAr: "بروفة السيناريو التنفيذي", status: "pending", priority: "high", category: "planning", team: "Planning", readinessImpact: 12, dueDate: day(1) },
    { eventId: E[1], title: "Delegation manifest", titleAr: "كشف الوفد", status: "pending", priority: "high", category: "protocol", team: "Protocol", readinessImpact: 18, dueDate: day(6) },
    { eventId: E[1], title: "Hotel block confirmation", titleAr: "تأكيد حجز الفندق", status: "pending", priority: "high", category: "logistics", team: "Logistics", readinessImpact: 15, dueDate: day(5) },
    { eventId: E[1], title: "Interpreters roster", titleAr: "جدول المترجمين", status: "done", priority: "medium", category: "planning", readinessImpact: 10, dueDate: day(3) },
    { eventId: E[2], title: "Stage & fireworks plan", titleAr: "خطة المسرح والألعاب النارية", status: "pending", priority: "high", category: "logistics", team: "Logistics", readinessImpact: 14, dueDate: day(15) },
    { eventId: E[2], title: "National anthem rehearsal", titleAr: "بروفة النشيد الوطني", status: "pending", priority: "medium", category: "media", readinessImpact: 8, dueDate: day(12) },
    { eventId: E[4], title: "Credentials order of precedence", titleAr: "ترتيب أسبقية أوراق الاعتماد", status: "pending", priority: "high", category: "protocol", team: "Protocol", readinessImpact: 16, dueDate: day(10) },
    { eventId: E[5], title: "Bilateral agenda sign-off", titleAr: "اعتماد جدول المباحثات", status: "done", priority: "high", category: "planning", readinessImpact: 12, dueDate: day(8) },
  ];
  await db.insert(tasksTable).values(tasks);
  console.log(`  + ${tasks.length} tasks`);

  /* ── Risks ───────────────────────────────────────────── */
  const risks = [
    { eventId: E[0], title: "Tight motorcade window", titleAr: "ضيق نافذة الموكب", category: "logistics", severity: "high", likelihood: "possible", impact: "Late arrival to the banquet", impactAr: "تأخر الوصول إلى المأدبة", mitigation: "Approved alternate route", mitigationAr: "مسار بديل معتمد", owner: "Security", status: "monitoring" },
    { eventId: E[0], title: "Weather risk for outdoor honors", titleAr: "مخاطر الطقس لمراسم الاستقبال", category: "weather", severity: "medium", likelihood: "unlikely", impact: "Relocate honors indoors", impactAr: "نقل المراسم للداخل", mitigation: "Conditioned fallback hall ready", mitigationAr: "قاعة بديلة مكيّفة جاهزة", owner: "Planning", status: "open" },
    { eventId: E[1], title: "Delegation size uncertainty", titleAr: "عدم تأكيد حجم الوفد", category: "protocol", severity: "high", likelihood: "likely", impact: "Affects bookings & seating", impactAr: "تأثير على الحجوزات والجلوس", mitigation: "Confirm final manifest 72h prior", mitigationAr: "تأكيد الكشف النهائي قبل 72 ساعة", owner: "Protocol", status: "open" },
    { eventId: E[2], title: "Crowd management capacity", titleAr: "إدارة سعة الحشود", category: "security", severity: "medium", likelihood: "possible", impact: "Congestion at gates", impactAr: "ازدحام عند البوابات", mitigation: "Staggered entry & extra marshals", mitigationAr: "دخول متدرج ومنظمون إضافيون", owner: "Security", status: "open" },
    { eventId: E[5], title: "Translation coverage gap", titleAr: "نقص تغطية الترجمة", category: "operational", severity: "low", likelihood: "unlikely", impact: "Minor delays in sessions", impactAr: "تأخير طفيف في الجلسات", mitigation: "On-call interpreter reserve", mitigationAr: "مترجم احتياطي عند الطلب", owner: "Planning", status: "mitigated" },
  ];
  await db.insert(risksTable).values(risks);
  console.log(`  + ${risks.length} risks`);

  /* ── Participants ────────────────────────────────────── */
  const participants = [
    { eventId: E[0], name: "Ahmed Al Mansoori", nameAr: "أحمد المنصوري", category: "internal", subType: "protocol", role: "Head of Protocol", organization: "Protocol Dept", phone: "+971500000001", attendanceStatus: "expected" },
    { eventId: E[0], name: "Fatima Al Zaabi", nameAr: "فاطمة الزعابي", category: "internal", subType: "logistics", role: "Logistics Lead", organization: "Logistics", phone: "+971500000002", attendanceStatus: "present" },
    { eventId: E[0], name: "Pierre Martin", nameAr: "بيير مارتن", category: "external", subType: "delegation", role: "Advisor to the President", organization: "Élysée", attendanceStatus: "expected" },
    { eventId: E[1], name: "Mohammed Al Otaibi", nameAr: "محمد العتيبي", category: "external", subType: "delegation", role: "Head of Delegation", organization: "GCC Secretariat", attendanceStatus: "expected" },
    { eventId: E[1], name: "Noura Al Kaabi", nameAr: "نورة الكعبي", category: "internal", subType: "media", role: "Media Liaison", organization: "Media Office", attendanceStatus: "expected" },
    { eventId: E[4], name: "Kenji Tanaka", nameAr: "كينجي تاناكا", category: "external", subType: "vip", role: "Ambassador", organization: "Embassy of Japan", attendanceStatus: "expected" },
  ];
  await db.insert(participantsTable).values(participants);
  console.log(`  + ${participants.length} participants`);

  /* ── Invitations (+ RSVP / delegations) ──────────────── */
  const invitations = await db.insert(invitationsTable).values([
    { guestName: "Mr. Jean Dupont", guestNameAr: "السيد جان دوبون", email: "jean.dupont@example.fr", eventId: E[0], status: "accepted", inviteType: "international", channel: "email", publicToken: "tok-fr-001", nationality: "France", organization: "Élysée", jobTitle: "Chief of Protocol", mobile: "+33100000000", requiresFlight: true, requiresHotel: true, requiresTransport: true, vipLevel: "headOfState", vipVerified: true, qrCode: "QR-FR-001" },
    { guestName: "French Presidential Delegation", guestNameAr: "الوفد الرئاسي الفرنسي", email: "delegation@example.fr", eventId: E[0], status: "pending", inviteType: "delegation", channel: "email", publicToken: "tok-fr-del", isDelegation: true, delegationName: "French Presidential Delegation", delegationNameAr: "الوفد الرئاسي الفرنسي", qrCode: "QR-FR-DEL" },
    { guestName: "H.E. Abdullah Al-Saud", guestNameAr: "معالي عبدالله آل سعود", email: "min@example.sa", eventId: E[1], status: "accepted", inviteType: "vip", channel: "email", publicToken: "tok-sa-001", nationality: "Saudi Arabia", organization: "Ministry of Foreign Affairs", jobTitle: "Minister", mobile: "+966500000000", requiresFlight: true, requiresHotel: true, requiresTransport: true, vipLevel: "minister", vipVerified: true, qrCode: "QR-SA-001" },
    { guestName: "GCC Delegation", guestNameAr: "وفد مجلس التعاون", email: "gcc@example.org", eventId: E[1], status: "pending", inviteType: "delegation", channel: "email", publicToken: "tok-gcc-del", isDelegation: true, delegationName: "GCC Delegation", delegationNameAr: "وفد مجلس التعاون الخليجي", qrCode: "QR-GCC-DEL" },
    { guestName: "Amb. Kenji Tanaka", guestNameAr: "السفير كينجي تاناكا", email: "tanaka@example.jp", eventId: E[4], status: "accepted", inviteType: "international", channel: "email", publicToken: "tok-jp-001", nationality: "Japan", organization: "Embassy of Japan", jobTitle: "Ambassador", mobile: "+81300000000", requiresHotel: true, requiresTransport: true, vipLevel: "ambassador", vipVerified: true, qrCode: "QR-JP-001" },
  ]).returning({ id: invitationsTable.id, eventId: invitationsTable.eventId });
  console.log(`  + ${invitations.length} invitations`);

  /* ── Guests (delegation members + accepted) ──────────── */
  const guests = [
    { eventId: E[0], invitationId: invitations[0].id, fullName: "Mr. Jean Dupont", fullNameAr: "السيد جان دوبون", nationality: "France", organization: "Élysée", jobTitle: "Chief of Protocol", requiresFlight: true, requiresHotel: true, requiresTransport: true, vipVerified: true },
    { eventId: E[0], invitationId: invitations[1].id, fullName: "Ms. Marie Laurent", fullNameAr: "السيدة ماري لوران", nationality: "France", organization: "Élysée", jobTitle: "Advisor", requiresFlight: true, requiresHotel: true },
    { eventId: E[0], invitationId: invitations[1].id, fullName: "Mr. Luc Bernard", fullNameAr: "السيد لوك برنارد", nationality: "France", organization: "Foreign Ministry", jobTitle: "Security Lead", requiresFlight: true, requiresHotel: true, requiresTransport: true },
    { eventId: E[1], invitationId: invitations[2].id, fullName: "H.E. Abdullah Al-Saud", fullNameAr: "معالي عبدالله آل سعود", nationality: "Saudi Arabia", organization: "MOFA", jobTitle: "Minister", requiresFlight: true, requiresHotel: true, requiresTransport: true, vipVerified: true },
    { eventId: E[1], invitationId: invitations[3].id, fullName: "Mr. Salman Al-Harbi", fullNameAr: "السيد سلمان الحربي", nationality: "Saudi Arabia", organization: "GCC", jobTitle: "Delegate", requiresHotel: true },
  ];
  await db.insert(guestsTable).values(guests);
  console.log(`  + ${guests.length} guests`);

  /* ── Travel (flights) ────────────────────────────────── */
  const travel = [
    { eventId: E[0], direction: "arrival", passengerName: "Mr. Jean Dupont", passengerNameAr: "السيد جان دوبون", flightNumber: "AF402", airline: "Air France", origin: "CDG", destination: "AUH", originCity: "Paris", destinationCity: "Abu Dhabi", departureTime: d(5, 1), arrivalTime: d(5, 9), seatClass: "first", status: "confirmed", pnr: "AF7QX2", terminal: "A", baggageAllowance: "3x32kg", fareCategory: "First Flex", duration: "7h 10m", currency: "AED", guestId: 1 },
    { eventId: E[1], direction: "arrival", passengerName: "H.E. Abdullah Al-Saud", passengerNameAr: "معالي عبدالله آل سعود", flightNumber: "SV553", airline: "Saudia", origin: "RUH", destination: "AUH", originCity: "Riyadh", destinationCity: "Abu Dhabi", departureTime: d(9, 6), arrivalTime: d(9, 8), seatClass: "first", status: "confirmed", pnr: "SV9KL1", terminal: "B", fareCategory: "First", duration: "1h 50m", currency: "AED" },
    { eventId: E[4], direction: "arrival", passengerName: "Amb. Kenji Tanaka", passengerNameAr: "السفير كينجي تاناكا", flightNumber: "NH7965", airline: "ANA", origin: "HND", destination: "AUH", originCity: "Tokyo", destinationCity: "Abu Dhabi", departureTime: d(13, 0), arrivalTime: d(13, 9), seatClass: "business", status: "scheduled", pnr: "NH4ZT8", terminal: "A", fareCategory: "Business", duration: "11h 30m", currency: "AED" },
  ];
  await db.insert(travelTable).values(travel);
  console.log(`  + ${travel.length} flights`);

  /* ── Hotels ──────────────────────────────────────────── */
  const hotels = [
    { eventId: E[0], guestId: 1, guestName: "Mr. Jean Dupont", guestNameAr: "السيد جان دوبون", hotelName: "Emirates Palace Mandarin Oriental", hotelNameAr: "قصر الإمارات مندرين أورينتال", hotelCategory: "presidential", rating: 5, location: "Abu Dhabi Corniche", roomType: "presidentialSuite", rooms: 1, nights: 2, checkIn: day(5), checkOut: day(7), vipLevel: "headOfState", estimatedCost: 90000, currency: "AED", confirmationNumber: "EP-90231", status: "confirmed", securityNotes: "Dedicated floor with full security" },
    { eventId: E[1], guestId: 4, guestName: "H.E. Abdullah Al-Saud", guestNameAr: "معالي عبدالله آل سعود", hotelName: "The Ritz-Carlton Grand Canal", hotelNameAr: "ريتز كارلتون القناة الكبرى", hotelCategory: "luxury5", rating: 5, location: "Khor Al Maqta", roomType: "royalSuite", rooms: 1, nights: 1, checkIn: day(9), checkOut: day(10), vipLevel: "minister", estimatedCost: 38000, currency: "AED", confirmationNumber: "RC-44190", status: "reserved" },
    { eventId: E[4], guestName: "Amb. Kenji Tanaka", guestNameAr: "السفير كينجي تاناكا", hotelName: "Conrad Etihad Towers", hotelNameAr: "كونراد أبراج الاتحاد", hotelCategory: "fiveStar", rating: 5, location: "Corniche Road", roomType: "executiveSuite", rooms: 1, nights: 3, checkIn: day(14), checkOut: day(17), vipLevel: "vip", estimatedCost: 21000, currency: "AED", confirmationNumber: "CD-77321", status: "reserved" },
  ];
  await db.insert(hotelBookingsTable).values(hotels);
  console.log(`  + ${hotels.length} hotel bookings`);

  /* ── Fleet ───────────────────────────────────────────── */
  const fleet = [
    { eventId: E[0], vehicleType: "limousine", plateNumber: "AD-1-12345", driverName: "Khalid", driverNameAr: "خالد", assignedTo: "Mr. Jean Dupont", assignedToAr: "السيد جان دوبون", capacity: 4, pickupLocation: "AUH Airport", dropoffLocation: "Emirates Palace", pickupTime: d(5, 9, 30), status: "assigned" },
    { eventId: E[1], vehicleType: "motorcade", plateNumber: "AD-2-20011", driverName: "Saif", driverNameAr: "سيف", assignedTo: "H.E. Abdullah Al-Saud", assignedToAr: "معالي عبدالله آل سعود", capacity: 4, pickupLocation: "AUH Airport", dropoffLocation: "Presidential Palace", pickupTime: d(9, 8, 30), status: "assigned" },
    { eventId: E[4], vehicleType: "suv", plateNumber: "AD-3-30022", driverName: "Omar", driverNameAr: "عمر", assignedTo: "Amb. Kenji Tanaka", assignedToAr: "السفير كينجي تاناكا", capacity: 5, pickupLocation: "AUH Airport", dropoffLocation: "Conrad Etihad Towers", pickupTime: d(13, 9, 30), status: "dispatched" },
  ];
  await db.insert(fleetAssignmentsTable).values(fleet);
  console.log(`  + ${fleet.length} fleet assignments`);

  /* ── Gifts ───────────────────────────────────────────── */
  const gifts = [
    { eventId: E[0], recipient: "President of France", recipientAr: "رئيس فرنسا", item: "Silver Qasr Al Watan model", itemAr: "مجسّم فضي لقصر الوطن", quantity: 1, value: 25000, currency: "AED", status: "approved" },
    { eventId: E[1], recipient: "Head of GCC Delegation", recipientAr: "رئيس وفد مجلس التعاون", item: "Gilded Quran", itemAr: "مصحف مذهّب", quantity: 1, value: 12000, currency: "AED", status: "procured" },
  ];
  await db.insert(giftsTable).values(gifts);
  console.log(`  + ${gifts.length} gifts`);

  /* ── Budget (some events over → drives notifications) ── */
  const budget = [
    { eventId: E[0], category: "hospitality", item: "Banquet catering", itemAr: "ضيافة المأدبة", estimatedCost: 400000, actualCost: 470000, currency: "AED", vendor: "Royal Catering", status: "committed" },
    { eventId: E[0], category: "security", item: "Security operations", itemAr: "العمليات الأمنية", estimatedCost: 500000, actualCost: 540000, currency: "AED", status: "approved" },
    { eventId: E[1], category: "venue", item: "Reception hall & staging", itemAr: "قاعة الاستقبال والتجهيز", estimatedCost: 300000, actualCost: 285000, currency: "AED", status: "committed" },
    { eventId: E[2], category: "media", item: "Fireworks & broadcast", itemAr: "الألعاب النارية والبث", estimatedCost: 2000000, actualCost: 900000, currency: "AED", status: "estimated" },
    { eventId: E[5], category: "general", item: "Forum logistics", itemAr: "لوجستيات المنتدى", estimatedCost: 250000, actualCost: 240000, currency: "AED", status: "approved" },
  ];
  await db.insert(budgetItemsTable).values(budget);
  console.log(`  + ${budget.length} budget items`);

  /* ── Documents ───────────────────────────────────────── */
  const documents = [
    { eventId: E[0], title: "State visit agenda", titleAr: "جدول الزيارة الرسمية", docType: "agenda", referenceNumber: "AG-2026-014", owner: "Protocol", status: "approved" },
    { eventId: E[1], title: "Delegation briefing pack", titleAr: "حزمة إحاطة الوفد", docType: "briefing", referenceNumber: "BR-2026-022", owner: "Planning", status: "inReview" },
  ];
  await db.insert(documentsTable).values(documents);
  console.log(`  + ${documents.length} documents`);

  /* ── Visits ──────────────────────────────────────────── */
  await db.insert(visitsTable).values([
    { guestName: "President of France", guestNameAr: "رئيس الجمهورية الفرنسية", country: "France", countryAr: "فرنسا", arrivalDate: d(5, 9), departureDate: d(6, 14), status: "confirmed", purpose: "State visit", purposeAr: "زيارة دولة", protocolLevel: "headOfState" },
    { guestName: "Saudi Foreign Minister", guestNameAr: "وزير الخارجية السعودي", country: "Saudi Arabia", countryAr: "السعودية", arrivalDate: d(9, 8), departureDate: d(9, 20), status: "confirmed", purpose: "Bilateral talks", purposeAr: "محادثات ثنائية", protocolLevel: "minister" },
    { guestName: "Japanese Ambassador", guestNameAr: "السفير الياباني", country: "Japan", countryAr: "اليابان", arrivalDate: d(14, 10), status: "scheduled", purpose: "Credentials", purposeAr: "أوراق اعتماد", protocolLevel: "ambassador" },
    { guestName: "German Trade Delegation", guestNameAr: "الوفد التجاري الألماني", country: "Germany", countryAr: "ألمانيا", arrivalDate: d(12, 8), departureDate: d(13, 18), status: "scheduled", purpose: "Investment forum", purposeAr: "منتدى الاستثمار", protocolLevel: "standard" },
  ]);
  console.log("  + 4 visits");

  /* ── Approvals ───────────────────────────────────────── */
  await db.insert(approvalsTable).values([
    { title: "Motorcade route — France visit", titleAr: "مسار الموكب — زيارة فرنسا", requestedBy: "Protocol Office", status: "pending", eventId: E[0], notes: "بانتظار اعتماد الجهات الأمنية." },
    { title: "Guest list — GCC reception", titleAr: "قائمة ضيوف — استقبال الخليج", requestedBy: "Planning Team", status: "pending", eventId: E[1] },
    { title: "Media accreditation — National Day", titleAr: "اعتماد الإعلام — اليوم الوطني", requestedBy: "Media Office", status: "approved", eventId: E[2] },
    { title: "Gift procurement budget", titleAr: "ميزانية شراء الهدايا", requestedBy: "Logistics", status: "approved", eventId: E[0] },
    { title: "Overtime request — Security", titleAr: "طلب عمل إضافي — الأمن", requestedBy: "Security", status: "rejected", eventId: E[1] },
  ]);
  console.log("  + 5 approvals");

  /* ── Reports ─────────────────────────────────────────── */
  await db.insert(reportsTable).values([
    { name: "Weekly Readiness Report", nameAr: "تقرير الجاهزية الأسبوعي", type: "summary", format: "pdf" },
    { name: "France State Visit Briefing", nameAr: "إحاطة زيارة فرنسا الرسمية", type: "executive", format: "word", eventId: E[0] },
    { name: "Protocol Activity Log", nameAr: "سجل نشاط المراسم", type: "protocol", format: "excel" },
  ]);
  console.log("  + 3 reports");

  /* ── VIPs ────────────────────────────────────────────── */
  await db.insert(vipsTable).values([
    { name: "Emmanuel Laurent", nameAr: "إيمانويل لوران", title: "Head of State", titleAr: "رئيس دولة", country: "France", countryAr: "فرنسا", clearanceLevel: "high" },
    { name: "Abdullah Al-Saud", nameAr: "عبدالله آل سعود", title: "Foreign Minister", titleAr: "وزير خارجية", country: "Saudi Arabia", countryAr: "السعودية", clearanceLevel: "vip" },
    { name: "Kenji Tanaka", nameAr: "كينجي تاناكا", title: "Ambassador", titleAr: "سفير", country: "Japan", countryAr: "اليابان", clearanceLevel: "standard" },
    { name: "Klaus Weber", nameAr: "كلاوس فيبر", title: "Trade Envoy", titleAr: "مبعوث تجاري", country: "Germany", countryAr: "ألمانيا", clearanceLevel: "vip" },
  ]);
  console.log("  + 4 VIPs");

  /* ── Calendar ────────────────────────────────────────── */
  await db.insert(calendarEntriesTable).values([
    { title: "State Banquet — France", titleAr: "مأدبة رسمية — فرنسا", time: "18:00", date: day(5), type: "event", eventId: E[0], location: "Qasr Al Watan", locationAr: "قصر الوطن" },
    { title: "GCC Delegation Reception", titleAr: "استقبال وفد الخليج", time: "10:00", date: day(9), type: "event", eventId: E[1], location: "Presidential Palace", locationAr: "القصر الرئاسي" },
    { title: "Protocol Coordination", titleAr: "تنسيق المراسم", time: "11:00", date: day(2), type: "meeting", eventId: E[3] },
    { title: "Ambassador arrival — Japan", titleAr: "وصول السفير — اليابان", time: "10:00", date: day(14), type: "visit", eventId: E[4] },
    { title: "Security briefing", titleAr: "إحاطة أمنية", time: "09:00", date: day(4), type: "meeting" },
  ]);
  console.log("  + 5 calendar entries");

  console.log("✅ Seed complete.");
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await pool.end();
    process.exit(1);
  });
