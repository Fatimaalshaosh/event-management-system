/**
 * Demo seed for the Contact Directory.
 *
 *   DATABASE_URL=... pnpm --filter @workspace/scripts run seed:contacts
 *
 * Idempotent: truncates the contacts tables and reinserts a realistic UAE
 * protocol directory — internal officers, external participants, vendors,
 * government entities, VIP leaders, embassies and four delegations with members.
 * All personal names are fictional.
 */
import {
  db, pool,
  contactsTable, delegationsTable, delegationMembersTable,
  contactNotesTable, contactEventLinksTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

type C = typeof contactsTable.$inferInsert;

const ORG = "Presidential Protocol Department";
const ORG_AR = "دائرة المراسم الرئاسية";
let ext = 1009;

/** Build an internal/workflow user with sensible defaults. */
function iu(p: {
  nameEn: string; nameAr: string; gender: string; deptKey: string; deptEn: string; deptAr: string;
  jobTitle: string; jobTitleAr: string; role: string; roles: string; permission: string;
  approval: string; avail: string; cap: number; active: number; skills: string;
  resp: string; employeeType?: string; pinned?: boolean;
}): C {
  ext += 1;
  const slug = p.nameEn.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    type: "internal", status: "active", nameEn: p.nameEn, nameAr: p.nameAr, gender: p.gender,
    nationality: "United Arab Emirates", countryCode: "AE", preferredLanguage: "ar",
    department: p.deptEn, departmentKey: p.deptKey, organization: ORG, organizationAr: ORG_AR,
    jobTitle: p.jobTitle, jobTitleAr: p.jobTitleAr, roleInProtocol: p.role, classification: "internal",
    workflowRoles: p.roles, permissionLevel: p.permission, approvalAuthority: p.approval,
    availability: p.avail, taskCapacity: p.cap, activeTasks: p.active, skills: p.skills,
    extension: String(ext), employeeType: p.employeeType ?? "fulltime", eventResponsibilities: p.resp,
    email: `${slug}@psn.gov.ae`, mobile: `+9715${(ext * 73 % 9000000 + 1000000)}`,
    emiratesId: `784-19${80 + (ext % 15)}-${(ext * 131 % 9000000 + 1000000)}-${ext % 9}`,
    pinned: p.pinned ?? false,
  };
}

const internal: C[] = [
  // ── Department heads (one per department; names match org-structure.ts) ──
  iu({ nameEn: "Khalifa Al Mheiri", nameAr: "خليفة المهيري", gender: "male", deptKey: "chairmanOffice", deptEn: "Chairman Office", deptAr: "مكتب رئيس الهيئة", jobTitle: "Director, Chairman Office", jobTitleAr: "مدير مكتب رئيس الهيئة", role: "Executive Sponsor", roles: "executiveApprover,finalApprover,reportViewer", permission: "executive", approval: "Final executive sign-off", avail: "available", cap: 6, active: 2, skills: "Executive Governance,Protocol Strategy", resp: "Final executive visibility", pinned: true }),
  iu({ nameEn: "Mariam Al Suwaidi", nameAr: "مريم السويدي", gender: "female", deptKey: "secretaryGeneral", deptEn: "Secretary General Office", deptAr: "مكتب معالي الأمين", jobTitle: "Secretary General Office Director", jobTitleAr: "مديرة مكتب الأمين العام", role: "Executive Coordinator", roles: "sectorApprover,executiveApprover,reportViewer", permission: "executive", approval: "Sector & executive approval", avail: "available", cap: 6, active: 3, skills: "Coordination,Governance,Stakeholders", resp: "Executive coordination", pinned: true }),
  iu({ nameEn: "Layla Al Mansoori", nameAr: "ليلى المنصوري", gender: "female", deptKey: "protocol", deptEn: "Protocol & Ceremonies", deptAr: "المراسم - البروتوكول", jobTitle: "Director of Protocol", jobTitleAr: "مديرة المراسم", role: "Protocol Lead", roles: "protocolLead,eventOwner,taskOwner", permission: "approver", approval: "Protocol approval", avail: "busy", cap: 8, active: 6, skills: "Protocol,VIP Handling,Seating,Gifts", resp: "VIP reception, seating, gifts, protocol brief", pinned: true }),
  iu({ nameEn: "Saif Al Dhaheri", nameAr: "سيف الظاهري", gender: "male", deptKey: "operations", deptEn: "Operations", deptAr: "العمليات", jobTitle: "Operations Director", jobTitleAr: "مدير العمليات", role: "Operations Lead", roles: "operationsLead,securityCoordinator,taskOwner", permission: "approver", approval: "Operations approval", avail: "busy", cap: 8, active: 5, skills: "Live Operations,Security Coordination,Command Room", resp: "Live operations room" }),
  iu({ nameEn: "Noura Al Kaabi", nameAr: "نورة الكعبي", gender: "female", deptKey: "planning", deptEn: "Planning & Readiness", deptAr: "التخطيط والجاهزية", jobTitle: "Planning & Readiness Director", jobTitleAr: "مديرة التخطيط والجاهزية", role: "Planning Lead", roles: "planningLead,readinessLead,taskOwner", permission: "approver", approval: "Readiness sign-off", avail: "available", cap: 8, active: 6, skills: "Timeline,Risk,Readiness", resp: "Timeline, risks, readiness" }),
  iu({ nameEn: "Hamad Al Falasi", nameAr: "حمد الفلاسي", gender: "male", deptKey: "agenda", deptEn: "Agenda Management", deptAr: "الأجندة", jobTitle: "Agenda Manager", jobTitleAr: "مدير الأجندة", role: "Event Owner", roles: "eventOwner,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 6, active: 2, skills: "Scheduling,Meetings,Itineraries", resp: "Schedule and meetings" }),
  iu({ nameEn: "Ahmed Al Marri", nameAr: "أحمد المرّي", gender: "male", deptKey: "procurement", deptEn: "Procurement", deptAr: "المشتريات", jobTitle: "Procurement Manager", jobTitleAr: "مدير المشتريات", role: "Procurement Reviewer", roles: "procurementReviewer,taskOwner", permission: "approver", approval: "Procurement approval", avail: "available", cap: 6, active: 3, skills: "Vendors,Contracts,Sourcing", resp: "Vendors and contracts" }),
  iu({ nameEn: "Fatima Al Hosani", nameAr: "فاطمة الحوسني", gender: "female", deptKey: "finance", deptEn: "Finance", deptAr: "المالية", jobTitle: "Finance Manager", jobTitleAr: "مديرة المالية", role: "Finance Reviewer", roles: "financeReviewer,taskOwner", permission: "approver", approval: "Budget approval", avail: "available", cap: 6, active: 2, skills: "Budgeting,Payments,Compliance", resp: "Budget and payments" }),
  iu({ nameEn: "Yousef Al Blooshi", nameAr: "يوسف البلوشي", gender: "male", deptKey: "it", deptEn: "Information Technology", deptAr: "تقنية المعلومات", jobTitle: "IT Director", jobTitleAr: "مدير تقنية المعلومات", role: "IT Support Lead", roles: "itSupportLead,aiAdmin,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 8, active: 3, skills: "Systems,Networks,AV,AI Admin", resp: "Systems, QR, screens, support" }),
  iu({ nameEn: "Rashid Al Nuaimi", nameAr: "راشد النعيمي", gender: "male", deptKey: "logistics", deptEn: "Logistics", deptAr: "اللوجستك", jobTitle: "Logistics Director", jobTitleAr: "مدير اللوجستيات", role: "Logistics Lead", roles: "logisticsLead,flightCoordinator,hotelCoordinator,fleetCoordinator", permission: "approver", approval: "Logistics approval", avail: "busy", cap: 10, active: 5, skills: "Flights,Hotels,Fleet,Transport", resp: "Flights, hotels, transport" }),
  iu({ nameEn: "Salem Al Ameri", nameAr: "سالم العامري", gender: "male", deptKey: "generalServices", deptEn: "General Services", deptAr: "الخدمات العامة", jobTitle: "General Services Manager", jobTitleAr: "مدير الخدمات العامة", role: "Services Coordinator", roles: "taskOwner", permission: "editor", approval: "None", avail: "busy", cap: 8, active: 4, skills: "Venue,Catering,Setup", resp: "Venue, catering, setup" }),
  iu({ nameEn: "Hessa Al Qubaisi", nameAr: "حصة القبيسي", gender: "female", deptKey: "media", deptEn: "Media & Communications", deptAr: "الإعلام", jobTitle: "Media Director", jobTitleAr: "مديرة الإعلام", role: "Media Lead", roles: "mediaLead,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 6, active: 3, skills: "Coverage,Press,Photography", resp: "Coverage, press, photography" }),
  // ── Team members ──
  iu({ nameEn: "Saeed Al Ketbi", nameAr: "سعيد الكتبي", gender: "male", deptKey: "protocol", deptEn: "Protocol & Ceremonies", deptAr: "المراسم - البروتوكول", jobTitle: "Protocol Officer", jobTitleAr: "ضابط مراسم", role: "Task Owner", roles: "taskOwner", permission: "editor", approval: "None", avail: "available", cap: 6, active: 4, skills: "Protocol,Reception", resp: "Reception support" }),
  iu({ nameEn: "Fatima Al Zaabi", nameAr: "فاطمة الزعابي", gender: "female", deptKey: "operations", deptEn: "Operations", deptAr: "العمليات", jobTitle: "Security Coordinator", jobTitleAr: "منسقة الأمن", role: "Security Coordinator", roles: "securityCoordinator,taskOwner", permission: "editor", approval: "None", avail: "busy", cap: 6, active: 5, skills: "Security,Access Control", resp: "Security coordination" }),
  iu({ nameEn: "Khalid Al Nuaimi", nameAr: "خالد النعيمي", gender: "male", deptKey: "logistics", deptEn: "Logistics", deptAr: "اللوجستك", jobTitle: "Flight Coordinator", jobTitleAr: "منسق الرحلات", role: "Flight Coordinator", roles: "flightCoordinator,taskOwner", permission: "editor", approval: "None", avail: "busy", cap: 8, active: 6, skills: "Flights,Travel", resp: "Flight coordination" }),
  iu({ nameEn: "Mohammed Al Hammadi", nameAr: "محمد الحمادي", gender: "male", deptKey: "logistics", deptEn: "Logistics", deptAr: "اللوجستك", jobTitle: "Fleet Coordinator", jobTitleAr: "منسق الأسطول", role: "Fleet Coordinator", roles: "fleetCoordinator,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 8, active: 3, skills: "Fleet,Transport", resp: "Fleet coordination" }),
  iu({ nameEn: "Omar Al Shamsi", nameAr: "عمر الشامسي", gender: "male", deptKey: "planning", deptEn: "Planning & Readiness", deptAr: "التخطيط والجاهزية", jobTitle: "Senior Event Planner", jobTitleAr: "كبير منسقي الفعاليات", role: "Event Planner", roles: "eventOwner,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 8, active: 5, skills: "Planning,Coordination", resp: "Event planning" }),
  iu({ nameEn: "Aisha Al Hammadi", nameAr: "عائشة الحمادي", gender: "female", deptKey: "secretaryGeneral", deptEn: "Secretary General Office", deptAr: "مكتب معالي الأمين", jobTitle: "Executive Office Liaison", jobTitleAr: "حلقة وصل المكتب التنفيذي", role: "Executive Liaison", roles: "reportViewer,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 6, active: 2, skills: "Coordination,Reporting", resp: "Executive liaison" }),
  iu({ nameEn: "Ali Al Mazrouei", nameAr: "علي المزروعي", gender: "male", deptKey: "it", deptEn: "Information Technology", deptAr: "تقنية المعلومات", jobTitle: "AV & Systems Engineer", jobTitleAr: "مهندس أنظمة وصوتيات", role: "IT Support", roles: "itSupportLead,taskOwner", permission: "editor", approval: "None", avail: "available", cap: 8, active: 4, skills: "AV,Screens,QR,Support", resp: "AV and screens" }),
  iu({ nameEn: "Sara Al Shamsi", nameAr: "سارة الشامسي", gender: "female", deptKey: "media", deptEn: "Media & Communications", deptAr: "الإعلام", jobTitle: "Communications Officer", jobTitleAr: "أخصائية اتصال", role: "Task Owner", roles: "taskOwner", permission: "viewer", approval: "None", avail: "available", cap: 6, active: 2, skills: "Press,Social Media", resp: "Communications" }),
];

const external: C[] = [
  { type: "external", status: "active", nameEn: "Dr. Henri Laurent", nameAr: "د. هنري لوران", gender: "male", nationality: "France", countryCode: "FR", preferredLanguage: "en", jobTitle: "Keynote Speaker", jobTitleAr: "متحدث رئيسي", roleInProtocol: "Speaker", classification: "external", organization: "Sorbonne University", organizationAr: "جامعة السوربون", email: "h.laurent@sorbonne.fr", mobile: "+33612345678", whatsapp: "+33612345678", passportNumber: "FR-19X45872", dietaryRequirements: "Vegetarian" },
  { type: "external", status: "active", nameEn: "Maria Gonzalez", nameAr: "ماريا غونزاليس", gender: "female", nationality: "Spain", countryCode: "ES", jobTitle: "Cultural Attaché", jobTitleAr: "ملحقة ثقافية", roleInProtocol: "Guest", classification: "external", organization: "Instituto Cervantes", organizationAr: "معهد ثربانتس", email: "m.gonzalez@cervantes.es", mobile: "+34611223344", passportNumber: "ES-882211" },
  { type: "external", status: "active", nameEn: "James Whitfield", nameAr: "جيمس ويتفيلد", gender: "male", nationality: "United Kingdom", countryCode: "GB", jobTitle: "Senior Correspondent", jobTitleAr: "مراسل أول", roleInProtocol: "Media Representative", classification: "external", organization: "Global News Network", organizationAr: "شبكة الأخبار العالمية", email: "j.whitfield@gnn.com", mobile: "+447700900123", whatsapp: "+447700900123" },
  { type: "external", status: "pending", nameEn: "Yuki Tanaka", nameAr: "يوكي تاناكا", gender: "female", nationality: "Japan", countryCode: "JP", jobTitle: "Trade Advisor", jobTitleAr: "مستشارة تجارية", roleInProtocol: "Guest", classification: "external", organization: "JETRO", organizationAr: "منظمة التجارة الخارجية اليابانية", email: "y.tanaka@jetro.go.jp", mobile: "+81901234567", passportNumber: "JP-TK99812" },
];

const vendors: C[] = [
  { type: "vendor", status: "active", nameEn: "Gulf Premier Catering", nameAr: "الخليج الأول للضيافة", nationality: "United Arab Emirates", countryCode: "AE", jobTitle: "Catering & Hospitality", jobTitleAr: "الضيافة والتموين", roleInProtocol: "Service Provider", classification: "external", organization: "Gulf Premier Catering LLC", organizationAr: "الخليج الأول للضيافة ذ.م.م", email: "events@gulfpremier.ae", mobile: "+97125551212", officeNumber: "+97124445566" },
  { type: "vendor", status: "active", nameEn: "Falcon Executive Transport", nameAr: "الصقر للنقل التنفيذي", nationality: "United Arab Emirates", countryCode: "AE", jobTitle: "Fleet & Transport", jobTitleAr: "الأسطول والنقل", roleInProtocol: "Service Provider", classification: "external", organization: "Falcon Executive Transport LLC", organizationAr: "الصقر للنقل التنفيذي ذ.م.م", email: "ops@falcontransport.ae", mobile: "+97125553434" },
];

const government: C[] = [
  { type: "government", status: "active", nameEn: "Ministry of Foreign Affairs", nameAr: "وزارة الخارجية", nationality: "United Arab Emirates", countryCode: "AE", jobTitle: "Government Entity", jobTitleAr: "جهة حكومية", roleInProtocol: "Coordinating Entity", organization: "Ministry of Foreign Affairs", organizationAr: "وزارة الخارجية", email: "protocol@mofa.gov.ae", officeNumber: "+97124444000", pinned: true },
  { type: "government", status: "active", nameEn: "Abu Dhabi Police GHQ", nameAr: "قيادة شرطة أبوظبي", nationality: "United Arab Emirates", countryCode: "AE", jobTitle: "Security Entity", jobTitleAr: "جهة أمنية", roleInProtocol: "Security Coordination", organization: "Abu Dhabi Police", organizationAr: "شرطة أبوظبي", email: "vipsecurity@adpolice.gov.ae", officeNumber: "+97128009999" },
];

const vips: C[] = [
  { type: "vip", status: "vip", nameEn: "H.E. Jean Dupont", nameAr: "فخامة جان دوبون", gender: "male", nationality: "France", countryCode: "FR", preferredLanguage: "en", protocolTitle: "President of the French Republic", protocolTitleAr: "رئيس الجمهورية الفرنسية", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", securityClearance: "State — Highest", seatingPreference: "Head table, center", giftPreference: "Fine art / heritage pieces", culturalNotes: "Formal French protocol; address as ‘Monsieur le Président’.", dietaryRequirements: "No shellfish", classification: "external", organization: "Office of the President of France", organizationAr: "رئاسة الجمهورية الفرنسية", confidential: true, pinned: true },
  { type: "vip", status: "vip", nameEn: "H.E. Hiroshi Sato", nameAr: "معالي هيروشي ساتو", gender: "male", nationality: "Japan", countryCode: "JP", protocolTitle: "Prime Minister of Japan", protocolTitleAr: "رئيس وزراء اليابان", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", securityClearance: "State — Highest", seatingPreference: "Head table", giftPreference: "Calligraphy / traditional crafts", culturalNotes: "Bow on greeting; exchange business cards with both hands.", classification: "external", organization: "Office of the Prime Minister of Japan", organizationAr: "مكتب رئيس وزراء اليابان", pinned: true },
  { type: "vip", status: "confidential", nameEn: "H.R.H. Prince Faisal bin Abdullah", nameAr: "صاحب السمو الملكي الأمير فيصل بن عبدالله", gender: "male", nationality: "Saudi Arabia", countryCode: "SA", protocolTitle: "Senior Member of the Royal Family", protocolTitleAr: "أحد كبار أفراد العائلة المالكة", salutation: "Your Royal Highness", vipLevel: "headOfState", protocolRank: "1", securityClearance: "State — Highest", giftPreference: "Premium oud / heritage", culturalNotes: "Observe Gulf royal protocol; right-hand greeting.", classification: "external", organization: "Royal Court", organizationAr: "الديوان الملكي", confidential: true },
  { type: "vip", status: "vip", nameEn: "H.E. Li Wei", nameAr: "معالي لي وي", gender: "male", nationality: "China", countryCode: "CN", protocolTitle: "Premier of the State Council", protocolTitleAr: "رئيس مجلس الدولة", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", seatingPreference: "Head table", giftPreference: "Tea sets / fine porcelain", culturalNotes: "Formal address by full title; punctuality valued.", classification: "external", organization: "State Council of China", organizationAr: "مجلس الدولة الصيني" },
];

const embassies: C[] = [
  { type: "embassy", status: "active", nameEn: "Embassy of France", nameAr: "سفارة فرنسا", nationality: "France", countryCode: "FR", jobTitle: "Diplomatic Mission", jobTitleAr: "بعثة دبلوماسية", roleInProtocol: "Diplomatic Mission", organization: "Embassy of France in Abu Dhabi", organizationAr: "سفارة فرنسا في أبوظبي", email: "contact@ambafrance-ae.org", officeNumber: "+97124435100", pinned: true },
  { type: "embassy", status: "active", nameEn: "Embassy of Japan", nameAr: "سفارة اليابان", nationality: "Japan", countryCode: "JP", jobTitle: "Diplomatic Mission", jobTitleAr: "بعثة دبلوماسية", roleInProtocol: "Diplomatic Mission", organization: "Embassy of Japan in the UAE", organizationAr: "سفارة اليابان في الإمارات", email: "info@ah.mofa.go.jp", officeNumber: "+97124435696" },
  { type: "embassy", status: "active", nameEn: "Embassy of Saudi Arabia", nameAr: "سفارة المملكة العربية السعودية", nationality: "Saudi Arabia", countryCode: "SA", jobTitle: "Diplomatic Mission", jobTitleAr: "بعثة دبلوماسية", roleInProtocol: "Diplomatic Mission", organization: "Embassy of Saudi Arabia in the UAE", organizationAr: "سفارة السعودية في الإمارات", email: "uaeemb@mofa.gov.sa", officeNumber: "+97124445500" },
  { type: "embassy", status: "active", nameEn: "Embassy of the United States", nameAr: "سفارة الولايات المتحدة", nationality: "United States", countryCode: "US", jobTitle: "Diplomatic Mission", jobTitleAr: "بعثة دبلوماسية", roleInProtocol: "Diplomatic Mission", organization: "U.S. Embassy Abu Dhabi", organizationAr: "السفارة الأمريكية في أبوظبي", email: "abudhabiacs@state.gov", officeNumber: "+97124144000" },
];

/* ── Directory expansion — realistic government workforce ──────────────────
 * People (internal/external/vip) carry explicit gender + nationality so the
 * portrait system stays role/nationality-correct. Organizations (embassy /
 * government / vendor) carry NO gender and render their official icon. */
const DEPTS: Record<string, [string, string]> = {
  chairmanOffice: ["Chairman Office", "مكتب رئيس الهيئة"],
  secretaryGeneral: ["Secretary General Office", "مكتب معالي الأمين"],
  protocol: ["Protocol & Ceremonies", "المراسم - البروتوكول"],
  operations: ["Operations", "العمليات"],
  planning: ["Planning & Readiness", "التخطيط والجاهزية"],
  agenda: ["Agenda Management", "الأجندة"],
  procurement: ["Procurement", "المشتريات"],
  finance: ["Finance", "المالية"],
  it: ["Information Technology", "تقنية المعلومات"],
  logistics: ["Logistics", "اللوجستك"],
  generalServices: ["General Services", "الخدمات العامة"],
  media: ["Media & Communications", "الإعلام"],
};
const sl = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
let xc = 4100;
const mob = () => `+9715${(++xc * 67) % 9000000 + 1000000}`;

function m(nameEn: string, nameAr: string, gender: string, deptKey: string, jobTitle: string, jobTitleAr: string, avail = "available"): C {
  const [deptEn, deptAr] = DEPTS[deptKey];
  return iu({ nameEn, nameAr, gender, deptKey, deptEn, deptAr, jobTitle, jobTitleAr, role: "Task Owner", roles: "taskOwner", permission: "editor", approval: "None", avail, cap: 6, active: 2 + (xc % 5), skills: jobTitle, resp: jobTitle });
}
function emb(nameEn: string, nameAr: string, country: string, code: string): C {
  return { type: "embassy", status: "active", nameEn, nameAr, nationality: country, countryCode: code, jobTitle: "Diplomatic Mission", jobTitleAr: "بعثة دبلوماسية", roleInProtocol: "Diplomatic Mission", organization: `${nameEn} in Abu Dhabi`, organizationAr: `${nameAr} في أبوظبي`, email: `info.${code.toLowerCase()}@embassies.ae`, officeNumber: mob() };
}
function gov(nameEn: string, nameAr: string, kind = "Government Entity", kindAr = "جهة حكومية"): C {
  return { type: "government", status: "active", nameEn, nameAr, nationality: "United Arab Emirates", countryCode: "AE", jobTitle: kind, jobTitleAr: kindAr, roleInProtocol: "Coordinating Entity", organization: nameEn, organizationAr: nameAr, email: `protocol.${sl(nameEn)}@gov.ae`, officeNumber: mob() };
}
function ven(nameEn: string, nameAr: string, jobTitle: string, jobTitleAr: string): C {
  return { type: "vendor", status: "active", nameEn, nameAr, nationality: "United Arab Emirates", countryCode: "AE", jobTitle, jobTitleAr, roleInProtocol: "Service Provider", classification: "external", organization: nameEn, organizationAr: nameAr, email: `info.${sl(nameEn)}@vendors.ae`, mobile: mob() };
}
function extc(nameEn: string, nameAr: string, gender: string, country: string, code: string, jobTitle: string, jobTitleAr: string, org: string, orgAr: string, role = "Guest"): C {
  return { type: "external", status: "active", nameEn, nameAr, gender, nationality: country, countryCode: code, jobTitle, jobTitleAr, roleInProtocol: role, classification: "external", organization: org, organizationAr: orgAr, email: `${sl(nameEn)}@partners.org`, mobile: mob() };
}

const internalExtra: C[] = [
  // Executive leadership
  m("Sultan Al Nahyan", "سلطان آل نهيان", "male", "chairmanOffice", "Chairman", "رئيس الهيئة", "busy"),
  m("Abdulrahman Al Otaiba", "عبدالرحمن العتيبة", "male", "chairmanOffice", "Vice Chairman", "نائب رئيس الهيئة"),
  m("Maitha Al Romaithi", "ميثاء الرميثي", "female", "chairmanOffice", "Director General", "المدير العام"),
  m("Tariq Al Suwaidi", "طارق السويدي", "male", "chairmanOffice", "Executive Advisor", "مستشار تنفيذي"),
  m("Reem Al Hashimi", "ريم الهاشمي", "female", "secretaryGeneral", "Chief Strategy Officer", "رئيسة الاستراتيجية"),
  m("Khalfan Al Mazrouei", "خلفان المزروعي", "male", "protocol", "Chief Protocol Officer", "كبير ضباط المراسم"),
  // Protocol & guest relations
  m("Hamda Al Ali", "حمدة العلي", "female", "protocol", "Senior Protocol Officer", "ضابط مراسم أول"),
  m("Mansour Al Habsi", "منصور الحبسي", "male", "protocol", "Protocol Officer", "ضابط مراسم"),
  m("Shamma Al Dhaheri", "شما الظاهري", "female", "protocol", "VIP Coordinator", "منسقة كبار الشخصيات"),
  m("Salem Al Kaabi", "سالم الكعبي", "male", "protocol", "Ceremonies Coordinator", "منسق الاحتفالات"),
  m("Latifa Al Marri", "لطيفة المرّي", "female", "protocol", "International Relations Officer", "مسؤولة العلاقات الدولية"),
  m("Mira Al Suwaidi", "ميرة السويدي", "female", "protocol", "Guest Relations Officer", "مسؤولة علاقات الضيوف"),
  m("Maha Al Zaabi", "مها الزعابي", "female", "protocol", "Translator", "مترجمة"),
  m("Bilal Al Naqbi", "بلال النقبي", "male", "protocol", "Interpreter", "مترجم فوري"),
  // Media
  m("Jaber Al Falasi", "جابر الفلاسي", "male", "media", "Media Officer", "موظف إعلام"),
  m("Noora Al Shamsi", "نورة الشامسي", "female", "media", "Photographer", "مصورة"),
  // Operations & security
  m("Obaid Al Ketbi", "عبيد الكتبي", "male", "operations", "Operations Officer", "ضابط عمليات", "busy"),
  m("Hassan Al Dhaheri", "حسن الظاهري", "male", "operations", "Security Director", "مدير الأمن"),
  m("Majid Al Nuaimi", "ماجد النعيمي", "male", "operations", "Security Officer", "ضابط أمن", "busy"),
  // Logistics & transport
  m("Rashed Al Ameri", "راشد العامري", "male", "logistics", "Transportation Officer", "ضابط نقل"),
  m("Saif Al Blooshi", "سيف البلوشي", "male", "logistics", "Hotel Coordinator", "منسق الفنادق"),
  m("Khalid Al Hammadi", "خالد الحمادي", "male", "logistics", "Airport Reception Officer", "ضابط استقبال المطار"),
  m("Ahmed Al Zaabi", "أحمد الزعابي", "male", "logistics", "Driver", "سائق", "busy"),
  // Finance, legal, procurement, HR
  m("Wadeema Al Mansoori", "وضيمة المنصوري", "female", "finance", "Finance Officer", "موظفة مالية"),
  m("Abdulla Al Qubaisi", "عبدالله القبيسي", "male", "secretaryGeneral", "Legal Advisor", "مستشار قانوني"),
  m("Hind Al Marri", "هند المرّي", "female", "procurement", "Procurement Officer", "موظفة مشتريات"),
  m("Sultan Al Kaabi", "سلطان الكعبي", "male", "generalServices", "HR Director", "مدير الموارد البشرية"),
  m("Amna Al Hosani", "آمنة الحوسني", "female", "generalServices", "HR Officer", "موظفة موارد بشرية"),
  // Information technology
  m("Faisal Al Mazrouei", "فيصل المزروعي", "male", "it", "Applications Engineer", "مهندس تطبيقات"),
  m("Dana Al Suwaidi", "دانة السويدي", "female", "it", "AI Engineer", "مهندسة ذكاء اصطناعي"),
  m("Nasser Al Falasi", "ناصر الفلاسي", "male", "it", "System Administrator", "مدير أنظمة"),
  m("Hamad Al Ali", "حمد العلي", "male", "it", "Network Engineer", "مهندس شبكات"),
  m("Mohammed Al Tunaiji", "محمد الطنيجي", "male", "it", "Database Administrator", "مدير قواعد بيانات"),
  m("Salama Al Ketbi", "سلامة الكتبي", "female", "it", "Helpdesk Engineer", "مهندسة دعم فني"),
  // PMO / strategy / administration
  m("Moza Al Darmaki", "موزة الدرمكي", "female", "planning", "Project Manager", "مديرة مشاريع"),
  m("Saeed Al Romaithi", "سعيد الرميثي", "male", "planning", "PMO Officer", "موظف مكتب المشاريع"),
  m("Alia Al Hashimi", "علياء الهاشمي", "female", "planning", "Strategy Analyst", "محللة استراتيجية"),
  m("Maryam Al Blooshi", "مريم البلوشي", "female", "secretaryGeneral", "Executive Secretary", "سكرتيرة تنفيذية"),
  m("Hessa Al Nuaimi", "حصة النعيمي", "female", "generalServices", "Administrative Assistant", "مساعدة إدارية"),
];

const embassiesExtra: C[] = [
  emb("Embassy of the United Kingdom", "سفارة المملكة المتحدة", "United Kingdom", "GB"),
  emb("Embassy of Italy", "سفارة إيطاليا", "Italy", "IT"),
  emb("Embassy of Germany", "سفارة ألمانيا", "Germany", "DE"),
  emb("Embassy of Spain", "سفارة إسبانيا", "Spain", "ES"),
  emb("Embassy of China", "سفارة الصين", "China", "CN"),
  emb("Embassy of India", "سفارة الهند", "India", "IN"),
  emb("Embassy of Egypt", "سفارة مصر", "Egypt", "EG"),
  emb("Embassy of Bahrain", "سفارة البحرين", "Bahrain", "BH"),
  emb("Embassy of Oman", "سفارة عُمان", "Oman", "OM"),
  emb("Embassy of Qatar", "سفارة قطر", "Qatar", "QA"),
  emb("Embassy of Kuwait", "سفارة الكويت", "Kuwait", "KW"),
  emb("Embassy of Jordan", "سفارة الأردن", "Jordan", "JO"),
  emb("Embassy of Morocco", "سفارة المغرب", "Morocco", "MA"),
  emb("Embassy of South Korea", "سفارة كوريا الجنوبية", "South Korea", "KR"),
  emb("Embassy of Singapore", "سفارة سنغافورة", "Singapore", "SG"),
  emb("Embassy of Canada", "سفارة كندا", "Canada", "CA"),
  emb("Embassy of Australia", "سفارة أستراليا", "Australia", "AU"),
  emb("Embassy of Switzerland", "سفارة سويسرا", "Switzerland", "CH"),
];

const governmentExtra: C[] = [
  gov("Presidential Court", "رئاسة الدولة"),
  gov("Ministry of Interior", "وزارة الداخلية", "Security Entity", "جهة أمنية"),
  gov("Ministry of Defence", "وزارة الدفاع", "Security Entity", "جهة أمنية"),
  gov("Department of Culture & Tourism", "دائرة الثقافة والسياحة"),
  gov("Abu Dhabi Airports", "مطارات أبوظبي"),
  gov("General Civil Aviation Authority", "الهيئة العامة للطيران المدني"),
  gov("Department of Municipalities & Transport", "دائرة البلديات والنقل"),
  gov("Department of Health", "دائرة الصحة"),
  gov("National Emergency Crisis Authority", "الهيئة الوطنية لإدارة الطوارئ والأزمات"),
  gov("Ministry of Cabinet Affairs", "وزارة شؤون مجلس الوزراء"),
  gov("Abu Dhabi Executive Office", "مكتب أبوظبي التنفيذي"),
  gov("Federal Authority for Identity & Citizenship", "الهيئة الاتحادية للهوية والجنسية"),
  gov("Abu Dhabi Media Office", "مكتب أبوظبي الإعلامي", "Media Entity", "جهة إعلامية"),
];

const vendorsExtra: C[] = [
  ven("Emirates Palace Hospitality", "ضيافة قصر الإمارات", "Hotels & Venues", "الفنادق والمواقع"),
  ven("Shield Security Services", "خدمات شيلد الأمنية", "Security Contractor", "متعهد أمني"),
  ven("Vision AV Productions", "فيجن للإنتاج المرئي", "Audio Visual", "الصوتيات والمرئيات"),
  ven("LinguaPro Translation", "لينغوا برو للترجمة", "Translation Services", "خدمات الترجمة"),
  ven("Heritage Gifts House", "بيت الهدايا التراثية", "Protocol Gifts", "هدايا المراسم"),
  ven("Grand Stage Events", "غراند ستيج للفعاليات", "Event Production", "إنتاج الفعاليات"),
  ven("Royal Fleet Limousine", "ليموزين الأسطول الملكي", "Transportation", "النقل"),
  ven("Pearl Catering Co.", "اللؤلؤة للضيافة", "Catering", "التموين"),
  ven("Skyline Floral & Décor", "سكايلاين للزهور والديكور", "Floral & Décor", "الزهور والديكور"),
  ven("Capital Print & Branding", "العاصمة للطباعة والهوية", "Printing & Branding", "الطباعة والهوية"),
];

const externalExtra: C[] = [
  extc("Sophie Laurent", "صوفي لوران", "female", "France", "FR", "Media Representative", "ممثلة إعلامية", "Le Monde", "صحيفة لوموند", "Media Representative"),
  extc("David Cohen", "ديفيد كوهين", "male", "United States", "US", "Event Organizer", "منظم فعاليات", "Global Events Co.", "شركة الفعاليات العالمية", "Organizer"),
  extc("Chen Hao", "تشين هاو", "male", "China", "CN", "Trade Consultant", "مستشار تجاري", "Beijing Advisory", "بكين الاستشارية", "Consultant"),
  extc("Priya Nair", "بريا نائير", "female", "India", "IN", "Protocol Consultant", "مستشارة مراسم", "Global Protocol Partners", "شركاء المراسم العالمية", "Protocol Consultant"),
  extc("Hans Müller", "هانس مولر", "male", "Germany", "DE", "International Guest", "ضيف دولي", "Siemens AG", "شركة سيمنز", "Guest"),
  extc("Olivia Bennett", "أوليفيا بينيت", "female", "United Kingdom", "GB", "Senior Correspondent", "مراسلة أولى", "BBC", "هيئة الإذاعة البريطانية", "Media Representative"),
  extc("Kenji Watanabe", "كينجي واتانابي", "male", "Japan", "JP", "Official Delegate", "مندوب رسمي", "Keidanren", "اتحاد الأعمال الياباني", "Delegate"),
  extc("Carlos Mendez", "كارلوس منديز", "male", "Spain", "ES", "Cultural Consultant", "مستشار ثقافي", "Instituto Cervantes", "معهد ثربانتس", "Consultant"),
  extc("Lee Min-jun", "لي مين جون", "male", "South Korea", "KR", "Media Representative", "ممثل إعلامي", "Yonhap News", "وكالة يونهاب", "Media Representative"),
  extc("Ahmed Hassan", "أحمد حسن", "male", "Egypt", "EG", "Event Producer", "منتج فعاليات", "Cairo Productions", "إنتاج القاهرة", "Organizer"),
  extc("Isabella Conti", "إيزابيلا كونتي", "female", "Italy", "IT", "Protocol Consultant", "مستشارة مراسم", "Roma Protocol", "روما للمراسم", "Protocol Consultant"),
  extc("Mohammed Al Otaibi", "محمد العتيبي", "male", "Saudi Arabia", "SA", "Official Delegate", "مندوب رسمي", "GCC Secretariat", "الأمانة العامة لمجلس التعاون", "Delegate"),
  extc("Nadia Petrova", "ناديا بيتروفا", "female", "Russia", "RU", "International Guest", "ضيفة دولية", "Roscongress", "مؤسسة روسكونغرس", "Guest"),
  extc("Liam O'Brien", "ليام أوبراين", "male", "Canada", "CA", "Consultant", "مستشار", "Maple Advisory", "مايبل الاستشارية", "Consultant"),
];

const vipsExtra: C[] = [
  { type: "vip", status: "vip", nameEn: "Rt. Hon. Edward Hughes", nameAr: "معالي إدوارد هيوز", gender: "male", nationality: "United Kingdom", countryCode: "GB", preferredLanguage: "en", protocolTitle: "Prime Minister of the United Kingdom", protocolTitleAr: "رئيس وزراء المملكة المتحدة", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", classification: "external", organization: "Office of the Prime Minister", organizationAr: "مكتب رئيس الوزراء البريطاني" },
  { type: "vip", status: "vip", nameEn: "H.E. Rajesh Sharma", nameAr: "معالي راجيش شارما", gender: "male", nationality: "India", countryCode: "IN", protocolTitle: "Prime Minister of India", protocolTitleAr: "رئيس وزراء الهند", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", classification: "external", organization: "Prime Minister's Office of India", organizationAr: "مكتب رئيس وزراء الهند" },
  { type: "vip", status: "vip", nameEn: "H.E. Tarek Mansour", nameAr: "فخامة طارق منصور", gender: "male", nationality: "Egypt", countryCode: "EG", protocolTitle: "President of the Arab Republic of Egypt", protocolTitleAr: "رئيس جمهورية مصر العربية", salutation: "Your Excellency", vipLevel: "headOfState", protocolRank: "1", classification: "external", organization: "Presidency of Egypt", organizationAr: "رئاسة جمهورية مصر" },
  { type: "vip", status: "confidential", nameEn: "H.H. Sheikh Hamad Al Thani", nameAr: "سمو الشيخ حمد آل ثاني", gender: "male", nationality: "Qatar", countryCode: "QA", protocolTitle: "Member of the Ruling Family", protocolTitleAr: "أحد أفراد الأسرة الحاكمة", salutation: "Your Highness", vipLevel: "headOfState", protocolRank: "1", classification: "external", organization: "Amiri Diwan of Qatar", organizationAr: "الديوان الأميري القطري", confidential: true },
  { type: "vip", status: "vip", nameEn: "H.E. Maria Rossi", nameAr: "معالي ماريا روسي", gender: "female", nationality: "Italy", countryCode: "IT", protocolTitle: "Minister of Foreign Affairs of Italy", protocolTitleAr: "وزيرة خارجية إيطاليا", salutation: "Your Excellency", vipLevel: "minister", protocolRank: "2", classification: "external", organization: "Ministry of Foreign Affairs of Italy", organizationAr: "وزارة خارجية إيطاليا" },
  { type: "vip", status: "vip", nameEn: "H.E. Aisha Al Otaibi", nameAr: "معالي عائشة العتيبي", gender: "female", nationality: "Saudi Arabia", countryCode: "SA", protocolTitle: "Special Envoy", protocolTitleAr: "مبعوثة خاصة", salutation: "Your Excellency", vipLevel: "ambassador", protocolRank: "3", classification: "external", organization: "Royal Court", organizationAr: "الديوان الملكي" },
];

async function main() {
  console.log("Clearing contact directory…");
  await db.execute(sql`TRUNCATE TABLE
    contact_notes, contact_event_links, contact_documents,
    delegation_members, delegations, contacts
    RESTART IDENTITY CASCADE`);

  console.log("Seeding contacts…");
  const inserted = await db
    .insert(contactsTable)
    .values([
      ...internal, ...internalExtra,
      ...external, ...externalExtra,
      ...vendors, ...vendorsExtra,
      ...government, ...governmentExtra,
      ...vips, ...vipsExtra,
      ...embassies, ...embassiesExtra,
    ])
    .returning({ id: contactsTable.id, nameEn: contactsTable.nameEn, type: contactsTable.type });

  const byName = (n: string) => inserted.find((c) => c.nameEn === n);
  const dupont = byName("H.E. Jean Dupont");
  const sato = byName("H.E. Hiroshi Sato");
  const faisal = byName("H.R.H. Prince Faisal bin Abdullah");
  const liwei = byName("H.E. Li Wei");

  console.log("Seeding delegations…");
  const dels = await db.insert(delegationsTable).values([
    { name: "French Presidential Delegation", nameAr: "الوفد الرئاسي الفرنسي", countryCode: "FR", country: "France", countryAr: "فرنسا", headContactId: dupont?.id, headName: "H.E. Jean Dupont", headNameAr: "فخامة جان دوبون", eventId: 1, readinessStatus: "inProgress", status: "active", protocolNotes: "State visit including official banquet and bilateral talks.", protocolNotesAr: "زيارة دولة تتضمن مأدبة رسمية ومباحثات ثنائية." },
    { name: "Japanese Prime Minister Delegation", nameAr: "وفد رئيس وزراء اليابان", countryCode: "JP", country: "Japan", countryAr: "اليابان", headContactId: sato?.id, headName: "H.E. Hiroshi Sato", headNameAr: "معالي هيروشي ساتو", readinessStatus: "planning", status: "active", protocolNotes: "Economic cooperation visit.", protocolNotesAr: "زيارة تعاون اقتصادي." },
    { name: "Saudi Royal Delegation", nameAr: "الوفد الملكي السعودي", countryCode: "SA", country: "Saudi Arabia", countryAr: "المملكة العربية السعودية", headContactId: faisal?.id, headName: "H.R.H. Prince Faisal bin Abdullah", headNameAr: "صاحب السمو الملكي الأمير فيصل بن عبدالله", eventId: 2, readinessStatus: "ready", status: "active", protocolNotes: "GCC summit delegation reception.", protocolNotesAr: "استقبال وفد القمة الخليجية." },
    { name: "Chinese Trade Delegation", nameAr: "الوفد التجاري الصيني", countryCode: "CN", country: "China", countryAr: "الصين", headContactId: liwei?.id, headName: "H.E. Li Wei", headNameAr: "معالي لي وي", readinessStatus: "planning", status: "active", protocolNotes: "Trade and investment forum.", protocolNotesAr: "منتدى التجارة والاستثمار." },
  ]).returning({ id: delegationsTable.id, name: delegationsTable.name });

  const del = (n: string) => dels.find((d) => d.name === n)!.id;

  await db.insert(delegationMembersTable).values([
    { delegationId: del("French Presidential Delegation"), contactId: dupont?.id, name: "H.E. Jean Dupont", nameAr: "فخامة جان دوبون", role: "Head of Delegation", roleAr: "رئيس الوفد", isHead: true },
    { delegationId: del("French Presidential Delegation"), name: "Claire Moreau", nameAr: "كلير مورو", role: "Foreign Affairs Advisor", roleAr: "مستشارة الشؤون الخارجية" },
    { delegationId: del("French Presidential Delegation"), name: "Antoine Bernard", nameAr: "أنطوان برنار", role: "Chief of Staff", roleAr: "رئيس الديوان" },
    { delegationId: del("Japanese Prime Minister Delegation"), contactId: sato?.id, name: "H.E. Hiroshi Sato", nameAr: "معالي هيروشي ساتو", role: "Head of Delegation", roleAr: "رئيس الوفد", isHead: true },
    { delegationId: del("Japanese Prime Minister Delegation"), name: "Kenji Yamamoto", nameAr: "كينجي ياماموتو", role: "Trade Minister", roleAr: "وزير التجارة" },
    { delegationId: del("Saudi Royal Delegation"), contactId: faisal?.id, name: "H.R.H. Prince Faisal bin Abdullah", nameAr: "صاحب السمو الملكي الأمير فيصل بن عبدالله", role: "Head of Delegation", roleAr: "رئيس الوفد", isHead: true },
    { delegationId: del("Saudi Royal Delegation"), name: "Abdulaziz Al Saud", nameAr: "عبدالعزيز آل سعود", role: "Royal Advisor", roleAr: "مستشار ملكي" },
    { delegationId: del("Chinese Trade Delegation"), contactId: liwei?.id, name: "H.E. Li Wei", nameAr: "معالي لي وي", role: "Head of Delegation", roleAr: "رئيس الوفد", isHead: true },
    { delegationId: del("Chinese Trade Delegation"), name: "Zhang Min", nameAr: "تشانغ مين", role: "Commerce Secretary", roleAr: "سكرتير التجارة" },
  ]);

  console.log("Seeding notes & event links…");
  if (dupont) {
    await db.insert(contactNotesTable).values([
      { contactId: dupont.id, body: "Prefers bilateral session before the banquet. Interpreter (FR↔AR) required.", author: "Layla Al Mansoori" },
    ]);
    await db.insert(contactEventLinksTable).values([
      { contactId: dupont.id, eventId: 1, role: "vip", rsvpStatus: "accepted" },
    ]);
  }

  console.log(`Seeded ${inserted.length} contacts, ${dels.length} delegations.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
