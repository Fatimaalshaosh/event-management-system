import type { DeptKey } from "@/components/contacts/org-structure";

/**
 * Executive Mission Engine — domain model.
 *
 * Source-agnostic: a Mission is built from a `MissionContext` (which can be
 * adapted from an event, official visit, delegation, ceremony, fleet op, etc.),
 * never from a single module. All *content* strings are bilingual (`Bi`) so they
 * render correctly in AR/EN without i18n churn; fixed taxonomy + UI chrome live
 * in i18n (`missionEngine.*`). Phase 1 is demo logic; nothing is persisted.
 */

export interface Bi { en: string; ar: string }
export type Level = "veryHigh" | "high" | "medium" | "low";

export type MissionType =
  | "stateVisit" | "presidentialVisit" | "delegation" | "reception"
  | "signing" | "meeting" | "ceremony" | "summit" | "internal" | "operation";

export type MissionSource =
  | "event" | "visit" | "delegation" | "ceremony" | "fleet" | "procurement" | "decision";

export interface MissionContext {
  id: string;
  source: MissionSource;
  nameEn: string;
  nameAr: string;
  missionType: MissionType;
  countryCode?: string;
  country?: string;
  countryAr?: string;
  vipLevel?: string;          // headOfState | minister | ambassador | seniorOfficial | standard
  category?: string;          // visit | ceremony | summit | reception | internal
  delegationSize?: number;
  priority?: string;          // routine | high | critical | flagship
  owner?: string;             // mission owner (free text demo)
  venue?: string;
  date?: string;              // arrival
  departureDate?: string;
}

/** The minimal executive brief — the entry point of the Mission Engine. */
export interface MissionBrief {
  nameEn: string;
  nameAr: string;
  countryCode?: string;
  vipLevel: string;
  eventType: string;
  category: string;
  arrivalDate?: string;
  departureDate?: string;
  venue?: string;
  delegationSize?: number;
  priority: string;
  owner?: string;
}

/* ── DNA ──────────────────────────────────────────────── */
export interface MissionDNA {
  key: string;
  label: Bi;
  countryCode?: string;
  vipLevel: string;
  protocolLevel: Level;
  securityLevel: Level;
  mediaLevel: "international" | "national" | "internal";
  riskSensitivity: Level;
  language?: Bi;
  interpreterRequired: boolean;
  giftsRequired: boolean;
  fleetRequired: boolean;
  hotelRequired: boolean;
  airportProtocolRequired: boolean;
  culturalConsiderations: boolean;
  previousVisitMemory: boolean;
  specialProtocolRules: boolean;
  traits: Bi[];
}

/* ── Blueprint ────────────────────────────────────────── */
export type StreamStatus = "notStarted" | "inProgress" | "blocked" | "ready";
export type Priority = "critical" | "high" | "medium" | "low";

export interface MissionStream {
  deptKey: DeptKey;
  priority: Priority;
  readiness: number;          // 0..100 (demo)
  risk: Level;
  status: StreamStatus;
  lead: Bi;                   // department head
  actions: Bi[];             // required actions
}

export interface Milestone { label: Bi; offsetDays: number }   // relative to mission date
export interface DecisionItem { label: Bi; deptKey?: DeptKey; urgent: boolean }
export interface RiskItem { label: Bi; severity: Level; deptKey?: DeptKey }

export interface Blueprint {
  streams: MissionStream[];
  obligations: Bi[];
  approvals: Bi[];
  documents: Bi[];
  briefings: Bi[];
  milestones: Milestone[];
  decisions: DecisionItem[];
  risks: RiskItem[];
}

/* ── Operational relationships ────────────────────────── */
export type RelationshipType =
  | "depends_on" | "blocks" | "requires_approval_from" | "provides_input_to"
  | "must_finish_before" | "triggers" | "escalates_to" | "informs" | "validates";

export type RelationshipStatus = "open" | "satisfied" | "atRisk" | "blocked";

export interface OperationalRelationship {
  id: string;
  source: DeptKey;
  target: DeptKey;
  type: RelationshipType;
  reason: Bi;
  status: RelationshipStatus;
  risk: Level;
  blocking: boolean;
  readinessImpact: number;
}

/* ── Playbooks ────────────────────────────────────────── */
export interface DepartmentPlaybook { deptKey: DeptKey; items: Bi[] }

/* ── Resources ────────────────────────────────────────── */
export type ResourceType =
  | "person" | "vehicle" | "driver" | "venue" | "room" | "gift"
  | "document" | "approval" | "equipment" | "lounge" | "escort" | "time";

export interface ResourceItem { label: Bi; type: ResourceType; allocated: boolean }
export interface ResourceGroup { label: Bi; deptKey: DeptKey; items: ResourceItem[] }

/* ── Intelligence + recommendations ───────────────────── */
export interface IntelItem { question: Bi; answer: Bi; status: "ok" | "warn" | "info" }

export interface DeptRecommendation {
  deptKey: DeptKey;
  priority: Priority;
  readinessImpact: number;
  reasons: Bi[];
  lead: Bi;
  teamRoleKeys: string[];     // role keys → contacts.roles.*
  workloadRisk: Level;
}

/* ── Lifecycle ────────────────────────────────────────── */
export type LifecyclePhaseKey =
  | "draft" | "analysis" | "blueprint" | "planning" | "coordination"
  | "allocation" | "readinessReview" | "approval" | "execution" | "closeout" | "afterAction";

export interface LifecyclePhase { key: LifecyclePhaseKey; gates: Bi[] }

/* ── Diplomatic memory ────────────────────────────────── */
export interface DiplomaticMemory {
  countryCode: string;
  previousVisits: Bi[];
  previousGifts: Bi[];
  preferences: Bi[];
  cultural: Bi[];
  reciprocity: Bi[];
  lessons: Bi[];
  // Expanded executive intelligence memory (optional)
  preferredProtocol?: Bi[];
  meetingPreferences?: Bi[];
  interpreterHistory?: Bi[];
  seating?: Bi[];
  meals?: Bi[];
  religious?: Bi[];
  securityPrefs?: Bi[];
  mediaRestrictions?: Bi[];
  transportPrefs?: Bi[];
  executiveRelationships?: Bi[];
  commonRisks?: Bi[];
}

/* ── Executive health + recommendations + blueprint summary ─────── */
export interface HealthDimension { key: string; value: number; status: "good" | "watch" | "risk" }
export interface MissionHealth { overall: number; dimensions: HealthDimension[] }

export interface ExecRecommendation {
  action: Bi;
  reason: Bi;
  impact: number;            // +readiness %
  riskReduction: Level;
  timeSavedHours: number;
}

export interface BlueprintSummary {
  objective: Bi;
  complexity: Level;
  streamsCount: number;
  requiredDepts: number;
  optionalDepts: number;
  assets: Bi[];
  deliverables: Bi[];
  successCriteria: Bi[];
  executiveNotes: Bi[];
}

export interface DeptEmployee { name: Bi; role: Bi; availability: string }
export interface DepartmentDetail {
  deptKey: DeptKey;
  head: Bi;
  readiness: number;
  status: StreamStatus;
  employees: DeptEmployee[];
  dependencies: OperationalRelationship[];
  risks: RiskItem[];
  approvals: Bi[];
  documents: Bi[];
  playbook: Bi[];
  subOperations: Bi[];
  notifications: Bi[];
}

export interface SimScenario { key: string; label: Bi; deltaReadiness: number; active: boolean }

/* ── Executive decision layer (Phase 1.6) ─────────────── */
export type VerdictLevel = "ready" | "atRisk" | "blocked";
export interface Verdict { level: VerdictLevel; headline: Bi; reason: Bi; action: Bi; impact: Bi }

export interface Countdown {
  days: number; hours: number; label: Bi;
  projectedReadiness: number; pace: Bi; remainingMilestones: number;
}

export interface Decision {
  id: string; title: Bi; deptKey?: DeptKey; deadline: Bi;
  impact: number; unlocks: DeptKey[]; risk: Level; recommendation: Bi; timeSavedHours: number;
}

export interface Narrative { readiness: Bi; risks: Bi[]; confidence: Bi; confidenceReasons: Bi[] }

export interface ExecNotification {
  id: string; title: Bi; impact: Bi; departments: DeptKey[]; action: Bi; severity: "info" | "warn" | "risk";
}

export interface Prediction { text: Bi; confidence: Level }

export interface DailyBrief {
  greeting: Bi; countdown: Countdown;
  yesterdayReadiness: number; currentReadiness: number;
  completedYesterday: number; newBlockers: number; decisionsRequired: number;
  recommendation: Bi; projectedAfter: number;
}

/** A department's human owner snapshot for the cockpit/critical path. */
export interface DeptPresence {
  deptKey: DeptKey; owner: Bi; availability: string; workload: number; eta: Bi; waitingOn: Bi | null;
}

/* ── Command-center intelligence (Phase 1.7) ──────────── */
export type Tone = "good" | "warn" | "risk" | "info";
export interface RibbonItem { key: string; value: Bi; tone: Tone; live?: boolean }
export interface SituationMetric { key: string; value: string; tone: Tone }
export interface StoryEvent { time: string; text: Bi; tone: "good" | "warn" | "info" }
export interface KPI { key: string; value: string; trend: "up" | "down" | "flat"; tone: "good" | "watch" | "risk" }
export interface ReadinessForecast { key: string; value: number; confidence: Level }
export interface LogEntry { id: string; time: string; type: string; text: Bi }
export interface HeatCell { deptKey: DeptKey; load: number; state: "overloaded" | "busy" | "normal" | "idle" }
export interface AssistantAction { key: string; output: Bi }
export interface CommandIntel {
  story: StoryEvent[];
  predictive: ReadinessForecast[];
  opsLog: LogEntry[];
  heatmap: HeatCell[];
  assistant: AssistantAction[];
}

/* ── Cockpit + assembled mission ──────────────────────── */
export interface CockpitState {
  readiness: number;
  confidence: number;
  phase: LifecyclePhaseKey;
  criticalRisks: number;
  decisionsRequired: number;
  blockingDepartments: DeptKey[];
  protocolConflicts: Bi[];
  resourceConflicts: Bi[];
  aiRecommendation: Bi;
  nextAction: Bi;
}

export interface Mission {
  ctx: MissionContext;
  dna: MissionDNA;
  blueprint: Blueprint;
  relationships: OperationalRelationship[];
  playbooks: DepartmentPlaybook[];
  resources: ResourceGroup[];
  intel: IntelItem[];
  recommendations: DeptRecommendation[];
  lifecycle: { phases: LifecyclePhase[]; current: LifecyclePhaseKey };
  memory: DiplomaticMemory | null;
  cockpit: CockpitState;
  health: MissionHealth;
  execRecommendations: ExecRecommendation[];
  summary: BlueprintSummary;
  simScenarios: SimScenario[];
  verdict: Verdict;
  countdown: Countdown;
  decisions: Decision[];
  criticalPath: DeptKey[];
  narrative: Narrative;
  notifications: ExecNotification[];
  predictions: Prediction[];
  dailyBrief: DailyBrief;
  presence: DeptPresence[];
  command: CommandIntel;
}
