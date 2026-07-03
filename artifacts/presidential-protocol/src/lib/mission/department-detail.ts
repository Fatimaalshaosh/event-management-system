import { DEPARTMENT_BY_KEY, type DeptKey } from "@/components/contacts/org-structure";
import type { Bi, DepartmentDetail, DeptEmployee, Mission } from "./types";

// Fictional demo staff pool (no real personal data).
const NAMES: Bi[] = [
  { en: "Mohammed Al Hammadi", ar: "محمد الحمادي" },
  { en: "Sara Al Shamsi", ar: "سارة الشامسي" },
  { en: "Ali Al Zaabi", ar: "علي الزعابي" },
  { en: "Maitha Al Marri", ar: "ميثاء المرّي" },
  { en: "Khalid Al Suwaidi", ar: "خالد السويدي" },
  { en: "Aisha Al Nuaimi", ar: "عائشة النعيمي" },
  { en: "Omar Al Falasi", ar: "عمر الفلاسي" },
  { en: "Reem Al Ketbi", ar: "ريم الكتبي" },
];
const ROLES: Bi[] = [
  { en: "Senior Officer", ar: "ضابط أول" },
  { en: "Coordinator", ar: "منسّق" },
  { en: "Specialist", ar: "أخصائي" },
];
const DEPT_KEYS = Object.keys(DEPARTMENT_BY_KEY);

/** Build the executive operations detail for one department within a mission. */
export function buildDepartmentDetail(mission: Mission, deptKey: DeptKey): DepartmentDetail | null {
  const stream = mission.blueprint.streams.find((s) => s.deptKey === deptKey);
  if (!stream) return null;
  const dept = DEPARTMENT_BY_KEY[deptKey];
  const di = Math.max(0, DEPT_KEYS.indexOf(deptKey));
  const head: Bi = { en: dept?.headEn ?? "", ar: dept?.headAr ?? "" };

  const employees: DeptEmployee[] = [
    { name: head, role: { en: "Department Head", ar: "رئيس القسم" }, availability: stream.status === "blocked" ? "busy" : "available" },
    ...[0, 1].map((i) => ({
      name: NAMES[(di * 2 + i) % NAMES.length],
      role: ROLES[i % ROLES.length],
      availability: (di + i) % 3 === 0 ? "busy" : "available",
    })),
  ];

  return {
    deptKey,
    head,
    readiness: stream.readiness,
    status: stream.status,
    employees,
    dependencies: mission.relationships.filter((r) => r.source === deptKey || r.target === deptKey),
    risks: mission.blueprint.risks.filter((r) => r.deptKey === deptKey),
    approvals: mission.blueprint.approvals.slice(0, 2),
    documents: mission.blueprint.documents.slice(0, 3),
    playbook: mission.playbooks.find((p) => p.deptKey === deptKey)?.items ?? [],
    subOperations: stream.actions,
    notifications: [
      { en: "Department head notified of mission assignment", ar: "تم إخطار رئيس القسم بتكليف المهمة" },
      { en: "2 members pending acceptance", ar: "عضوان بانتظار القبول" },
    ],
  };
}
