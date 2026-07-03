import type { LifecyclePhase, LifecyclePhaseKey } from "./types";

/** The 11 mission lifecycle phases, each with gate conditions. */
export const LIFECYCLE: LifecyclePhase[] = [
  { key: "draft", gates: [{ en: "Mission identity captured", ar: "تحديد هوية المهمة" }] },
  { key: "analysis", gates: [{ en: "DNA resolved", ar: "تحديد بصمة المهمة" }] },
  { key: "blueprint", gates: [{ en: "Blueprint generated", ar: "توليد المخطط التشغيلي" }] },
  { key: "planning", gates: [
    { en: "Departments engaged", ar: "إشراك الإدارات" },
    { en: "Critical dependencies identified", ar: "تحديد التبعيات الحرجة" },
  ] },
  { key: "coordination", gates: [
    { en: "Department leads assigned", ar: "إسناد قادة الإدارات" },
    { en: "Relationships reviewed", ar: "مراجعة العلاقات التشغيلية" },
  ] },
  { key: "allocation", gates: [
    { en: "Resource gaps reviewed", ar: "مراجعة فجوات الموارد" },
    { en: "Major risks logged", ar: "تسجيل المخاطر الرئيسية" },
  ] },
  { key: "readinessReview", gates: [
    { en: "Readiness ≥ 90%", ar: "الجاهزية ≥ ٩٠٪" },
    { en: "No blocking dependencies", ar: "لا تبعيات معيقة" },
  ] },
  { key: "approval", gates: [{ en: "Executive approval obtained", ar: "الحصول على الاعتماد التنفيذي" }] },
  { key: "execution", gates: [{ en: "Operations room live", ar: "غرفة العمليات مفعّلة" }] },
  { key: "closeout", gates: [{ en: "All streams completed", ar: "إكمال جميع المسارات" }] },
  { key: "afterAction", gates: [{ en: "Lessons captured", ar: "توثيق الدروس المستفادة" }] },
];

/** Demo current-phase heuristic from readiness + blockers. */
export function currentPhase(readiness: number, blockedStreams: number): LifecyclePhaseKey {
  if (blockedStreams > 0 && readiness < 90) return "coordination";
  if (readiness < 80) return "planning";
  if (readiness < 90) return "allocation";
  if (readiness < 96) return "readinessReview";
  return "approval";
}
