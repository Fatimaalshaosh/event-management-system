import {
  Crown, Landmark, Award, Radio, ClipboardList, CalendarClock, ShoppingCart,
  Wallet, Server, Truck, Wrench, Megaphone, type LucideIcon,
} from "lucide-react";
import { palette } from "@/theme";

const C = palette;

/**
 * Internal organizational structure — the authority's departments, the workflow
 * roles people can hold, and the default event workflow templates. This is
 * static reference data (labels live in i18n under `contacts.departments.*`,
 * `contacts.roles.*`, `contacts.templates.*`, `contacts.responsibilities.*`).
 * Internal users link to a department via `contact.departmentKey` and hold one
 * or more role keys in `contact.workflowRoles` (comma-separated).
 */

export type DeptKey =
  | "chairmanOffice" | "secretaryGeneral" | "protocol" | "operations"
  | "planning" | "agenda" | "procurement" | "finance" | "it" | "logistics"
  | "generalServices" | "media";

export interface Department {
  key: DeptKey;
  icon: LucideIcon;
  color: string;
  headEn: string;
  headAr: string;
  readiness: number;        // demo %
  activeWorkflows: number;  // demo
  pendingTasks: number;     // demo
  roleKeys: string[];       // primary workflow roles for the department
  responsibilities: string[]; // responsibility keys (i18n)
}

export const DEPARTMENTS: Department[] = [
  { key: "chairmanOffice",  icon: Crown,        color: C.gold,       headEn: "Khalifa Al Mheiri", headAr: "خليفة المهيري", readiness: 96, activeWorkflows: 3, pendingTasks: 1, roleKeys: ["executiveApprover", "finalApprover", "reportViewer"], responsibilities: ["finalApproval"] },
  { key: "secretaryGeneral", icon: Landmark,    color: C.castleHill, headEn: "Mariam Al Suwaidi", headAr: "مريم السويدي", readiness: 92, activeWorkflows: 4, pendingTasks: 2, roleKeys: ["sectorApprover", "executiveApprover", "reportViewer"], responsibilities: ["executiveCoordination"] },
  { key: "protocol",        icon: Award,        color: C.mangrove,   headEn: "Layla Al Mansoori", headAr: "ليلى المنصوري", readiness: 88, activeWorkflows: 6, pendingTasks: 5, roleKeys: ["protocolLead", "eventOwner", "taskOwner"], responsibilities: ["vipReception", "seatingGifts", "protocolBrief"] },
  { key: "operations",      icon: Radio,        color: C.calmTeal,   headEn: "Saif Al Dhaheri",   headAr: "سيف الظاهري", readiness: 84, activeWorkflows: 5, pendingTasks: 4, roleKeys: ["operationsLead", "securityCoordinator", "taskOwner"], responsibilities: ["liveOps"] },
  { key: "planning",        icon: ClipboardList, color: C.mediumWood, headEn: "Noura Al Kaabi",    headAr: "نورة الكعبي", readiness: 81, activeWorkflows: 5, pendingTasks: 6, roleKeys: ["planningLead", "readinessLead", "taskOwner"], responsibilities: ["timelineRisks", "readiness"] },
  { key: "agenda",          icon: CalendarClock, color: C.teal,      headEn: "Hamad Al Falasi",   headAr: "حمد الفلاسي", readiness: 90, activeWorkflows: 3, pendingTasks: 2, roleKeys: ["eventOwner", "taskOwner"], responsibilities: ["scheduleMeetings"] },
  { key: "procurement",     icon: ShoppingCart, color: C.sunset,     headEn: "Ahmed Al Marri",    headAr: "أحمد المرّي", readiness: 78, activeWorkflows: 2, pendingTasks: 3, roleKeys: ["procurementReviewer", "taskOwner"], responsibilities: ["vendorsContracts"] },
  { key: "finance",         icon: Wallet,       color: C.green,      headEn: "Fatima Al Hosani",  headAr: "فاطمة الحوسني", readiness: 86, activeWorkflows: 2, pendingTasks: 2, roleKeys: ["financeReviewer", "taskOwner"], responsibilities: ["budgetPayments"] },
  { key: "it",              icon: Server,       color: C.castleHill, headEn: "Yousef Al Blooshi", headAr: "يوسف البلوشي", readiness: 89, activeWorkflows: 4, pendingTasks: 3, roleKeys: ["itSupportLead", "aiAdmin", "taskOwner"], responsibilities: ["systemsSupport"] },
  { key: "logistics",       icon: Truck,        color: C.mediumWood, headEn: "Rashid Al Nuaimi",  headAr: "راشد النعيمي", readiness: 83, activeWorkflows: 5, pendingTasks: 5, roleKeys: ["logisticsLead", "flightCoordinator", "hotelCoordinator", "fleetCoordinator"], responsibilities: ["travelTransport"] },
  { key: "generalServices", icon: Wrench,       color: C.warmGray,   headEn: "Salem Al Ameri",    headAr: "سالم العامري", readiness: 80, activeWorkflows: 4, pendingTasks: 4, roleKeys: ["taskOwner"], responsibilities: ["venueCatering"] },
  { key: "media",           icon: Megaphone,    color: C.sunset,     headEn: "Hessa Al Qubaisi",  headAr: "حصة القبيسي", readiness: 85, activeWorkflows: 3, pendingTasks: 3, roleKeys: ["mediaLead", "taskOwner"], responsibilities: ["mediaCoverage"] },
];

export const DEPARTMENT_BY_KEY: Record<string, Department> =
  Object.fromEntries(DEPARTMENTS.map((d) => [d.key, d]));

/** All assignable workflow roles. */
export const WORKFLOW_ROLES = [
  "executiveApprover", "finalApprover", "sectorApprover", "protocolLead", "eventOwner",
  "planningLead", "readinessLead", "operationsLead", "logisticsLead", "flightCoordinator",
  "hotelCoordinator", "fleetCoordinator", "procurementReviewer", "financeReviewer", "mediaLead",
  "itSupportLead", "securityCoordinator", "taskOwner", "reportViewer", "aiAdmin",
] as const;

/** Roles offered when assigning an event lead/approver (a curated subset). */
export const EVENT_ASSIGN_ROLES = [
  "eventOwner", "protocolLead", "planningLead", "logisticsLead", "operationsLead",
  "mediaLead", "itSupportLead", "financeReviewer", "procurementReviewer", "finalApprover",
];

export interface TemplateStep { dept: DeptKey; responsibility: string }
export interface WorkflowTemplate { key: string; steps: TemplateStep[] }

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    key: "officialVisit",
    steps: [
      { dept: "chairmanOffice", responsibility: "finalApproval" },
      { dept: "secretaryGeneral", responsibility: "executiveCoordination" },
      { dept: "protocol", responsibility: "vipReception" },
      { dept: "operations", responsibility: "liveOps" },
      { dept: "planning", responsibility: "timelineRisks" },
      { dept: "agenda", responsibility: "scheduleMeetings" },
      { dept: "logistics", responsibility: "travelTransport" },
      { dept: "generalServices", responsibility: "venueCatering" },
      { dept: "it", responsibility: "systemsSupport" },
      { dept: "media", responsibility: "mediaCoverage" },
      { dept: "procurement", responsibility: "vendorsContracts" },
      { dept: "finance", responsibility: "budgetPayments" },
    ],
  },
  {
    key: "internalEvent",
    steps: [
      { dept: "planning", responsibility: "timelineRisks" },
      { dept: "operations", responsibility: "liveOps" },
      { dept: "generalServices", responsibility: "venueCatering" },
      { dept: "it", responsibility: "systemsSupport" },
      { dept: "media", responsibility: "mediaCoverage" },
      { dept: "finance", responsibility: "budgetPayments" },
      { dept: "procurement", responsibility: "vendorsContracts" },
    ],
  },
  {
    key: "delegationVisit",
    steps: [
      { dept: "protocol", responsibility: "vipReception" },
      { dept: "agenda", responsibility: "scheduleMeetings" },
      { dept: "logistics", responsibility: "travelTransport" },
      { dept: "operations", responsibility: "liveOps" },
      { dept: "media", responsibility: "mediaCoverage" },
      { dept: "it", responsibility: "systemsSupport" },
      { dept: "generalServices", responsibility: "venueCatering" },
      { dept: "chairmanOffice", responsibility: "finalApproval" },
      { dept: "secretaryGeneral", responsibility: "executiveCoordination" },
    ],
  },
];

/** Which templates a department participates in (by template key). */
export function templatesForDept(dept: string): string[] {
  return WORKFLOW_TEMPLATES.filter((t) => t.steps.some((s) => s.dept === dept)).map((t) => t.key);
}

export const AVAILABILITY = ["available", "busy", "leave"] as const;
export const availabilityColor: Record<string, string> = {
  available: C.mangrove,
  busy: C.sunset,
  leave: C.warmGray,
};

export const parseRoles = (csv?: string | null): string[] =>
  (csv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
