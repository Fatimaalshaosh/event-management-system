import type { Blueprint, BlueprintSummary, MissionContext, MissionDNA } from "./types";

/** Operational blueprint summary (demo) — the executive abstract of the mission. */
export function buildSummary(ctx: MissionContext, dna: MissionDNA, blueprint: Blueprint): BlueprintSummary {
  const required = blueprint.streams.filter((s) => s.priority === "critical" || s.priority === "high").length;
  return {
    objective: {
      en: `Deliver a flawless ${ctx.nameEn} with full protocol honours, secure logistics and coordinated media.`,
      ar: `تنفيذ ${ctx.nameAr} بإتقان كامل مع مراسم بروتوكولية كاملة ولوجستيات آمنة وتنسيق إعلامي.`,
    },
    complexity: dna.protocolLevel,
    streamsCount: blueprint.streams.length,
    requiredDepts: required,
    optionalDepts: blueprint.streams.length - required,
    assets: [
      { en: "VIP motorcade & lounge", ar: "موكب وصالة كبار الشخصيات" },
      { en: "Banquet & majlis venue", ar: "قاعة المأدبة والمجلس" },
      { en: "Official gift set", ar: "طقم الهدايا الرسمي" },
      { en: "Media center", ar: "المركز الإعلامي" },
    ],
    deliverables: [
      { en: "Approved protocol sequence", ar: "تسلسل بروتوكولي معتمد" },
      { en: "Confirmed logistics & fleet", ar: "لوجستيات وأسطول مؤكدان" },
      { en: "Security clearance complete", ar: "اكتمال التصاريح الأمنية" },
      { en: "Executive briefing pack", ar: "حزمة الإحاطة التنفيذية" },
    ],
    successCriteria: [
      { en: "Readiness ≥ 95% before execution", ar: "الجاهزية ≥ ٩٥٪ قبل التنفيذ" },
      { en: "Zero protocol incidents", ar: "صفر حوادث بروتوكولية" },
      { en: "On-time execution across all streams", ar: "تنفيذ في الوقت عبر جميع المسارات" },
      { en: "Positive media & diplomatic outcome", ar: "نتيجة إعلامية ودبلوماسية إيجابية" },
    ],
    executiveNotes: [
      { en: "Reciprocity expectations are active — mirror prior hospitality.", ar: "اعتبارات المعاملة بالمثل فعّالة — مطابقة الضيافة السابقة." },
      ...(dna.interpreterRequired ? [{ en: "Interpreter must be confirmed early.", ar: "يجب تأكيد المترجم مبكراً." }] : []),
    ],
  };
}
