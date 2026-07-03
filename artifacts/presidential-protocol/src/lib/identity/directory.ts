/* Executive Employee Directory — ~90 realistic government employees.
 *
 * Deterministically generated once at module load from curated bilingual name
 * pools and per-department role templates. Each person is a stable identity
 * (consistent portrait/presence/manager) reused everywhere. Real backend
 * employee records can replace this array without changing any UI. */

import { DEPARTMENTS } from "@/components/contacts/org-structure";
import { buildPortraitIdentity } from "./portrait-identity";
import type { Attire, EthnicityPreset, Gender, IdentityInput, Presence, PortraitStyle } from "./types";

export interface Employee extends IdentityInput {
  id: string;
  gender: Gender;
  department: string;
  division: string;
  divisionAr: string;
  managerId: string | null;
  level: string;
  levelAr: string;
  languages: string[];
  bio: string;
  bioAr: string;
  skills: string[];
  expertise: string[];
  currentMission: string | null;
  previousMissions: number;
  // Explicit portrait identity (role/nationality-correct, not name-inferred).
  nationalityLabel: string;
  attire: Attire;
  portraitStyle: PortraitStyle;
  ethnicityPreset: EthnicityPreset;
}

/* curated bilingual Emirati name pools (en, ar) */
const MALE: [string, string][] = [
  ["Khalifa", "خليفة"], ["Saif", "سيف"], ["Hamad", "حمد"], ["Ahmed", "أحمد"], ["Yousef", "يوسف"],
  ["Rashid", "راشد"], ["Salem", "سالم"], ["Sultan", "سلطان"], ["Majid", "ماجد"], ["Obaid", "عبيد"],
  ["Khalid", "خالد"], ["Tariq", "طارق"], ["Faisal", "فيصل"], ["Omar", "عمر"], ["Nasser", "ناصر"],
  ["Mohammed", "محمد"], ["Abdulla", "عبدالله"], ["Hassan", "حسن"], ["Mansour", "منصور"], ["Zayed", "زايد"],
];
const FEMALE: [string, string][] = [
  ["Mariam", "مريم"], ["Layla", "ليلى"], ["Noura", "نورة"], ["Fatima", "فاطمة"], ["Hessa", "حصة"],
  ["Aisha", "عائشة"], ["Shamma", "شما"], ["Reem", "ريم"], ["Maitha", "ميثاء"], ["Latifa", "لطيفة"],
  ["Moza", "موزة"], ["Salama", "سلامة"], ["Wadeema", "وضيمة"], ["Amna", "آمنة"], ["Sara", "سارة"],
  ["Alia", "علياء"], ["Dana", "دانة"], ["Shaikha", "شيخة"],
];
const FAMILY: [string, string][] = [
  ["Al Mheiri", "المهيري"], ["Al Suwaidi", "السويدي"], ["Al Mansoori", "المنصوري"], ["Al Dhaheri", "الظاهري"],
  ["Al Kaabi", "الكعبي"], ["Al Falasi", "الفلاسي"], ["Al Marri", "المرّي"], ["Al Hosani", "الحوسني"],
  ["Al Blooshi", "البلوشي"], ["Al Nuaimi", "النعيمي"], ["Al Ameri", "العامري"], ["Al Qubaisi", "القبيسي"],
  ["Al Shamsi", "الشامسي"], ["Al Zaabi", "الزعابي"], ["Al Mazrouei", "المزروعي"], ["Al Romaithi", "الرميثي"],
  ["Al Ketbi", "الكتبي"], ["Al Hammadi", "الحمادي"], ["Al Tunaiji", "الطنيجي"], ["Al Darmaki", "الدرمكي"],
];

const LEVELS: [string, string][] = [
  ["Executive Director", "مدير تنفيذي"], ["Director", "مدير"], ["Senior Manager", "مدير أول"],
  ["Manager", "مدير"], ["Senior Specialist", "أخصائي أول"], ["Specialist", "أخصائي"],
  ["Officer", "موظف"], ["Coordinator", "منسّق"],
];
const PRESENCES: Presence[] = ["available", "busy", "meeting", "available", "busy", "offline", "leave", "available", "meeting"];

/* per-department role + division pools */
const ROLES: Record<string, { en: string; ar: string }[]> = {
  chairmanOffice: [{ en: "Chief of Staff", ar: "رئيس الديوان" }, { en: "Executive Advisor", ar: "مستشار تنفيذي" }, { en: "Executive Assistant", ar: "مساعد تنفيذي" }],
  secretaryGeneral: [{ en: "Deputy Secretary General", ar: "نائب الأمين العام" }, { en: "Governance Advisor", ar: "مستشار الحوكمة" }, { en: "Board Coordinator", ar: "منسّق المجلس" }],
  protocol: [{ en: "Protocol Officer", ar: "موظف مراسم" }, { en: "VIP Coordinator", ar: "منسّق كبار الشخصيات" }, { en: "Ceremonies Lead", ar: "قائد المراسم" }, { en: "Hospitality Officer", ar: "موظف ضيافة" }],
  operations: [{ en: "Operations Officer", ar: "موظف عمليات" }, { en: "Security Coordinator", ar: "منسّق أمني" }, { en: "Live Ops Lead", ar: "قائد العمليات الحية" }, { en: "Field Supervisor", ar: "مشرف ميداني" }],
  planning: [{ en: "Planning Officer", ar: "موظف تخطيط" }, { en: "Readiness Analyst", ar: "محلل جاهزية" }, { en: "Risk Specialist", ar: "أخصائي مخاطر" }],
  agenda: [{ en: "Agenda Officer", ar: "موظف أجندة" }, { en: "Scheduling Specialist", ar: "أخصائي جدولة" }, { en: "Meetings Coordinator", ar: "منسّق اجتماعات" }],
  procurement: [{ en: "Procurement Officer", ar: "موظف مشتريات" }, { en: "Contracts Specialist", ar: "أخصائي عقود" }, { en: "Vendor Coordinator", ar: "منسّق موردين" }],
  finance: [{ en: "Finance Officer", ar: "موظف مالية" }, { en: "Budget Analyst", ar: "محلل ميزانية" }, { en: "Payments Specialist", ar: "أخصائي مدفوعات" }],
  it: [{ en: "IT Officer", ar: "موظف تقنية" }, { en: "Systems Engineer", ar: "مهندس أنظمة" }, { en: "AI Administrator", ar: "مدير الذكاء الاصطناعي" }, { en: "Support Specialist", ar: "أخصائي دعم" }],
  logistics: [{ en: "Logistics Officer", ar: "موظف لوجستيات" }, { en: "Flight Coordinator", ar: "منسّق رحلات" }, { en: "Hotel Coordinator", ar: "منسّق فنادق" }, { en: "Fleet Coordinator", ar: "منسّق أسطول" }, { en: "Driver", ar: "سائق" }],
  generalServices: [{ en: "Services Officer", ar: "موظف خدمات" }, { en: "Venue Coordinator", ar: "منسّق مواقع" }, { en: "Catering Supervisor", ar: "مشرف ضيافة" }],
  media: [{ en: "Media Officer", ar: "موظف إعلام" }, { en: "Communications Specialist", ar: "أخصائي اتصال" }, { en: "Press Coordinator", ar: "منسّق صحافة" }, { en: "Broadcast Officer", ar: "موظف بث" }],
};
const DIVISIONS: Record<string, [string, string]> = {
  chairmanOffice: ["Executive Office", "المكتب التنفيذي"], secretaryGeneral: ["Governance", "الحوكمة"],
  protocol: ["Protocol & Ceremonies", "المراسم والاحتفالات"], operations: ["Operations Center", "مركز العمليات"],
  planning: ["Strategy & Planning", "الاستراتيجية والتخطيط"], agenda: ["Scheduling", "الجدولة"],
  procurement: ["Contracts & Vendors", "العقود والموردين"], finance: ["Budget & Payments", "الميزانية والمدفوعات"],
  it: ["Digital Operations", "العمليات الرقمية"], logistics: ["Travel & Transport", "السفر والنقل"],
  generalServices: ["Venue & Catering", "المواقع والضيافة"], media: ["Communications", "الاتصال"],
};
const SKILLS: Record<string, string[]> = {
  chairmanOffice: ["Governance", "Executive Briefing", "Stakeholder Management"], secretaryGeneral: ["Board Governance", "Policy", "Coordination"],
  protocol: ["Protocol", "VIP Hospitality", "Seating & Gifts", "Diplomatic Etiquette"], operations: ["Live Operations", "Security", "Field Command"],
  planning: ["Readiness", "Risk Management", "Timeline Planning"], agenda: ["Scheduling", "Coordination", "Logistics"],
  procurement: ["Contracts", "Negotiation", "Vendor Management"], finance: ["Budgeting", "Payments", "Financial Control"],
  it: ["Systems", "Cybersecurity", "AI Operations", "Support"], logistics: ["Travel", "Fleet", "Aviation", "Hospitality"],
  generalServices: ["Venue Management", "Catering", "Facilities"], media: ["Media Relations", "Communications", "Broadcast", "Press"],
};

const ascii = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const head = (k: string) => DEPARTMENTS.find((d) => d.key === k);
const HEAD_GENDER: Record<string, Gender> = {
  chairmanOffice: "male", secretaryGeneral: "female", protocol: "female", operations: "male",
  planning: "female", agenda: "male", procurement: "male", finance: "female", it: "male",
  logistics: "male", generalServices: "male", media: "female",
};
const COUNT: Record<string, number> = {
  chairmanOffice: 4, secretaryGeneral: 5, protocol: 10, operations: 9, planning: 8, agenda: 6,
  procurement: 6, finance: 6, it: 8, logistics: 10, generalServices: 8, media: 8,
};

function build(): Employee[] {
  const out: Employee[] = [];
  let mi = 0, fi = 0, fam = 0, seq = 0;
  const nextName = (g: Gender): [string, string] => {
    const first = g === "male" ? MALE[mi++ % MALE.length] : FEMALE[fi++ % FEMALE.length];
    const family = FAMILY[fam++ % FAMILY.length];
    return [`${first[0]} ${family[0]}`, `${first[1]} ${family[1]}`];
  };

  DEPARTMENTS.forEach((dept, di) => {
    const k = dept.key;
    const roles = ROLES[k] ?? [{ en: "Officer", ar: "موظف" }];
    const div = DIVISIONS[k] ?? ["", ""];
    const n = COUNT[k] ?? 6;
    const chairId = "EMP-001";
    const sgId = "EMP-005";
    for (let i = 0; i < n; i++) {
      seq += 1;
      const id = `EMP-${String(seq).padStart(3, "0")}`;
      const isHead = i === 0;
      const g: Gender = isHead ? (HEAD_GENDER[k] ?? "male") : (seq % 3 === 0 ? "female" : "male");
      const h = head(k);
      let name: string, nameAr: string;
      if (isHead && h) { name = h.headEn; nameAr = h.headAr; }
      else { const nm = nextName(g); name = nm[0]; nameAr = nm[1]; }
      const role = isHead ? { en: `Director, ${div[0]}`, ar: `مدير ${div[1]}` } : roles[(i - 1) % roles.length];
      const lvl = isHead ? LEVELS[1] : LEVELS[3 + (i % 5)];
      const [fn] = name.split(" ");
      const familyAscii = ascii(name.split(" ").slice(1).join(""));
      const managerId = isHead
        ? (k === "chairmanOffice" ? null : k === "secretaryGeneral" ? chairId : sgId)
        : `EMP-${String(seq - i).padStart(3, "0")}`;
      const pid = buildPortraitIdentity({ gender: g, nationality: "AE", department: k, role: role.en });
      out.push({
        id, name, nameAr, gender: g, nationality: "AE", department: k,
        nationalityLabel: pid.nationality, attire: pid.attire, portraitStyle: pid.portraitStyle, ethnicityPreset: pid.ethnicityPreset,
        role: role.en, roleAr: role.ar, division: div[0], divisionAr: div[1],
        managerId, level: lvl[0], levelAr: lvl[1],
        email: `${ascii(fn)}.${familyAscii}@psn.gov.ae`,
        phone: `+971 2 555 ${String(1000 + seq)}`,
        office: `${div[0]} · Floor ${di + 2}`,
        languages: g === "female" && seq % 4 === 0 ? ["Arabic", "English", "French"] : seq % 5 === 0 ? ["Arabic", "English", "Urdu"] : ["Arabic", "English"],
        presence: PRESENCES[seq % PRESENCES.length],
        bio: `${isHead ? "Leads" : "Serves in"} the ${div[0]} division${isHead ? "" : ` as ${role.en}`}, supporting presidential protocol operations and high-level state visits.`,
        bioAr: `${isHead ? "يقود" : "يعمل في"} قسم ${div[1]}${isHead ? "" : ` بصفة ${role.ar}`}، لدعم عمليات المراسم الرئاسية والزيارات الرسمية رفيعة المستوى.`,
        skills: SKILLS[k] ?? ["Coordination"],
        expertise: (SKILLS[k] ?? ["Coordination"]).slice(0, 2),
        currentMission: seq % 2 === 0 ? "State Banquet for the President of France" : null,
        previousMissions: 4 + (seq % 11),
        tasks: 1 + (seq % 7),
        nextMeeting: seq % 3 === 0 ? "14:00 · Mission Sync" : undefined,
      });
    }
  });
  return out;
}

export const EMPLOYEES: Employee[] = build();

const BY_ID = new Map(EMPLOYEES.map((e) => [e.id, e]));
const BY_DEPT = EMPLOYEES.reduce<Record<string, Employee[]>>((acc, e) => {
  (acc[e.department] ??= []).push(e); return acc;
}, {});
const BY_NAME = new Map(EMPLOYEES.map((e) => [e.name.toLowerCase(), e]));

export const getEmployee = (id: string) => BY_ID.get(id);
export const employeesByDept = (dept: string) => BY_DEPT[dept] ?? [];
export const departmentHead = (dept: string): Employee | undefined => (BY_DEPT[dept] ?? [])[0];
export const employeeByName = (name: string) => BY_NAME.get(name.toLowerCase());
export const allEmployees = () => EMPLOYEES;
