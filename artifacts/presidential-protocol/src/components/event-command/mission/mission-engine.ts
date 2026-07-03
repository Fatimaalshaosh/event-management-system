import { parseRoles } from "@/components/contacts/org-structure";
import type { Contact } from "@workspace/api-client-react";

/**
 * Mission assignment intelligence (deterministic — no external AI call). Scores
 * departments and employees against a mission's category/title, and expands a
 * mission into a default set of subtasks. Reason keys map to i18n
 * (`mission.reason*`); department/role/responsibility labels reuse the existing
 * `contacts.*` keys.
 */

export interface DeptRec { deptKey: string; score: number } // score 1..5

const CATEGORY_WEIGHTS: Record<string, Record<string, number>> = {
  protocol:  { protocol: 5, logistics: 4, operations: 3, media: 3, it: 2 },
  logistics: { logistics: 5, operations: 4, generalServices: 3, procurement: 3, finance: 2 },
  security:  { operations: 5, protocol: 3, it: 3, generalServices: 2 },
  media:     { media: 5, it: 3, protocol: 2, generalServices: 2 },
  planning:  { planning: 5, operations: 4, agenda: 3, finance: 2, it: 2 },
};

const KEYWORDS: { re: RegExp; dept: string; boost: number }[] = [
  { re: /vip|reception|seat|gift|protocol|استقبال|جلوس|هدايا|مراسم/i, dept: "protocol", boost: 2 },
  { re: /flight|hotel|transport|fleet|travel|طيران|فندق|نقل|أسطول/i, dept: "logistics", boost: 2 },
  { re: /security|access|أمن/i, dept: "operations", boost: 2 },
  { re: /press|media|photo|coverage|إعلام|تغطية|صحاف/i, dept: "media", boost: 2 },
  { re: /budget|payment|ميزاني|مدفوع|مالي/i, dept: "finance", boost: 2 },
  { re: /vendor|contract|procure|مورد|عقد|مشتري/i, dept: "procurement", boost: 2 },
  { re: /screen|qr|system|av\b|تقني|نظام|شاش/i, dept: "it", boost: 2 },
  { re: /schedule|meeting|agenda|جدول|اجتماع|أجندة/i, dept: "agenda", boost: 2 },
  { re: /venue|catering|setup|مكان|ضياف|تجهيز/i, dept: "generalServices", boost: 2 },
  { re: /timeline|risk|readiness|زمني|مخاطر|جاهز/i, dept: "planning", boost: 2 },
];

export function recommendDepartments(category: string, ...titles: string[]): DeptRec[] {
  const text = titles.filter(Boolean).join(" ");
  const scores: Record<string, number> = {};
  for (const [d, w] of Object.entries(CATEGORY_WEIGHTS[category] ?? {})) scores[d] = (scores[d] ?? 0) + w;
  for (const k of KEYWORDS) if (k.re.test(text)) scores[k.dept] = (scores[k.dept] ?? 0) + k.boost;
  return Object.entries(scores)
    .map(([deptKey, raw]) => ({ deptKey, score: Math.max(1, Math.min(5, Math.round(raw))) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export interface EmpScore { score: number; reasons: string[] }

const ROLE_FOR_CATEGORY: Record<string, string[]> = {
  protocol: ["protocolLead", "eventOwner"],
  logistics: ["logisticsLead", "flightCoordinator", "hotelCoordinator", "fleetCoordinator"],
  security: ["securityCoordinator", "operationsLead"],
  media: ["mediaLead"],
  planning: ["planningLead", "readinessLead", "eventOwner"],
};

export function scoreEmployee(u: Contact, category: string): EmpScore {
  const reasons: string[] = [];
  let s = 0;
  if (u.availability === "available") { s += 3; reasons.push("reasonAvailable"); }
  else if (u.availability === "busy") { reasons.push("reasonBusy"); }
  else if (u.availability === "leave") { s -= 5; }
  const cap = u.taskCapacity ?? 0, act = u.activeTasks ?? 0;
  if (cap > 0) {
    const free = (cap - act) / cap;
    s += free * 3;
    if (free > 0.4) reasons.push("reasonLowLoad");
  }
  const roles = parseRoles(u.workflowRoles);
  if ((ROLE_FOR_CATEGORY[category] ?? []).some((r) => roles.includes(r))) { s += 2; reasons.push("reasonRole"); }
  return { score: s, reasons };
}

export function bestEmployee(users: Contact[], category: string): Contact | null {
  let best: Contact | null = null, bestScore = -Infinity;
  for (const u of users) {
    const { score } = scoreEmployee(u, category);
    if (score > bestScore) { bestScore = score; best = u; }
  }
  return best;
}

export interface SubtaskTpl { en: string; ar: string }

const SUBTASKS: Record<string, SubtaskTpl[]> = {
  protocol: [
    { en: "Prepare arrival protocol", ar: "إعداد بروتوكول الوصول" },
    { en: "Confirm seating plan", ar: "تأكيد مخطط الجلوس" },
    { en: "Prepare gifts", ar: "تجهيز الهدايا" },
    { en: "Protocol brief", ar: "الإحاطة البروتوكولية" },
    { en: "Media coordination", ar: "التنسيق الإعلامي" },
  ],
  logistics: [
    { en: "Confirm flights", ar: "تأكيد الرحلات" },
    { en: "Confirm hotels", ar: "تأكيد الفنادق" },
    { en: "Arrange transport", ar: "ترتيب النقل" },
    { en: "Fleet coordination", ar: "تنسيق الأسطول" },
  ],
  security: [
    { en: "Coordinate security", ar: "تنسيق الأمن" },
    { en: "Access control plan", ar: "خطة التحكم بالدخول" },
    { en: "Secure the route", ar: "تأمين المسار" },
  ],
  media: [
    { en: "Press coverage plan", ar: "خطة التغطية الصحفية" },
    { en: "Photography & video", ar: "التصوير والفيديو" },
    { en: "Social media", ar: "التواصل الاجتماعي" },
  ],
  planning: [
    { en: "Build the timeline", ar: "بناء الجدول الزمني" },
    { en: "Risk assessment", ar: "تقييم المخاطر" },
    { en: "Readiness check", ar: "فحص الجاهزية" },
    { en: "Confirm the agenda", ar: "تأكيد الأجندة" },
  ],
};

export function generateSubtasks(category: string): SubtaskTpl[] {
  return SUBTASKS[category] ?? SUBTASKS.planning;
}
