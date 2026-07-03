import { COUNTRIES } from "@workspace/reference";
import type { Bi, CockpitState, Mission, MissionBrief, MissionContext, MissionType } from "./types";
import { resolveDNA } from "./dna";
import { buildBlueprint } from "./blueprint";
import { buildRelationships } from "./relationships";
import { buildResources } from "./resources";
import { computeReadiness } from "./readiness";
import { analyze, recommendDepartments } from "./intelligence";
import { LIFECYCLE, currentPhase } from "./lifecycle";
import { getMemory } from "./memory";
import { PLAYBOOKS } from "./playbooks";
import { buildHealth } from "./health";
import { executiveRecommendations } from "./recommendations";
import { buildSummary } from "./summary";
import { buildScenarios } from "./simulator";
import { buildDecisions } from "./decisions";
import { computeCriticalPath } from "./critical-path";
import { buildVerdict, buildCountdown, buildNarrative, buildNotifications, buildPredictions, buildDailyBrief, buildPresence } from "./executive";
import { buildCommandIntel } from "./executive2";

export * from "./types";
export { MISSION_DNA, resolveDNA } from "./dna";
export { PLAYBOOKS } from "./playbooks";
export { LIFECYCLE } from "./lifecycle";
export { buildDepartmentDetail } from "./department-detail";
export { simulateReadiness } from "./simulator";

/** Assemble the full mission from a context (the engine entrypoint). */
export function buildMission(ctx: MissionContext): Mission {
  const dna = resolveDNA(ctx);
  const blueprint = buildBlueprint(ctx, dna);
  const relationships = buildRelationships(blueprint);
  const resources = buildResources(blueprint);
  const { overall, confidence } = computeReadiness(blueprint, relationships);
  const intel = analyze(ctx, dna, blueprint);
  const recommendations = recommendDepartments(blueprint, dna);
  const playbooks = PLAYBOOKS.filter((p) => blueprint.streams.some((s) => s.deptKey === p.deptKey));

  const blockedStreams = blueprint.streams.filter((s) => s.status === "blocked");
  const phase = currentPhase(overall, blockedStreams.length);
  const criticalRisks = blueprint.risks.filter((r) => r.severity === "high" || r.severity === "veryHigh").length;
  const protocolConflicts: Bi[] = relationships.filter((r) => r.blocking && r.status === "blocked").map((r) => r.reason);
  const resourceConflicts: Bi[] = resources.flatMap((g) => g.items.filter((i) => !i.allocated).map((i) => i.label));

  const cockpit: CockpitState = {
    readiness: overall,
    confidence,
    phase,
    criticalRisks,
    decisionsRequired: blueprint.decisions.length,
    blockingDepartments: blockedStreams.map((s) => s.deptKey),
    protocolConflicts,
    resourceConflicts,
    aiRecommendation: {
      en: "Approve Option B for the arrival sequence and clear official titles to unblock media.",
      ar: "اعتماد الخيار (ب) لتسلسل الوصول واعتماد الألقاب الرسمية لرفع الحجب عن الإعلام.",
    },
    nextAction: blueprint.decisions[0]?.label ?? { en: "Review readiness", ar: "مراجعة الجاهزية" },
  };

  const execRecs = executiveRecommendations(blueprint);
  const decisions = buildDecisions(blueprint);
  const countdown = buildCountdown(ctx, overall, blueprint.milestones.filter((m) => m.offsetDays < 0).length);
  const newBlockers = relationships.filter((r) => r.blocking && r.status === "blocked").length;
  const presence = buildPresence(blueprint);

  return {
    ctx, dna, blueprint, relationships, playbooks, resources,
    intel, recommendations,
    lifecycle: { phases: LIFECYCLE, current: phase },
    memory: getMemory(ctx),
    cockpit,
    health: buildHealth(blueprint, resources, overall, confidence, dna),
    execRecommendations: execRecs,
    summary: buildSummary(ctx, dna, blueprint),
    simScenarios: buildScenarios(),
    verdict: buildVerdict(relationships, overall),
    countdown,
    decisions,
    criticalPath: computeCriticalPath(blueprint, relationships),
    narrative: buildNarrative(overall, confidence, relationships),
    notifications: buildNotifications(),
    predictions: buildPredictions(),
    dailyBrief: buildDailyBrief(countdown, overall, decisions, execRecs[0], newBlockers),
    presence,
    command: buildCommandIntel({ overall, countdown, presence }),
  };
}

const codeFromCountry = (name?: string | null, nameAr?: string | null): string | undefined => {
  if (!name && !nameAr) return undefined;
  return COUNTRIES.find((c) => c.nameEn === name || c.nameAr === (nameAr ?? name))?.code;
};

const mapEventType = (t?: string | null): MissionType => {
  const v = (t ?? "").toLowerCase();
  if (v.includes("delegation")) return "delegation";
  if (v.includes("reception")) return "reception";
  if (v.includes("ceremony") || v.includes("national")) return "ceremony";
  if (v.includes("summit")) return "summit";
  if (v.includes("sign")) return "signing";
  if (v.includes("meeting")) return "meeting";
  if (v.includes("internal")) return "internal";
  return "stateVisit";
};

/** Adapter: build a MissionContext from an existing event (reuse, no new data). */
export function missionFromEvent(e: {
  id: number | string; name: string; nameAr?: string | null; date?: string;
  eventType?: string | null; country?: string | null; countryAr?: string | null; vipLevel?: string | null;
}): MissionContext {
  return {
    id: String(e.id),
    source: "event",
    nameEn: e.name,
    nameAr: e.nameAr ?? e.name,
    missionType: mapEventType(e.eventType),
    countryCode: codeFromCountry(e.country, e.countryAr),
    country: e.country ?? undefined,
    countryAr: e.countryAr ?? undefined,
    vipLevel: e.vipLevel ?? undefined,
    date: e.date,
  };
}

/** Build a MissionContext from the executive brief (the engine entry point). */
export function missionFromBrief(b: MissionBrief): MissionContext {
  const c = b.countryCode ? COUNTRIES.find((x) => x.code === b.countryCode) : undefined;
  return {
    id: `brief-${b.nameEn}`,
    source: "event",
    nameEn: b.nameEn,
    nameAr: b.nameAr || b.nameEn,
    missionType: mapEventType(b.eventType),
    countryCode: b.countryCode,
    country: c?.nameEn,
    countryAr: c?.nameAr,
    vipLevel: b.vipLevel,
    category: b.category,
    delegationSize: b.delegationSize,
    priority: b.priority,
    owner: b.owner,
    venue: b.venue,
    date: b.arrivalDate,
    departureDate: b.departureDate,
  };
}

/** Derive a pre-filled brief from an existing event (so review takes seconds). */
export function briefFromEvent(e: {
  name: string; nameAr?: string | null; date?: string; eventType?: string | null;
  country?: string | null; countryAr?: string | null; vipLevel?: string | null;
}): MissionBrief {
  const c = COUNTRIES.find((x) => x.nameEn === e.country || x.nameAr === (e.countryAr ?? e.country));
  return {
    nameEn: e.name,
    nameAr: e.nameAr ?? e.name,
    countryCode: c?.code,
    vipLevel: e.vipLevel ?? "headOfState",
    eventType: e.eventType ?? "stateVisit",
    category: "visit",
    arrivalDate: e.date,
    priority: "high",
  };
}
