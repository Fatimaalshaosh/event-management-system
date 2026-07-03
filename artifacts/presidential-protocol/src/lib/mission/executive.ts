import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type {
  Blueprint, Countdown, DailyBrief, Decision, DeptPresence, ExecNotification,
  ExecRecommendation, MissionContext, Narrative, OperationalRelationship, Prediction, Verdict,
} from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/* ── Verdict ──────────────────────────────────────────── */
export function buildVerdict(rels: OperationalRelationship[], readiness: number): Verdict {
  const blocked = rels.filter((r) => r.blocking && r.status === "blocked");
  const atRisk = rels.filter((r) => r.status === "atRisk");
  if (blocked.length) {
    return {
      level: "blocked",
      headline: { en: "Blocked", ar: "متوقفة" },
      reason: blocked[0].reason,
      action: { en: "Approve official titles — media, invitations and logistics cannot continue.", ar: "اعتماد الألقاب الرسمية — لا يمكن أن يستمر الإعلام والدعوات واللوجستيات." },
      impact: { en: "+9% readiness once cleared", ar: "+٩٪ جاهزية بعد المعالجة" },
    };
  }
  if (atRisk.length || readiness < 85) {
    return {
      level: "atRisk",
      headline: { en: "At risk", ar: "معرّضة للخطر" },
      reason: atRisk[0]?.reason ?? { en: "Protocol approval is delaying media readiness.", ar: "اعتماد البروتوكول يؤخر جاهزية الإعلام." },
      action: { en: "One executive approval required.", ar: "مطلوب اعتماد تنفيذي واحد." },
      impact: { en: "+7% readiness once approved", ar: "+٧٪ جاهزية بعد الاعتماد" },
    };
  }
  return {
    level: "ready",
    headline: { en: "Ready", ar: "جاهزة" },
    reason: { en: "Mission is progressing as expected.", ar: "المهمة تسير كما هو متوقع." },
    action: { en: "No executive intervention required.", ar: "لا يلزم تدخل تنفيذي." },
    impact: { en: "On track for execution", ar: "على المسار نحو التنفيذ" },
  };
}

/* ── Countdown ────────────────────────────────────────── */
export function buildCountdown(ctx: MissionContext, readiness: number, milestonesRemaining: number): Countdown {
  const date = ctx.date ? new Date(ctx.date) : null;
  let days = 4, hours = 0;
  if (date && !isNaN(date.getTime())) {
    const ms = date.getTime() - Date.now();
    if (ms > 0) { days = Math.floor(ms / 86400000); hours = Math.floor((ms % 86400000) / 3600000); }
  }
  const label: Countdown["label"] =
    days > 1 ? { en: `${days} days`, ar: `${days} يوم` }
    : days === 1 ? { en: "Tomorrow", ar: "غداً" }
    : { en: `${hours} hours`, ar: `${hours} ساعة` };
  return {
    days, hours, label,
    projectedReadiness: clamp(readiness + Math.min(22, days * 3 + 6)),
    pace: { en: "On current pace", ar: "بالوتيرة الحالية" },
    remainingMilestones: milestonesRemaining,
  };
}

/* ── Narrative ────────────────────────────────────────── */
export function buildNarrative(readiness: number, confidence: number, rels: OperationalRelationship[]): Narrative {
  return {
    readiness: {
      en: `Mission is progressing normally. Readiness rose 4% since yesterday; ${rels.filter((r) => r.blocking).length} approvals still prevent full execution.`,
      ar: `المهمة تسير بشكل طبيعي. ارتفعت الجاهزية ٤٪ منذ الأمس؛ لا تزال ${rels.filter((r) => r.blocking).length} موافقات تمنع التنفيذ الكامل.`,
    },
    risks: rels.filter((r) => r.blocking || r.status === "atRisk").map((r) => r.reason),
    confidence: {
      en: `Confidence is ${confidence}% — limited by an unconfirmed arrival time and a pending interpreter.`,
      ar: `الثقة ${confidence}٪ — محدودة بوقت وصول غير مؤكد ومترجم معلّق.`,
    },
    confidenceReasons: [
      { en: "Arrival time unconfirmed", ar: "وقت الوصول غير مؤكد" },
      { en: "Interpreter pending confirmation", ar: "المترجم بانتظار التأكيد" },
      { en: "Hotel contract awaiting approval", ar: "عقد الفندق بانتظار الاعتماد" },
      { en: "Weather forecast not yet available", ar: "توقعات الطقس غير متاحة بعد" },
    ],
  };
}

/* ── Notifications ────────────────────────────────────── */
export function buildNotifications(): ExecNotification[] {
  return [
    { id: "n1", title: { en: "Protocol approval overdue", ar: "تأخر اعتماد البروتوكول" }, impact: { en: "Blocks media accreditation", ar: "يعيق اعتماد الإعلام" }, departments: ["protocol", "media"], action: { en: "Approve official titles", ar: "اعتماد الألقاب الرسمية" }, severity: "risk" },
    { id: "n2", title: { en: "Arrival time unconfirmed", ar: "وقت الوصول غير مؤكد" }, impact: { en: "Fleet & transport at risk", ar: "الأسطول والنقل في خطر" }, departments: ["logistics", "agenda"], action: { en: "Confirm with the embassy", ar: "التأكيد مع السفارة" }, severity: "warn" },
    { id: "n3", title: { en: "Interpreter not confirmed", ar: "المترجم غير مؤكد" }, impact: { en: "Bilateral session readiness", ar: "جاهزية الجلسة الثنائية" }, departments: ["protocol"], action: { en: "Confirm 72h ahead", ar: "التأكيد قبل ٧٢ ساعة" }, severity: "warn" },
    { id: "n4", title: { en: "Security readiness decreased", ar: "انخفضت الجاهزية الأمنية" }, impact: { en: "Guest list pending", ar: "قائمة الضيوف معلّقة" }, departments: ["operations"], action: { en: "Clear the guest list", ar: "اعتماد قائمة الضيوف" }, severity: "warn" },
  ];
}

/* ── Predictions ──────────────────────────────────────── */
export function buildPredictions(): Prediction[] {
  return [
    { text: { en: "If no action is taken, readiness will decline to 63% by tomorrow.", ar: "إن لم يُتخذ إجراء، ستنخفض الجاهزية إلى ٦٣٪ غداً." }, confidence: "high" },
    { text: { en: "Weather conditions may delay airport protocol.", ar: "قد تؤخر الأحوال الجوية بروتوكول المطار." }, confidence: "medium" },
    { text: { en: "Hotel confirmation expected within 4 hours.", ar: "يُتوقع تأكيد الفندق خلال ٤ ساعات." }, confidence: "medium" },
    { text: { en: "VIP convoy timing has medium confidence.", ar: "توقيت موكب كبار الشخصيات بثقة متوسطة." }, confidence: "medium" },
  ];
}

/* ── Daily brief ──────────────────────────────────────── */
export function buildDailyBrief(
  countdown: Countdown, readiness: number, decisions: Decision[], topRec: ExecRecommendation | undefined, newBlockers: number,
): DailyBrief {
  const h = new Date().getHours();
  const greeting = h < 12 ? { en: "Good morning", ar: "صباح الخير" } : h < 18 ? { en: "Good afternoon", ar: "مساء الخير" } : { en: "Good evening", ar: "مساء الخير" };
  return {
    greeting, countdown,
    yesterdayReadiness: Math.max(0, readiness - 4),
    currentReadiness: readiness,
    completedYesterday: 12,
    newBlockers,
    decisionsRequired: decisions.length,
    recommendation: topRec?.action ?? { en: "Review the decision queue.", ar: "راجع قائمة القرارات." },
    projectedAfter: clamp(readiness + (topRec?.impact ?? 10)),
  };
}

/* ── Human presence ───────────────────────────────────── */
export function buildPresence(blueprint: Blueprint): DeptPresence[] {
  return blueprint.streams.map((s) => {
    const dept = DEPARTMENT_BY_KEY[s.deptKey];
    return {
      deptKey: s.deptKey,
      owner: { en: dept?.headEn ?? "", ar: dept?.headAr ?? "" },
      availability: s.status === "blocked" ? "busy" : "available",
      workload: clamp(45 + (100 - s.readiness) / 2),
      eta: { en: "Today, 14:00", ar: "اليوم، ١٤:٠٠" },
      waitingOn: s.status === "blocked" ? { en: "Awaiting executive approval", ar: "بانتظار الاعتماد التنفيذي" } : null,
    };
  });
}
