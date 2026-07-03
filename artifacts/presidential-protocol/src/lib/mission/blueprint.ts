import { DEPARTMENT_BY_KEY, type DeptKey } from "@/components/contacts/org-structure";
import type { Blueprint, MissionContext, MissionDNA, MissionStream, Priority, Level } from "./types";
import { PLAYBOOK_BY_DEPT } from "./playbooks";

/** Departments engaged by a mission, with priority — demo rules from DNA. */
function requiredStreams(dna: MissionDNA): { deptKey: DeptKey; priority: Priority }[] {
  const all: { deptKey: DeptKey; priority: Priority }[] = [
    { deptKey: "protocol", priority: "critical" },
    { deptKey: "operations", priority: "critical" },
    { deptKey: "logistics", priority: "critical" },
    { deptKey: "agenda", priority: "high" },
    { deptKey: "media", priority: "high" },
    { deptKey: "generalServices", priority: "high" },
    { deptKey: "planning", priority: "high" },
    { deptKey: "it", priority: "medium" },
    { deptKey: "finance", priority: "medium" },
    { deptKey: "procurement", priority: "medium" },
  ];
  if (dna.protocolLevel === "veryHigh" || dna.vipLevel === "headOfState") {
    all.push({ deptKey: "chairmanOffice", priority: "high" }, { deptKey: "secretaryGeneral", priority: "high" });
  }
  // Lighter footprint for low-protocol / internal missions
  if (dna.protocolLevel === "medium" || dna.protocolLevel === "low") {
    const keep: DeptKey[] = ["protocol", "operations", "logistics", "agenda", "generalServices", "it", "planning"];
    return all.filter((s) => keep.includes(s.deptKey));
  }
  return all;
}

// Demo "tensions" that make the cockpit/graph meaningful (blocked/at-risk streams).
const FORCED: Partial<Record<DeptKey, { readiness: number; status: MissionStream["status"]; risk: Level }>> = {
  logistics: { readiness: 62, status: "blocked", risk: "high" },
  operations: { readiness: 68, status: "blocked", risk: "high" },
  media: { readiness: 74, status: "inProgress", risk: "medium" },
};

const PRIORITY_BASE: Record<Priority, number> = { critical: 84, high: 88, medium: 90, low: 93 };

export function buildBlueprint(ctx: MissionContext, dna: MissionDNA): Blueprint {
  const streams: MissionStream[] = requiredStreams(dna).map(({ deptKey, priority }) => {
    const dept = DEPARTMENT_BY_KEY[deptKey];
    const forced = FORCED[deptKey];
    const readiness = forced?.readiness ?? Math.min(98, Math.round((PRIORITY_BASE[priority] + (dept?.readiness ?? 85)) / 2));
    const status: MissionStream["status"] = forced?.status ?? (readiness >= 92 ? "ready" : "inProgress");
    const risk: Level = forced?.risk ?? (priority === "critical" ? "medium" : "low");
    const pb = PLAYBOOK_BY_DEPT[deptKey];
    return {
      deptKey,
      priority,
      readiness,
      status,
      risk,
      lead: { en: dept?.headEn ?? "", ar: dept?.headAr ?? "" },
      actions: (pb?.items ?? []).slice(0, 4),
    };
  });

  const giftLine = dna.giftsRequired ? [{ en: "Gift protocol cleared", ar: "اعتماد بروتوكول الهدايا" }] : [];
  const interpreterLine = dna.interpreterRequired ? [{ en: "Interpreter confirmed", ar: "تأكيد المترجم الفوري" }] : [];

  return {
    streams,
    obligations: [
      { en: "VIP reception sequence", ar: "تسلسل استقبال كبار الشخصيات" },
      { en: "Seating order & precedence", ar: "ترتيب الجلوس والأسبقية" },
      ...giftLine,
      { en: "National anthem & flags", ar: "النشيد الوطني والأعلام" },
      ...(dna.airportProtocolRequired ? [{ en: "Airport arrival protocol", ar: "بروتوكول الوصول للمطار" }] : []),
    ],
    approvals: [
      { en: "Official titles approval", ar: "اعتماد الألقاب الرسمية" },
      { en: "Seating plan approval", ar: "اعتماد مخطط الجلوس" },
      { en: "Budget approval", ar: "اعتماد الميزانية" },
      { en: "Executive program approval", ar: "اعتماد البرنامج التنفيذي" },
    ],
    documents: [
      { en: "Delegation manifest", ar: "كشف الوفد" },
      { en: "Security clearance file", ar: "ملف التصاريح الأمنية" },
      ...interpreterLine,
      { en: "Protocol brief", ar: "الإحاطة البروتوكولية" },
    ],
    briefings: [
      { en: "Protocol briefing", ar: "الإحاطة البروتوكولية" },
      { en: "Security briefing", ar: "الإحاطة الأمنية" },
      { en: "Executive briefing", ar: "الإحاطة التنفيذية" },
    ],
    milestones: [
      { label: { en: "Departments engaged", ar: "إشراك الإدارات" }, offsetDays: -14 },
      { label: { en: "Resources locked", ar: "حجز الموارد" }, offsetDays: -7 },
      { label: { en: "Readiness review", ar: "مراجعة الجاهزية" }, offsetDays: -3 },
      { label: { en: "Executive approval", ar: "الاعتماد التنفيذي" }, offsetDays: -1 },
      { label: { en: "Execution", ar: "التنفيذ" }, offsetDays: 0 },
    ],
    decisions: [
      { label: { en: "Approve arrival sequence (Option A/B)", ar: "اعتماد تسلسل الوصول (خيار أ/ب)" }, deptKey: "protocol", urgent: true },
      { label: { en: "Approve delegation seating plan", ar: "اعتماد مخطط جلوس الوفد" }, deptKey: "protocol", urgent: true },
    ],
    risks: [
      { label: { en: "Official titles not yet approved", ar: "الألقاب الرسمية لم تُعتمد بعد" }, severity: "high", deptKey: "media" },
      { label: { en: "Arrival time unconfirmed — fleet at risk", ar: "وقت الوصول غير مؤكد — الأسطول معرّض للخطر" }, severity: "high", deptKey: "logistics" },
      { label: { en: "Guest list pending — security clearance blocked", ar: "قائمة الضيوف معلّقة — التصاريح الأمنية متوقفة" }, severity: "medium", deptKey: "operations" },
    ],
  };
}
