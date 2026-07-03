import { palette } from "@/theme";


import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";


import { Search, Plus, Star, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";


/* Extracted from fleet.tsx — shared tokens, types, data, primitives. */
export const C = { ...palette, border: "#E8DED1", shadow: "0 2px 12px rgba(61,53,41,0.09), 0 1px 4px rgba(61,53,41,0.05)" };

/* ─── types ───────────────────────────────────────────────────── */
export type VehicleStatus = "متاحة" | "قيد الصيانة" | "مخصصة" | "خارج الخدمة";
export type DriverStatus = "متاح" | "في مهمة" | "إجازة";
export type AssignmentStatus = "جارية" | "مكتملة" | "قادمة" | "ملغاة";
export type ViolationStatus = "مدفوعة" | "غير مدفوعة" | "قيد المراجعة";

export type Vehicle = {
  id: string; plate: string; type: string; make: string;
  status: VehicleStatus; insurance: string; owner: string;
  inspection: string; nextService: string; color: string;
};
export type Driver = {
  id: string; name: string; phone: string; license: string;
  licenseExpiry: string; status: DriverStatus; assignedVehicle: string;
  rating: number; trips: number;
};
export type Assignment = {
  id: string; event: string; vehicle: string; driver: string;
  departure: string; arrival: string; route: string;
  status: AssignmentStatus; date: string;
};
export type Violation = {
  id: string; number: string; vehicle: string; driver: string;
  date: string; type: string; amount: number; status: ViolationStatus;
};
export type Maintenance = {
  id: string; vehicle: string; plate: string; type: string;
  lastDate: string; nextDate: string; workshop: string;
  cost: number; notes: string; urgent: boolean;
};

/* ─── demo data ───────────────────────────────────────────────── */
export const VEHICLES: Vehicle[] = [
  { id:"v1", plate:"أ ب ج 1001", type:"سيارة مرافقة فاخرة", make:"مرسيدس-بنز S-Class", status:"مخصصة", insurance:"2025/09/15", owner:"ديوان الرئاسة", inspection:"2025/06/01", nextService:"2025/07/10", color:"#1a1a2e" },
  { id:"v2", plate:"أ ب ج 1002", type:"مركبة الوفود", make:"مرسيدس-بنز GLS 600", status:"متاحة", insurance:"2025/11/20", owner:"ديوان الرئاسة", inspection:"2025/08/15", nextService:"2025/08/01", color:"#2d2d2d" },
  { id:"v3", plate:"أ ب ج 1003", type:"مركبة تشريفات", make:"BMW 750Li", status:"متاحة", insurance:"2026/01/05", owner:"وزارة الداخلية", inspection:"2026/03/10", nextService:"2025/09/20", color:"#2d2d2d" },
  { id:"v4", plate:"أ ب ج 1004", type:"مركبة أمنية", make:"لاند كروزر LC300", status:"متاحة", insurance:"2025/07/30", owner:"الحرس الأميري", inspection:"2025/10/20", nextService:"2025/06/30", color:"#2a3a2a" },
  { id:"v5", plate:"أ ب ج 1005", type:"مركبة أمنية", make:"لاند كروزر LC300", status:"قيد الصيانة", insurance:"2026/02/14", owner:"الحرس الأميري", inspection:"2025/12/01", nextService:"2025/05/28", color:"#2a3a2a" },
  { id:"v6", plate:"أ ب ج 1006", type:"حافلة الوفود", make:"مرسيدس-بنز Sprinter", status:"متاحة", insurance:"2025/10/08", owner:"ديوان الرئاسة", inspection:"2025/09/01", nextService:"2025/10/15", color:"#1c1c3a" },
  { id:"v7", plate:"أ ب ج 1007", type:"سيارة مرافقة", make:"Lexus LX 600", status:"قيد الصيانة", insurance:"2025/08/22", owner:"وزارة الخارجية", inspection:"2025/11/10", nextService:"2025/05/20", color:"#2d2d2d" },
  { id:"v8", plate:"أ ب ج 1008", type:"مركبة طبية", make:"Toyota Land Cruiser", status:"متاحة", insurance:"2025/12/31", owner:"ديوان الرئاسة", inspection:"2026/01/15", nextService:"2025/11/01", color:"#f8f8f8" },
];

export const DRIVERS: Driver[] = [
  { id:"d1", name:"أحمد بن سالم المنهالي", phone:"050-111-2233", license:"DXB-4821073", licenseExpiry:"2026/03/15", status:"في مهمة", assignedVehicle:"أ ب ج 1001", rating:4.9, trips:312 },
  { id:"d2", name:"محمد خالد الشامسي", phone:"055-987-6541", license:"DXB-3719284", licenseExpiry:"2025/11/01", status:"متاح", assignedVehicle:"أ ب ج 1002", rating:4.8, trips:287 },
  { id:"d3", name:"سالم راشد الكتبي", phone:"056-234-5678", license:"DXB-6201847", licenseExpiry:"2026/07/20", status:"متاح", assignedVehicle:"أ ب ج 1003", rating:4.7, trips:198 },
  { id:"d4", name:"عبدالله سعيد البلوشي", phone:"050-321-4567", license:"DXB-5510293", licenseExpiry:"2025/06/10", status:"متاح", assignedVehicle:"أ ب ج 1004", rating:4.6, trips:241 },
  { id:"d5", name:"حمدان يوسف الدرعي", phone:"054-876-5432", license:"DXB-7830164", licenseExpiry:"2026/09/30", status:"إجازة", assignedVehicle:"أ ب ج 1006", rating:4.9, trips:356 },
  { id:"d6", name:"خالد عيسى الهاملي", phone:"052-654-3210", license:"DXB-9021758", licenseExpiry:"2025/08/15", status:"متاح", assignedVehicle:"أ ب ج 1008", rating:4.5, trips:175 },
];

export const ASSIGNMENTS: Assignment[] = [
  { id:"a1", event:"استقبال وفد المملكة العربية السعودية", vehicle:"مرسيدس-بنز S-Class • أ ب ج 1001", driver:"أحمد المنهالي", departure:"10:00 ص", arrival:"11:30 ص", route:"المطار → قصر الوطن → فندق إمبريال", status:"جارية", date:"14 مايو 2026" },
  { id:"a2", event:"حفل العشاء الرسمي", vehicle:"مرسيدس-بنز GLS 600 • أ ب ج 1002", driver:"محمد الشامسي", departure:"07:00 م", arrival:"07:45 م", route:"فندق جميرة → قاعة الكرم", status:"قادمة", date:"14 مايو 2026" },
  { id:"a3", event:"اجتماع بروتوكول وزارة الخارجية", vehicle:"BMW 750Li • أ ب ج 1003", driver:"سالم الكتبي", departure:"08:30 ص", arrival:"09:00 ص", route:"مقر الوزارة → قصر الرئاسة", status:"مكتملة", date:"13 مايو 2026" },
  { id:"a4", event:"زيارة وفد الجمهورية الفرنسية", vehicle:"لاند كروزر LC300 • أ ب ج 1004", driver:"عبدالله البلوشي", departure:"02:00 م", arrival:"ملغاة", route:"—", status:"ملغاة", date:"12 مايو 2026" },
  { id:"a5", event:"جولة تفتيشية رسمية — أبوظبي", vehicle:"مرسيدس-بنز Sprinter • أ ب ج 1006", driver:"حمدان الدرعي", departure:"09:00 ص", arrival:"01:00 م", route:"القصر الرئاسي → مناطق التنمية → الميناء", status:"مكتملة", date:"11 مايو 2026" },
];

export const VIOLATIONS: Violation[] = [
  { id:"vl1", number:"ADW-2024-00831", vehicle:"أ ب ج 1005", driver:"غير محدد", date:"2026/04/22", type:"تجاوز السرعة", amount:800, status:"غير مدفوعة" },
  { id:"vl2", number:"ADW-2024-00762", vehicle:"أ ب ج 1007", driver:"خالد الهاملي", date:"2026/04/10", type:"وقوف مخالف", amount:400, status:"مدفوعة" },
  { id:"vl3", number:"ADW-2024-00719", vehicle:"أ ب ج 1002", driver:"محمد الشامسي", date:"2026/03/28", type:"تجاوز الإشارة", amount:1000, status:"قيد المراجعة" },
  { id:"vl4", number:"ADW-2024-00688", vehicle:"أ ب ج 1004", driver:"عبدالله البلوشي", date:"2026/03/15", type:"عدم ربط الحزام", amount:400, status:"مدفوعة" },
  { id:"vl5", number:"ADW-2024-00644", vehicle:"أ ب ج 1001", driver:"أحمد المنهالي", date:"2026/02/20", type:"تجاوز السرعة", amount:600, status:"غير مدفوعة" },
];

export const MAINTENANCE: Maintenance[] = [
  { id:"m1", vehicle:"مرسيدس-بنز S-Class", plate:"أ ب ج 1001", type:"صيانة دورية شاملة", lastDate:"2025/02/10", nextDate:"2025/08/10", workshop:"مركز مرسيدس أبوظبي", cost:4200, notes:"تغيير زيت وفلاتر + فحص شامل", urgent:false },
  { id:"m2", vehicle:"لاند كروزر LC300", plate:"أ ب ج 1005", type:"إصلاح ناقل الحركة", lastDate:"2025/04/05", nextDate:"2025/06/01", workshop:"ورشة التويوتا الرسمية", cost:12500, notes:"تعطّل ناقل الحركة — قيد الإصلاح حالياً", urgent:true },
  { id:"m3", vehicle:"Lexus LX 600", plate:"أ ب ج 1007", type:"إصلاح نظام التبريد", lastDate:"2025/05/01", nextDate:"2025/05/20", workshop:"ورشة لكزس أبوظبي", cost:3800, notes:"تسرب في نظام التبريد — في الورشة", urgent:true },
  { id:"m4", vehicle:"BMW 750Li", plate:"أ ب ج 1003", type:"صيانة دورية", lastDate:"2025/01/20", nextDate:"2025/07/20", workshop:"مركز BMW أبوظبي", cost:3100, notes:"لا ملاحظات", urgent:false },
  { id:"m5", vehicle:"مرسيدس-بنز Sprinter", plate:"أ ب ج 1006", type:"فحص شامل وتبديل إطارات", lastDate:"2025/03/15", nextDate:"2025/09/15", workshop:"مركز مرسيدس أبوظبي", cost:5600, notes:"تبديل 4 إطارات + فحص شامل للأنظمة", urgent:false },
];

/* ─── helpers ─────────────────────────────────────────────────── */
export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, { bg: string; text: string; dot: string }> = {
  "متاحة":        { bg: `${C.mangrove}15`, text: C.mangrove, dot: C.mangrove },
  "مخصصة":       { bg: `${C.teal}18`,     text: "#5a8f8e",  dot: C.teal },
  "قيد الصيانة": { bg: "#F5E6C8",          text: "#8B6914",  dot: "#C9931C" },
  "خارج الخدمة": { bg: "#F5E0E0",          text: "#8B2020",  dot: "#CC3333" },
};
export const DRIVER_STATUS_COLORS: Record<DriverStatus, { bg: string; text: string }> = {
  "متاح":    { bg: `${C.mangrove}15`, text: C.mangrove },
  "في مهمة": { bg: `${C.teal}18`,     text: "#5a8f8e" },
  "إجازة":   { bg: `${C.border}`,     text: C.sub },
};
export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  "جارية":    { bg: `${C.teal}18`,     text: "#5a8f8e",  icon: <Clock size={11} strokeWidth={1.5} /> },
  "مكتملة":   { bg: `${C.mangrove}15`, text: C.mangrove, icon: <CheckCircle size={11} strokeWidth={1.5} /> },
  "قادمة":    { bg: "#F5E6C8",          text: "#8B6914",  icon: <Calendar size={11} strokeWidth={1.5} /> },
  "ملغاة":    { bg: "#F5E0E0",          text: "#8B2020",  icon: <XCircle size={11} strokeWidth={1.5} /> },
};
export const VIOLATION_STATUS_COLORS: Record<ViolationStatus, { bg: string; text: string }> = {
  "مدفوعة":        { bg: `${C.mangrove}15`, text: C.mangrove },
  "غير مدفوعة":    { bg: "#F5E0E0",          text: "#8B2020" },
  "قيد المراجعة":  { bg: "#F5E6C8",          text: "#8B6914" },
};

/* ─── status label keys (display only — Arabic values stay for logic) ─── */
export const VEHICLE_STATUS_KEYS: Record<VehicleStatus, string> = {
  "متاحة": "pages.fleet.vehicleStatus.available",
  "مخصصة": "pages.fleet.vehicleStatus.assigned",
  "قيد الصيانة": "pages.fleet.vehicleStatus.maintenance",
  "خارج الخدمة": "pages.fleet.vehicleStatus.outOfService",
};
export const DRIVER_STATUS_KEYS: Record<DriverStatus, string> = {
  "متاح": "pages.fleet.driverStatus.available",
  "في مهمة": "pages.fleet.driverStatus.onMission",
  "إجازة": "pages.fleet.driverStatus.onLeave",
};
export const ASSIGNMENT_STATUS_KEYS: Record<AssignmentStatus, string> = {
  "جارية": "pages.fleet.assignmentStatus.inProgress",
  "مكتملة": "pages.fleet.assignmentStatus.completed",
  "قادمة": "pages.fleet.assignmentStatus.upcoming",
  "ملغاة": "pages.fleet.assignmentStatus.cancelled",
};
export const VIOLATION_STATUS_KEYS: Record<ViolationStatus, string> = {
  "مدفوعة": "pages.fleet.violationStatus.paid",
  "غير مدفوعة": "pages.fleet.violationStatus.unpaid",
  "قيد المراجعة": "pages.fleet.violationStatus.underReview",
};

export function StatusPill({ label, colors }: { label: string; colors: { bg: string; text: string } }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: colors.bg, color: colors.text }}>
      {label}
    </span>
  );
}

export function RatingDots({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={9} strokeWidth={1} fill={i <= Math.round(rating) ? C.gold : C.border} style={{ color: i <= Math.round(rating) ? C.gold : C.border }} />
      ))}
      <span style={{ fontSize: 10, color: C.sub, marginInlineEnd: 4 }}>{rating}</span>
    </div>
  );
}

/* ─── KPI card ───────────────────────────────────────────────── */
export function KpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: "18px 20px",
        boxShadow: C.shadow, flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column", gap: 8,
        borderTop: `3px solid ${accent}`,
        textAlign: "end",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} strokeWidth={1.5} style={{ color: accent }} />
        </div>
        <p style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{label}</p>
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.sub }}>{sub}</p>}
    </motion.div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
export function SectionHeader({ title, onAdd, addLabel, search, onSearch }: {
  title: string; onAdd?: () => void; addLabel?: string;
  search: string; onSearch: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</p>
      <div style={{ position: "relative", flex: 1, maxWidth: 300, marginInlineEnd: "auto", marginInlineStart: 12 }}>
        <input
          type="text" value={search} onChange={e => onSearch(e.target.value)}
          placeholder={t("pages.fleet.searchPlaceholder")}
          style={{ width: "100%", padding: "9px 36px 9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.text, fontSize: 12, outline: "none", textAlign: "end", fontFamily: "inherit", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = C.gold)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
        <Search size={13} strokeWidth={1.5} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 12, color: C.sub, pointerEvents: "none" }} />
      </div>
      {onAdd && (
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, border: `1.5px solid ${C.gold}`, background: "transparent", color: C.gold, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={13} strokeWidth={2} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

/* ─── Vehicles tab ───────────────────────────────────────────── */
