import type { Blueprint, Decision } from "./types";

/** The executive decision queue (demo) — each with impact, unlocks and a recommendation. */
export function buildDecisions(blueprint: Blueprint): Decision[] {
  const has = (k: string) => blueprint.streams.some((s) => s.deptKey === k);
  const decisions: Decision[] = [
    {
      id: "d-titles",
      title: { en: "Approve official titles", ar: "اعتماد الألقاب الرسمية" },
      deptKey: "protocol",
      deadline: { en: "Today, 14:00", ar: "اليوم، ١٤:٠٠" },
      impact: 9,
      unlocks: ["media", "logistics", "operations"],
      risk: "high",
      recommendation: { en: "Approve before 2 PM to unblock media accreditation and the protocol sequence.", ar: "اعتمد قبل الساعة الثانية ظهراً لرفع الحجب عن اعتماد الإعلام وتسلسل البروتوكول." },
      timeSavedHours: 8,
    },
    {
      id: "d-arrival",
      title: { en: "Approve arrival sequence (Option B)", ar: "اعتماد تسلسل الوصول (الخيار ب)" },
      deptKey: "logistics",
      deadline: { en: "Today, 17:00", ar: "اليوم، ١٧:٠٠" },
      impact: 7,
      unlocks: ["logistics", "operations"],
      risk: "high",
      recommendation: { en: "Confirm the arrival window so the fleet and movement plan can lock.", ar: "أكّد نافذة الوصول ليُغلق مخطط الأسطول والحركة." },
      timeSavedHours: 6,
    },
    {
      id: "d-seating",
      title: { en: "Approve delegation seating plan", ar: "اعتماد مخطط جلوس الوفد" },
      deptKey: "protocol",
      deadline: { en: "Tomorrow", ar: "غداً" },
      impact: 5,
      unlocks: ["generalServices", "operations"],
      risk: "medium",
      recommendation: { en: "Approve to release venue setup and catering.", ar: "اعتمد لإطلاق تجهيز المكان والضيافة." },
      timeSavedHours: 4,
    },
  ];
  return decisions.filter((d) => !d.deptKey || has(d.deptKey));
}
