import type { DeptKey } from "@/components/contacts/org-structure";
import type { Blueprint, OperationalRelationship } from "./types";

/** Canonical inter-department operational dependencies (demo). Filtered to the
 * departments actually present in the mission blueprint. */
const CANON: Omit<OperationalRelationship, "id">[] = [
  {
    source: "protocol", target: "media", type: "must_finish_before",
    reason: { en: "Official titles must be approved before any media statement", ar: "يجب اعتماد الألقاب الرسمية قبل أي بيان إعلامي" },
    status: "blocked", risk: "high", blocking: true, readinessImpact: 8,
  },
  {
    source: "agenda", target: "logistics", type: "provides_input_to",
    reason: { en: "Confirmed arrival time drives the fleet & transport plan", ar: "وقت الوصول المؤكد يحدد خطة الأسطول والنقل" },
    status: "blocked", risk: "high", blocking: true, readinessImpact: 7,
  },
  {
    source: "protocol", target: "operations", type: "provides_input_to",
    reason: { en: "Guest list & precedence feed security clearance & movement", ar: "قائمة الضيوف والأسبقية تغذّي التصاريح الأمنية وخطة الحركة" },
    status: "atRisk", risk: "medium", blocking: true, readinessImpact: 6,
  },
  {
    source: "procurement", target: "finance", type: "depends_on",
    reason: { en: "Budget approval is required before procurement proceeds", ar: "اعتماد الميزانية مطلوب قبل بدء المشتريات" },
    status: "open", risk: "low", blocking: false, readinessImpact: 4,
  },
  {
    source: "finance", target: "procurement", type: "validates",
    reason: { en: "Finance validates payment after procurement confirmation", ar: "المالية تعتمد الدفع بعد تأكيد المشتريات" },
    status: "open", risk: "low", blocking: false, readinessImpact: 3,
  },
  {
    source: "chairmanOffice", target: "agenda", type: "requires_approval_from",
    reason: { en: "Executive office must approve the official program", ar: "يجب أن يعتمد المكتب التنفيذي البرنامج الرسمي" },
    status: "open", risk: "medium", blocking: false, readinessImpact: 5,
  },
  {
    source: "protocol", target: "generalServices", type: "provides_input_to",
    reason: { en: "Seating order drives venue & majlis setup", ar: "ترتيب الجلوس يحدد تجهيز المكان والمجلس" },
    status: "open", risk: "low", blocking: false, readinessImpact: 3,
  },
  {
    source: "logistics", target: "operations", type: "informs",
    reason: { en: "Transport plan informs the movement & escort plan", ar: "خطة النقل تُعلِم خطة الحركة والمرافقة" },
    status: "open", risk: "low", blocking: false, readinessImpact: 3,
  },
  {
    source: "it", target: "operations", type: "provides_input_to",
    reason: { en: "Check-in & screens support the live operations room", ar: "تسجيل الدخول والشاشات تدعم غرفة العمليات" },
    status: "open", risk: "low", blocking: false, readinessImpact: 2,
  },
  {
    source: "operations", target: "chairmanOffice", type: "escalates_to",
    reason: { en: "Operations escalates blocking issues to the executive office", ar: "العمليات تصعّد القضايا المعيقة إلى المكتب التنفيذي" },
    status: "open", risk: "low", blocking: false, readinessImpact: 2,
  },
];

export function buildRelationships(blueprint: Blueprint): OperationalRelationship[] {
  const present = new Set<DeptKey>(blueprint.streams.map((s) => s.deptKey));
  return CANON
    .filter((r) => present.has(r.source) && present.has(r.target))
    .map((r, i) => ({ ...r, id: `rel-${i}` }));
}
