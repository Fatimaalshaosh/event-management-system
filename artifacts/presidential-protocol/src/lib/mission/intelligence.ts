import { DEPARTMENT_BY_KEY } from "@/components/contacts/org-structure";
import type { Blueprint, Bi, DeptRecommendation, IntelItem, Level, MissionContext, MissionDNA } from "./types";

const YES: Bi = { en: "Yes", ar: "نعم" };
const NO: Bi = { en: "No", ar: "لا" };

/** Mission Intelligence — the questions the engine answers automatically. */
export function analyze(ctx: MissionContext, dna: MissionDNA, blueprint: Blueprint): IntelItem[] {
  const out: IntelItem[] = [];
  const q = (question: Bi, answer: Bi, status: IntelItem["status"]) => out.push({ question, answer, status });

  q({ en: "Is this a Head of State visit?", ar: "هل هذه زيارة رئيس دولة؟" },
    dna.vipLevel === "headOfState" ? YES : NO, "info");
  q({ en: "Which country is involved?", ar: "ما الدولة المعنية؟" },
    { en: ctx.country ?? "—", ar: ctx.countryAr ?? ctx.country ?? "—" }, "info");
  q({ en: "Has this country visited before?", ar: "هل سبق أن زارت هذه الدولة؟" },
    dna.previousVisitMemory ? YES : NO, dna.previousVisitMemory ? "ok" : "info");
  q({ en: "Are there previous gifts on record?", ar: "هل توجد هدايا سابقة مسجّلة؟" },
    dna.previousVisitMemory && dna.giftsRequired ? YES : NO, "info");
  q({ en: "Is an interpreter required?", ar: "هل يلزم مترجم فوري؟" },
    dna.interpreterRequired ? YES : NO, "info");
  q({ en: "Is airport protocol required?", ar: "هل يلزم بروتوكول مطار؟" },
    dna.airportProtocolRequired ? YES : NO, "info");
  q({ en: "Is fleet required?", ar: "هل يلزم أسطول؟" }, dna.fleetRequired ? YES : NO, "info");
  q({ en: "Is media coverage required?", ar: "هل تلزم تغطية إعلامية؟" },
    dna.mediaLevel !== "internal" ? YES : NO, "info");
  q({ en: "Is security coordination required?", ar: "هل يلزم تنسيق أمني؟" },
    dna.securityLevel === "high" || dna.securityLevel === "veryHigh" ? YES : NO, "info");
  q({ en: "Are there cultural considerations?", ar: "هل توجد اعتبارات ثقافية؟" },
    dna.culturalConsiderations ? YES : NO, dna.culturalConsiderations ? "warn" : "ok");
  q({ en: "Are there protocol risks?", ar: "هل توجد مخاطر بروتوكولية؟" },
    blueprint.risks.some((r) => r.severity === "high") ? YES : NO,
    blueprint.risks.some((r) => r.severity === "high") ? "warn" : "ok");
  q({ en: "Are any departments overloaded?", ar: "هل توجد إدارات محمّلة بأعباء زائدة؟" },
    blueprint.streams.some((s) => s.status === "blocked") ? YES : NO,
    blueprint.streams.some((s) => s.status === "blocked") ? "warn" : "ok");
  q({ en: "Are there pending approvals?", ar: "هل توجد موافقات معلّقة؟" },
    blueprint.approvals.length > 0 ? YES : NO, "warn");
  q({ en: "Are dependencies blocking readiness?", ar: "هل توجد تبعيات تعيق الجاهزية؟" },
    blueprint.streams.some((s) => s.status === "blocked") ? YES : NO,
    blueprint.streams.some((s) => s.status === "blocked") ? "warn" : "ok");
  return out;
}

const WORKLOAD: Record<string, Level> = { logistics: "high", operations: "high", protocol: "medium" };

/** Recommend the full operational assignment — departments, priority, lead, team, reasons. */
export function recommendDepartments(blueprint: Blueprint, dna: MissionDNA): DeptRecommendation[] {
  return blueprint.streams
    .filter((s) => s.priority === "critical" || s.priority === "high")
    .map((s) => {
      const dept = DEPARTMENT_BY_KEY[s.deptKey];
      const reasons: Bi[] = [];
      if (s.priority === "critical") reasons.push({ en: "Critical operational stream", ar: "مسار تشغيلي حرج" });
      if (dna.vipLevel === "headOfState") reasons.push({ en: "VIP level is Head of State", ar: "مستوى كبار الشخصيات: رئيس دولة" });
      if (s.deptKey === "protocol") reasons.push({ en: "Seating, titles and gifts are required", ar: "مطلوب الجلوس والألقاب والهدايا" });
      if (s.deptKey === "logistics") reasons.push({ en: "Flights, hotels and fleet must be coordinated", ar: "يجب تنسيق الرحلات والفنادق والأسطول" });
      if (s.deptKey === "media") reasons.push({ en: "International media coverage expected", ar: "متوقع تغطية إعلامية دولية" });
      reasons.push({ en: "Similar missions engaged this department", ar: "مهام مماثلة أشركت هذه الإدارة" });
      return {
        deptKey: s.deptKey,
        priority: s.priority,
        readinessImpact: Math.round((100 - s.readiness) * (s.priority === "critical" ? 1 : 0.6)),
        reasons,
        lead: { en: dept?.headEn ?? "", ar: dept?.headAr ?? "" },
        teamRoleKeys: (dept?.roleKeys ?? []).slice(0, 3),
        workloadRisk: WORKLOAD[s.deptKey] ?? "low",
      };
    });
}
