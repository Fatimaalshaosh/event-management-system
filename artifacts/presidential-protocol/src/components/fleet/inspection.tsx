
import { useState } from "react";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";


import { Download, Printer, Star, CheckCircle, Clock, AlertCircle, FileText, Shield, Fuel, Eye } from "lucide-react";
import { ArrowStart } from "@/components/dir-icon";
import { C, Vehicle, Driver, StatusPill, SectionHeader } from "@/components/fleet/shared";

/* Extracted from fleet.tsx — vehicle handover/return inspection. */
/* ─── Inspection types & data ────────────────────────────────── */
export type DamageZone = "أمامي" | "خلفي" | "جانب أيسر" | "جانب أيمن" | "السقف";
export type DamageKind = "خدش" | "طرم" | "تشقق" | "قطعة مفقودة";
export type DamageMarker = { id: string; zone: DamageZone; kind: DamageKind; x: number; y: number; isNew?: boolean };
export type InspectionStatus = "سليمة" | "توجد ملاحظات" | "يوجد ضرر جديد" | "بحاجة صيانة";
export type InspectionSide = {
  date: string; time: string; fuel: number; km: number;
  cleanliness: "نظيفة" | "مقبولة" | "تحتاج تنظيف";
  tires: "سليمة" | "تحتاج فحص" | "تحتاج تغيير";
  glass: "سليم" | "خدوش" | "تشققات";
  exterior: "ممتازة" | "جيدة" | "توجد ملاحظات";
  damages: DamageMarker[];
  supervisorNotes: string; supervisorName: string;
};
export type DriverEval = { commitment: number; cleanliness: number; punctuality: number; vehicleCare: number; notes: string };
export type InspectionReport = {
  id: string; vehiclePlate: string; vehicleMake: string; driverName: string;
  event: string; step: 1 | 2 | 3 | 4 | 5 | 6;
  preDelivery: InspectionSide;
  returnData?: InspectionSide & { status: InspectionStatus };
  evaluation?: DriverEval;
};

export const INSPECTION_REPORTS: InspectionReport[] = [
  {
    id: "ir1", vehiclePlate: "أ ب ج 1001", vehicleMake: "مرسيدس-بنز S-Class",
    driverName: "أحمد بن سالم المنهالي", event: "استقبال وفد المملكة العربية السعودية", step: 6,
    preDelivery: {
      date: "14/05/2026", time: "08:30 ص", fuel: 100, km: 48320,
      cleanliness: "نظيفة", tires: "سليمة", glass: "سليم", exterior: "ممتازة",
      damages: [
        { id: "d1", zone: "خلفي", kind: "خدش", x: 100, y: 330, isNew: false },
      ],
      supervisorNotes: "المركبة في حالة ممتازة. خدش قديم موثق في المؤخرة.", supervisorName: "سعيد المزروعي",
    },
    returnData: {
      date: "14/05/2026", time: "01:15 م", fuel: 72, km: 48487, status: "سليمة",
      cleanliness: "نظيفة", tires: "سليمة", glass: "سليم", exterior: "ممتازة",
      damages: [{ id: "d1", zone: "خلفي", kind: "خدش", x: 100, y: 330, isNew: false }],
      supervisorNotes: "المركبة عادت بحالة ممتازة. لا أضرار جديدة.", supervisorName: "سعيد المزروعي",
    },
    evaluation: { commitment: 5, cleanliness: 5, punctuality: 5, vehicleCare: 5, notes: "أداء احترافي استثنائي طوال المهمة." },
  },
  {
    id: "ir2", vehiclePlate: "أ ب ج 1002", vehicleMake: "مرسيدس-بنز GLS 600",
    driverName: "محمد خالد الشامسي", event: "حفل العشاء الرسمي", step: 2,
    preDelivery: {
      date: "14/05/2026", time: "04:00 م", fuel: 100, km: 31250,
      cleanliness: "نظيفة", tires: "سليمة", glass: "سليم", exterior: "ممتازة",
      damages: [],
      supervisorNotes: "المركبة مهيأة بالكامل. لا ملاحظات.", supervisorName: "خالد العامري",
    },
  },
  {
    id: "ir3", vehiclePlate: "أ ب ج 1003", vehicleMake: "BMW 750Li",
    driverName: "سالم راشد الكتبي", event: "اجتماع بروتوكول وزارة الخارجية", step: 5,
    preDelivery: {
      date: "13/05/2026", time: "07:45 ص", fuel: 95, km: 22100,
      cleanliness: "نظيفة", tires: "سليمة", glass: "سليم", exterior: "جيدة",
      damages: [{ id: "d2", zone: "جانب أيمن", kind: "خدش", x: 170, y: 180, isNew: false }],
      supervisorNotes: "خدش قديم موثق في الجانب الأيمن.", supervisorName: "خالد العامري",
    },
    returnData: {
      date: "13/05/2026", time: "11:30 ص", fuel: 81, km: 22215, status: "يوجد ضرر جديد",
      cleanliness: "مقبولة", tires: "سليمة", glass: "سليم", exterior: "توجد ملاحظات",
      damages: [
        { id: "d2", zone: "جانب أيمن", kind: "خدش", x: 170, y: 180, isNew: false },
        { id: "d3", zone: "أمامي", kind: "طرم", x: 100, y: 60, isNew: true },
      ],
      supervisorNotes: "طُرم جديد في المقدمة اليسرى. بحاجة تقييم من الورشة.", supervisorName: "خالد العامري",
    },
    evaluation: { commitment: 4, cleanliness: 3, punctuality: 5, vehicleCare: 2, notes: "يُنصح بدورة توعوية للمحافظة على المركبات." },
  },
  {
    id: "ir4", vehiclePlate: "أ ب ج 1004", vehicleMake: "لاند كروزر LC300",
    driverName: "عبدالله سعيد البلوشي", event: "جولة أمنية — قصر الرئاسة", step: 4,
    preDelivery: {
      date: "14/05/2026", time: "06:00 ص", fuel: 100, km: 67800,
      cleanliness: "نظيفة", tires: "تحتاج فحص", glass: "سليم", exterior: "جيدة",
      damages: [{ id: "d4", zone: "السقف", kind: "خدش", x: 100, y: 180, isNew: false }],
      supervisorNotes: "الإطارات تحتاج فحصاً دورياً قريباً.", supervisorName: "سعيد المزروعي",
    },
  },
];

/* ─── Inspection helpers ─────────────────────────────────────── */
export const WORKFLOW_STEPS = [
  "تسليم المركبة", "توقيع السائق", "تنفيذ المهمة",
  "استلام المركبة", "مراجعة الحالة", "اعتماد التقرير",
];
export const WORKFLOW_STEP_KEYS = [
  "pages.fleet.workflow.handover",
  "pages.fleet.workflow.driverSignature",
  "pages.fleet.workflow.execution",
  "pages.fleet.workflow.return",
  "pages.fleet.workflow.conditionReview",
  "pages.fleet.workflow.approval",
];

export const RETURN_STATUS_COLORS: Record<InspectionStatus, { bg: string; text: string; border: string }> = {
  "سليمة":           { bg: `${C.mangrove}15`, text: C.mangrove, border: `${C.mangrove}40` },
  "توجد ملاحظات":   { bg: "#FDF6E3", text: "#7A6010", border: "#E8D8A0" },
  "يوجد ضرر جديد":  { bg: "#FDF0F0", text: "#8B2020", border: "#ECC8C8" },
  "بحاجة صيانة":    { bg: "#FDF0F0", text: "#7A3010", border: "#ECC0A0" },
};

/* ─── inspection label keys (display only — Arabic values stay for logic) ─── */
export const INSPECTION_STATUS_KEYS: Record<InspectionStatus, string> = {
  "سليمة": "pages.fleet.inspectionStatus.sound",
  "توجد ملاحظات": "pages.fleet.inspectionStatus.hasRemarks",
  "يوجد ضرر جديد": "pages.fleet.inspectionStatus.newDamage",
  "بحاجة صيانة": "pages.fleet.inspectionStatus.needsMaintenance",
};
export const CLEANLINESS_KEYS: Record<string, string> = {
  "نظيفة": "pages.fleet.cleanliness.clean",
  "مقبولة": "pages.fleet.cleanliness.acceptable",
  "تحتاج تنظيف": "pages.fleet.cleanliness.needsCleaning",
};
export const TIRES_KEYS: Record<string, string> = {
  "سليمة": "pages.fleet.tires.sound",
  "تحتاج فحص": "pages.fleet.tires.needsCheck",
  "تحتاج تغيير": "pages.fleet.tires.needsReplacement",
};
export const GLASS_KEYS: Record<string, string> = {
  "سليم": "pages.fleet.glass.sound",
  "خدوش": "pages.fleet.glass.scratches",
  "تشققات": "pages.fleet.glass.cracks",
};
export const EXTERIOR_KEYS: Record<string, string> = {
  "ممتازة": "pages.fleet.exterior.excellent",
  "جيدة": "pages.fleet.exterior.good",
  "توجد ملاحظات": "pages.fleet.exterior.hasRemarks",
};
export const DAMAGE_KIND_KEYS: Record<string, string> = {
  "خدش": "pages.fleet.damageKind.scratch",
  "طرم": "pages.fleet.damageKind.dent",
  "تشقق": "pages.fleet.damageKind.crack",
  "قطعة مفقودة": "pages.fleet.damageKind.missingPart",
};
export const DAMAGE_ZONE_KEYS: Record<string, string> = {
  "أمامي": "pages.fleet.damageZone.front",
  "خلفي": "pages.fleet.damageZone.rear",
  "جانب أيسر": "pages.fleet.damageZone.leftSide",
  "جانب أيمن": "pages.fleet.damageZone.rightSide",
  "السقف": "pages.fleet.damageZone.roof",
};

export function StepBar({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
      {WORKFLOW_STEP_KEYS.map((labelKey, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        const future = step < idx;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? C.mangrove : active ? C.gold : C.border,
                border: active ? `2px solid ${C.gold}` : "none",
                boxShadow: active ? `0 0 0 3px ${C.gold}22` : "none",
                transition: "all 0.2s",
              }}>
                {done
                  ? <CheckCircle size={13} strokeWidth={2} style={{ color: "white" }} />
                  : <span style={{ fontSize: 10, fontWeight: 700, color: active ? "white" : future ? C.sub : "white" }}>{idx}</span>
                }
              </div>
              <span style={{ fontSize: 9, fontWeight: active || done ? 700 : 400, color: active ? C.gold : done ? C.mangrove : C.sub, whiteSpace: "nowrap" }}>{t(labelKey)}</span>
            </div>
            {i < WORKFLOW_STEP_KEYS.length - 1 && (
              <div style={{ width: 36, height: 1, background: done ? C.mangrove : C.border, marginBottom: 18, flexShrink: 0, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FuelBar({ level }: { level: number }) {
  const { t } = useTranslation();
  const color = level > 60 ? C.mangrove : level > 30 ? C.gold : "#CC3333";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "end" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{level}%</span>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: C.border, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: "100%", borderRadius: 999, background: `linear-gradient(to right, ${color}88, ${color})` }}
        />
      </div>
      <Fuel size={11} strokeWidth={1.5} style={{ color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: C.sub, minWidth: 48, textAlign: "end" }}>{t("pages.fleet.fuelLevel")}</span>
    </div>
  );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={12} strokeWidth={1} fill={i < Math.round(value) ? C.gold : C.border} style={{ color: i < Math.round(value) ? C.gold : C.border }} />
      ))}
    </div>
  );
}

/* ─── Vehicle body SVG diagram ───────────────────────────────── */
export function VehicleDiagram({ damages }: { damages: DamageMarker[] }) {
  const { t } = useTranslation();
  const preExisting = damages.filter(d => !d.isNew);
  const newDamages = damages.filter(d => d.isNew);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.sub }}>{t("pages.fleet.diagram.title")}</p>
      <svg viewBox="0 0 200 400" width="130" height="230" style={{ display: "block" }}>
        {/* Body */}
        <rect x="22" y="28" width="156" height="344" rx="32" fill="#F5F0EA" stroke={C.border} strokeWidth="1.5" />
        {/* Cabin */}
        <rect x="36" y="100" width="128" height="178" rx="10" fill="#EDE5D8" stroke={C.border} strokeWidth="1" />
        {/* Windshields */}
        <rect x="42" y="75" width="116" height="52" rx="8" fill="#D4E8E6" stroke={C.teal} strokeWidth="1" opacity="0.7" />
        <rect x="42" y="252" width="116" height="52" rx="8" fill="#D4E8E6" stroke={C.teal} strokeWidth="1" opacity="0.7" />
        {/* Wheels */}
        {[[8,55],[168,55],[8,285],[168,285]].map(([x,y],i) => (
          <rect key={i} x={x} y={y} width="24" height="60" rx="8" fill="#2d2d2d" />
        ))}
        {/* Zone labels */}
        <text x="100" y="50" textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="sans-serif">{t("pages.fleet.diagram.front")}</text>
        <text x="100" y="376" textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="sans-serif">{t("pages.fleet.diagram.rear")}</text>
        <text x="15" y="195" textAnchor="middle" fontSize="7" fill={C.sub} fontFamily="sans-serif" transform="rotate(-90,15,195)">{t("pages.fleet.diagram.left")}</text>
        <text x="185" y="195" textAnchor="middle" fontSize="7" fill={C.sub} fontFamily="sans-serif" transform="rotate(90,185,195)">{t("pages.fleet.diagram.right")}</text>
        <text x="100" y="200" textAnchor="middle" fontSize="8" fill={C.sub} fontFamily="sans-serif">{t("pages.fleet.diagram.roof")}</text>
        {/* Damage markers */}
        {preExisting.map(d => (
          <g key={d.id}>
            <circle cx={d.x} cy={d.y} r="9" fill={`${C.gold}40`} stroke={C.gold} strokeWidth="1.5" />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="8" fill={C.gold} fontFamily="sans-serif">✕</text>
          </g>
        ))}
        {newDamages.map(d => (
          <g key={d.id}>
            <circle cx={d.x} cy={d.y} r="9" fill="#CC333330" stroke="#CC3333" strokeWidth="2" />
            <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="8" fill="#CC3333" fontFamily="sans-serif">!</text>
          </g>
        ))}
      </svg>
      {/* Legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: `${C.gold}40`, border: `1.5px solid ${C.gold}` }} />
          <span style={{ fontSize: 9, color: C.sub }}>{t("pages.fleet.diagram.previousDamage")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#CC333330", border: "2px solid #CC3333" }} />
          <span style={{ fontSize: 9, color: "#8B2020" }}>{t("pages.fleet.diagram.newDamage")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Inspection card list item ──────────────────────────────── */
export function InspectionCard({ report, onOpen }: { report: InspectionReport; onOpen: () => void }) {
  const { t } = useTranslation();
  const hasNewDamage = report.returnData?.damages?.some(d => d.isNew);
  const stepLabel = t(WORKFLOW_STEP_KEYS[report.step - 1]);
  const isDone = report.step === 6;

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: C.card, border: `1px solid ${hasNewDamage ? "#ECC8C8" : C.border}`, borderRadius: 16, padding: "16px 20px", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

      {/* Step badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", minWidth: 72 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? `${C.mangrove}18` : hasNewDamage ? "#FDF0F0" : `${C.gold}12`, border: `2px solid ${isDone ? C.mangrove : hasNewDamage ? "#ECC8C8" : C.gold}` }}>
          {isDone
            ? <CheckCircle size={16} strokeWidth={1.5} style={{ color: C.mangrove }} />
            : hasNewDamage
            ? <AlertCircle size={16} strokeWidth={1.5} style={{ color: "#CC3333" }} />
            : <Clock size={16} strokeWidth={1.5} style={{ color: C.gold }} />
          }
        </div>
        <span style={{ fontSize: 8, fontWeight: 700, color: isDone ? C.mangrove : hasNewDamage ? "#8B2020" : C.gold, textAlign: "center" }}>{stepLabel}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, textAlign: "end" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{report.event}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, color: C.sub }}>{report.preDelivery.date}</span>
          <span style={{ fontSize: 11, color: C.text }}>{report.driverName}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.gold }}>{report.vehiclePlate}</span>
        </div>
        {report.returnData && (
          <div style={{ marginTop: 6 }}>
            <StatusPill label={t(INSPECTION_STATUS_KEYS[report.returnData.status])} colors={RETURN_STATUS_COLORS[report.returnData.status]} />
          </div>
        )}
      </div>

      {/* Open button */}
      <button onClick={onOpen}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, color: C.sub, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
        <Eye size={13} strokeWidth={1.5} />
        {t("pages.fleet.openReport")}
      </button>
    </motion.div>
  );
}

/* ─── Inspection detail view ─────────────────────────────────── */
export function InspectionDetail({ report, onBack }: { report: InspectionReport; onBack: () => void }) {
  const { t } = useTranslation();
  const allPreDamages = report.preDelivery.damages;
  const allReturnDamages = report.returnData?.damages ?? [];
  const newDamagesOnly = allReturnDamages.filter(d => d.isNew);

  function InspRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, fontWeight: warn ? 700 : 400, color: warn ? "#8B2020" : C.text }}>{value}</span>
        <span style={{ fontSize: 10, color: C.sub }}>{label}</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: "end" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{report.event}</h2>
          <p style={{ fontSize: 11, color: C.sub }}>{report.vehicleMake} — {report.vehiclePlate} — {report.driverName}</p>
        </div>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.sub, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <ArrowStart size={13} strokeWidth={1.5} />
          {t("pages.fleet.back")}
        </button>
      </div>

      {/* Workflow stepper */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 24px", marginBottom: 20, boxShadow: C.shadow }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 14, textAlign: "end" }}>{t("pages.fleet.reportWorkflow")}</p>
        <StepBar step={report.step} />
      </div>

      {/* Pre + Return columns */}
      <div style={{ display: "grid", gridTemplateColumns: report.returnData ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 20 }}>
        {/* Pre-delivery */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t("pages.fleet.preDeliveryInspection")}</p>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: `${C.mangrove}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={13} strokeWidth={1.5} style={{ color: C.mangrove }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><FuelBar level={report.preDelivery.fuel} /></div>
          <InspRow label={t("pages.fleet.fields.dateTime")} value={`${report.preDelivery.date} — ${report.preDelivery.time}`} />
          <InspRow label={t("pages.fleet.fields.odometer")} value={t("pages.fleet.km", { value: report.preDelivery.km.toLocaleString() })} />
          <InspRow label={t("pages.fleet.fields.cleanlinessStatus")} value={t(CLEANLINESS_KEYS[report.preDelivery.cleanliness])} />
          <InspRow label={t("pages.fleet.fields.tiresStatus")} value={t(TIRES_KEYS[report.preDelivery.tires])} warn={report.preDelivery.tires !== "سليمة"} />
          <InspRow label={t("pages.fleet.fields.glassStatus")} value={t(GLASS_KEYS[report.preDelivery.glass])} warn={report.preDelivery.glass !== "سليم"} />
          <InspRow label={t("pages.fleet.fields.exteriorBodyStatus")} value={t(EXTERIOR_KEYS[report.preDelivery.exterior])} />
          <InspRow label={t("pages.fleet.fields.supervisor")} value={report.preDelivery.supervisorName} />
          {report.preDelivery.supervisorNotes && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#F3E7D7", borderRadius: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: C.gold, marginBottom: 3 }}>{t("pages.fleet.supervisorNotes")}</p>
              <p style={{ fontSize: 10.5, color: C.text, lineHeight: 1.55 }}>{report.preDelivery.supervisorNotes}</p>
            </div>
          )}
        </div>

        {/* Return */}
        {report.returnData && (
          <div style={{ background: C.card, border: `1px solid ${newDamagesOnly.length > 0 ? "#ECC8C8" : C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t("pages.fleet.returnInspection")}</p>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: newDamagesOnly.length > 0 ? "#FDF0F0" : `${C.teal}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {newDamagesOnly.length > 0
                  ? <AlertCircle size={13} strokeWidth={1.5} style={{ color: "#CC3333" }} />
                  : <CheckCircle size={13} strokeWidth={1.5} style={{ color: C.teal }} />
                }
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <StatusPill label={t(INSPECTION_STATUS_KEYS[report.returnData.status])} colors={RETURN_STATUS_COLORS[report.returnData.status]} />
              </div>
              <FuelBar level={report.returnData.fuel} />
            </div>
            <InspRow label={t("pages.fleet.fields.dateTime")} value={`${report.returnData.date} — ${report.returnData.time}`} />
            <InspRow label={t("pages.fleet.fields.odometer")} value={t("pages.fleet.km", { value: report.returnData.km.toLocaleString() })} />
            <InspRow label={t("pages.fleet.fields.distanceTraveled")} value={t("pages.fleet.km", { value: (report.returnData.km - report.preDelivery.km).toLocaleString() })} />
            <InspRow label={t("pages.fleet.fields.cleanlinessStatus")} value={t(CLEANLINESS_KEYS[report.returnData.cleanliness])} warn={report.returnData.cleanliness === "تحتاج تنظيف"} />
            <InspRow label={t("pages.fleet.fields.glassStatus")} value={t(GLASS_KEYS[report.returnData.glass])} warn={report.returnData.glass !== "سليم"} />
            <InspRow label={t("pages.fleet.fields.bodyStatus")} value={t(EXTERIOR_KEYS[report.returnData.exterior])} warn={report.returnData.exterior === "توجد ملاحظات"} />
            <InspRow label={t("pages.fleet.fields.supervisor")} value={report.returnData.supervisorName} />
            {report.returnData.supervisorNotes && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: newDamagesOnly.length > 0 ? "#FDF0F0" : "#F3E7D7", borderRadius: 10, border: newDamagesOnly.length > 0 ? "1px solid #ECC8C8" : "none" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: newDamagesOnly.length > 0 ? "#CC3333" : C.gold, marginBottom: 3 }}>{t("pages.fleet.returnNotes")}</p>
                <p style={{ fontSize: 10.5, color: C.text, lineHeight: 1.55 }}>{report.returnData.supervisorNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Damage comparison + Diagram */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, marginBottom: 20, alignItems: "start" }}>
        {/* SVG Diagram */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow }}>
          <VehicleDiagram damages={report.returnData ? allReturnDamages : allPreDamages} />
        </div>

        {/* Damage tables */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allPreDamages.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", boxShadow: C.shadow }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 10, textAlign: "end" }}>{t("pages.fleet.previouslyDocumentedDamage", { count: allPreDamages.length })}</p>
              {allPreDamages.filter(d => !d.isNew).map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, border: `1.5px solid ${C.gold}` }} />
                    <span style={{ fontSize: 10, color: C.sub }}>{t(DAMAGE_KIND_KEYS[d.kind])}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{t(DAMAGE_ZONE_KEYS[d.zone])}</span>
                </div>
              ))}
            </div>
          )}

          {newDamagesOnly.length > 0 && (
            <div style={{ background: "#FDF5F5", border: "1px solid #ECC8C8", borderRadius: 16, padding: "16px 18px", boxShadow: C.shadow }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8B2020", marginBottom: 10, textAlign: "end" }}>{t("pages.fleet.newDamageDetected", { count: newDamagesOnly.length })}</p>
              {newDamagesOnly.map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #ECC8C8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#CC3333", border: "2px solid #CC3333" }} />
                    <span style={{ fontSize: 10, color: "#8B2020", fontWeight: 600 }}>{t(DAMAGE_KIND_KEYS[d.kind])}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#8B2020" }}>{t(DAMAGE_ZONE_KEYS[d.zone])}</span>
                </div>
              ))}
            </div>
          )}

          {allPreDamages.length === 0 && newDamagesOnly.length === 0 && (
            <div style={{ background: `${C.mangrove}10`, border: `1px solid ${C.mangrove}30`, borderRadius: 16, padding: "18px", textAlign: "end" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.mangrove }}>{t("pages.fleet.noDamageRecorded")}</p>
                <CheckCircle size={16} strokeWidth={1.5} style={{ color: C.mangrove }} />
              </div>
              <p style={{ fontSize: 10.5, color: C.sub, marginTop: 5 }}>{t("pages.fleet.noDamageDesc")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver evaluation */}
      {report.evaluation && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t("pages.fleet.driverPerformanceEval")}</p>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: `${C.gold}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={13} strokeWidth={1.5} style={{ color: C.gold }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {([
              { label: t("pages.fleet.eval.commitment"), val: report.evaluation.commitment },
              { label: t("pages.fleet.eval.punctuality"), val: report.evaluation.punctuality },
              { label: t("pages.fleet.eval.cleanliness"), val: report.evaluation.cleanliness },
              { label: t("pages.fleet.eval.vehicleCare"), val: report.evaluation.vehicleCare },
            ] as Array<{ label: string; val: number }>).map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.bg, borderRadius: 10 }}>
                <Stars value={val} />
                <span style={{ fontSize: 11, color: C.text }}>{label}</span>
              </div>
            ))}
          </div>
          {report.evaluation.notes && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#F3E7D7", borderRadius: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: C.gold, marginBottom: 3 }}>{t("pages.fleet.evalNotes")}</p>
              <p style={{ fontSize: 10.5, color: C.text, lineHeight: 1.55 }}>{report.evaluation.notes}</p>
            </div>
          )}
          {/* Overall score */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <div style={{ padding: "8px 18px", background: `${C.gold}12`, border: `1px solid ${C.goldLight}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>
                {((report.evaluation.commitment + report.evaluation.punctuality + report.evaluation.cleanliness + report.evaluation.vehicleCare) / 4).toFixed(1)}
              </span>
              <span style={{ fontSize: 11, color: C.sub }}>{t("pages.fleet.overallAverage")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Export actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, border: `1.5px solid ${C.gold}`, background: "transparent", color: C.gold, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Download size={13} strokeWidth={1.5} />
          {t("pages.fleet.exportPdf")}
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.sub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <FileText size={13} strokeWidth={1.5} />
          {t("pages.fleet.exportExcel")}
        </button>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.sub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <Printer size={13} strokeWidth={1.5} />
          {t("pages.fleet.print")}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Inspection tab ─────────────────────────────────────────── */
export function InspectionTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [openReport, setOpenReport] = useState<string | null>(null);

  const filtered = INSPECTION_REPORTS.filter(r =>
    !search || r.vehiclePlate.includes(search) || r.driverName.includes(search) || r.event.includes(search)
  );

  const report = openReport ? INSPECTION_REPORTS.find(r => r.id === openReport) : null;

  if (report) return <InspectionDetail report={report} onBack={() => setOpenReport(null)} />;

  const newDamageCount = INSPECTION_REPORTS.filter(r => r.returnData?.damages?.some(d => d.isNew)).length;
  const doneCount = INSPECTION_REPORTS.filter(r => r.step === 6).length;

  return (
    <div>
      {/* Mini KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: t("pages.fleet.inspectionKpis.totalReports"), value: INSPECTION_REPORTS.length, color: C.gold },
          { label: t("pages.fleet.inspectionKpis.completedReports"), value: doneCount, color: C.mangrove },
          { label: t("pages.fleet.inspectionKpis.awaitingReturn"), value: INSPECTION_REPORTS.filter(r => r.step < 4).length, color: C.teal },
          { label: t("pages.fleet.inspectionKpis.damageDetected"), value: newDamageCount, color: "#CC3333" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 130, background: C.card, border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: "12px 16px", boxShadow: C.shadow, textAlign: "end" }}>
            <p style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      <SectionHeader title={t("pages.fleet.inspection.title")} addLabel={t("pages.fleet.inspection.newReport")} onAdd={() => {}} search={search} onSearch={setSearch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(r => (
          <InspectionCard key={r.id} report={r} onOpen={() => setOpenReport(r.id)} />
        ))}
      </div>
    </div>
  );
}
