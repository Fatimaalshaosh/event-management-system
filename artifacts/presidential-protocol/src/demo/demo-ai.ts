import type { AssistantReply } from "@/ai/types";

/**
 * Static-demo AI responses. On the backend-less Vercel deploy the `/api/ai-*`
 * endpoints don't exist, so the raw fetch call sites short-circuit to these
 * canned, realistic executive responses instead of hanging or 404-ing.
 * Production-only (`IS_DEMO`); local dev with the backend is unaffected.
 *
 * `ExecutiveReportData = AssistantReply & { logistics? }`, so this single shape
 * powers the AI chat, the daily brief AND the executive reports.
 */
export const IS_DEMO = import.meta.env.PROD;

export function demoAssistantReply(lang: string, _topic?: string): AssistantReply {
  const ar = lang === "ar";
  return {
    analysis: ar
      ? "إحاطة تنفيذية (وضع العرض). تم تحليل الفعاليات الحالية ومستوى الجاهزية والمخاطر لإعداد ملخص تنفيذي موجز وإجراءات موصى بها."
      : "Executive briefing (demo mode). Current events, readiness and risks were analysed to produce a concise executive summary and recommended actions.",
    sections: [
      {
        title: ar ? "الملخص التنفيذي" : "Executive Summary",
        body: ar
          ? "• الجاهزية العامة ضمن النطاق المستهدف.\n• لا توجد تعارضات حرجة في الجدول الزمني.\n• الموافقات الرئيسية قيد التنفيذ."
          : "• Overall readiness is within the target range.\n• No critical scheduling conflicts detected.\n• Key executive approvals are in progress.",
      },
      {
        title: ar ? "أبرز النقاط" : "Key Highlights",
        body: ar
          ? "• تم تأكيد ترتيبات البروتوكول والأمن.\n• خطة النقل والاستقبال جاهزة.\n• التنسيق الإعلامي والضيافة قيد الإعداد."
          : "• Protocol and security arrangements confirmed.\n• Transport and reception plans are ready.\n• Media coordination and hospitality underway.",
      },
      {
        title: ar ? "الإجراءات الموصى بها" : "Recommended Actions",
        body: ar
          ? "• اعتماد قائمة الضيوف النهائية.\n• تأكيد تصاريح المطار.\n• مراجعة تسلسل الموكب قبل يوم الفعالية."
          : "• Approve the final guest list.\n• Confirm airport clearances.\n• Review the motorcade sequence before event day.",
      },
    ],
    risks: [
      { severity: "high", title: ar ? "نافذة الوصول ضيقة" : "Tight arrival window", impact: ar ? "قد تؤثر على تسلسل الاستقبال" : "May affect the reception sequence", mitigation: ar ? "إضافة فاصل احتياطي 15 دقيقة" : "Add a 15-minute contingency buffer" },
      { severity: "medium", title: ar ? "تصريح نقطة التفتيش" : "Checkpoint clearance", impact: ar ? "احتمال تأخير الموكب" : "Possible motorcade delay", mitigation: ar ? "تأكيد التصاريح قبل الساعة 13:00" : "Confirm clearances before 13:00" },
      { severity: "low", title: ar ? "توقيت التغطية الإعلامية" : "Media timing", impact: ar ? "تداخل محتمل مع الجدول" : "Potential overlap with the schedule", mitigation: ar ? "التنسيق مع المكتب الإعلامي" : "Coordinate with the media office" },
    ],
    nextActions: [
      { label: ar ? "إنشاء محضر الاجتماع" : "Generate meeting minutes", prompt: ar ? "أنشئ محضر الاجتماع" : "Generate the meeting minutes" },
      { label: ar ? "إعداد إحاطة أمنية" : "Prepare security briefing", prompt: ar ? "أعد إحاطة أمنية" : "Prepare a security briefing" },
      { label: ar ? "الموافقات المعلقة" : "List pending approvals", prompt: ar ? "اعرض الموافقات المعلقة" : "List the pending approvals" },
    ],
  };
}
