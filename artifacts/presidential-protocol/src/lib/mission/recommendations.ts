import type { DeptKey } from "@/components/contacts/org-structure";
import type { Blueprint, ExecRecommendation } from "./types";

/** Reasoned executive recommendations (demo). Ordered so that actions which
 * unblock a currently-blocked stream surface first. */
export function executiveRecommendations(blueprint: Blueprint): ExecRecommendation[] {
  const blocked = new Set<DeptKey>(blueprint.streams.filter((s) => s.status === "blocked").map((s) => s.deptKey));
  const pool: { dept: DeptKey; rec: ExecRecommendation }[] = [
    {
      dept: "media",
      rec: {
        action: { en: "Approve arrival sequence — Option B", ar: "اعتماد تسلسل الوصول — الخيار ب" },
        reason: { en: "The protocol dependency currently blocks media accreditation.", ar: "تبعية البروتوكول تعيق حالياً اعتماد الإعلام." },
        impact: 9, riskReduction: "high", timeSavedHours: 12,
      },
    },
    {
      dept: "logistics",
      rec: {
        action: { en: "Confirm arrival time with the embassy", ar: "تأكيد وقت الوصول مع السفارة" },
        reason: { en: "An unconfirmed arrival time keeps the fleet & transport plan blocked.", ar: "وقت الوصول غير المؤكد يبقي خطة الأسطول والنقل متوقفة." },
        impact: 7, riskReduction: "high", timeSavedHours: 8,
      },
    },
    {
      dept: "operations",
      rec: {
        action: { en: "Clear the guest list for security", ar: "اعتماد قائمة الضيوف أمنياً" },
        reason: { en: "The pending guest list blocks security clearance and the movement plan.", ar: "قائمة الضيوف المعلّقة تعيق التصاريح الأمنية وخطة الحركة." },
        impact: 5, riskReduction: "medium", timeSavedHours: 6,
      },
    },
  ];
  return pool.sort((a, b) => Number(blocked.has(b.dept)) - Number(blocked.has(a.dept))).map((p) => p.rec);
}
