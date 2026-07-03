import type { Blueprint, ResourceGroup } from "./types";

/** Resource orchestration (demo). A missing item is a readiness gap. */
export function buildResources(blueprint: Blueprint): ResourceGroup[] {
  const has = (k: string) => blueprint.streams.some((s) => s.deptKey === k);
  const groups: ResourceGroup[] = [];

  if (has("logistics") || has("protocol")) {
    groups.push({
      label: { en: "Airport reception", ar: "استقبال المطار" }, deptKey: "logistics",
      items: [
        { label: { en: "Protocol officer", ar: "ضابط مراسم" }, type: "person", allocated: true },
        { label: { en: "VIP vehicle", ar: "مركبة كبار الشخصيات" }, type: "vehicle", allocated: true },
        { label: { en: "Driver", ar: "سائق" }, type: "driver", allocated: true },
        { label: { en: "VIP lounge", ar: "صالة كبار الشخصيات" }, type: "lounge", allocated: true },
        { label: { en: "Security escort", ar: "مرافقة أمنية" }, type: "escort", allocated: false },
        { label: { en: "Confirmed arrival time", ar: "وقت وصول مؤكد" }, type: "time", allocated: false },
      ],
    });
  }
  if (has("logistics")) {
    groups.push({
      label: { en: "Motorcade", ar: "الموكب" }, deptKey: "logistics",
      items: [
        { label: { en: "Lead vehicle", ar: "المركبة القائدة" }, type: "vehicle", allocated: true },
        { label: { en: "Backup vehicle", ar: "مركبة احتياطية" }, type: "vehicle", allocated: true },
        { label: { en: "Route clearance", ar: "تأمين المسار" }, type: "approval", allocated: false },
      ],
    });
  }
  if (has("generalServices") || has("protocol")) {
    groups.push({
      label: { en: "Reception venue", ar: "مكان الاستقبال" }, deptKey: "generalServices",
      items: [
        { label: { en: "Majlis setup", ar: "تجهيز المجلس" }, type: "venue", allocated: true },
        { label: { en: "Seating chart", ar: "مخطط الجلوس" }, type: "document", allocated: false },
        { label: { en: "Catering", ar: "الضيافة" }, type: "venue", allocated: true },
        { label: { en: "Gifts prepared", ar: "تجهيز الهدايا" }, type: "gift", allocated: true },
      ],
    });
  }
  return groups;
}
