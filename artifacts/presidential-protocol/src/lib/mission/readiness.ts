import type { Blueprint, OperationalRelationship } from "./types";

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
const W = { critical: 3, high: 2, medium: 1.5, low: 1 } as const;

/** Readiness is a *result*, computed from streams, dependencies and risks. */
export function computeReadiness(blueprint: Blueprint, rels: OperationalRelationship[]): {
  overall: number; confidence: number;
} {
  let num = 0, den = 0;
  for (const s of blueprint.streams) { num += s.readiness * W[s.priority]; den += W[s.priority]; }
  let overall = den ? num / den : 0;

  const blockingBlocked = rels.filter((r) => r.blocking && r.status === "blocked").length;
  const atRisk = rels.filter((r) => r.status === "atRisk").length;
  const highRisks = blueprint.risks.filter((r) => r.severity === "high" || r.severity === "veryHigh").length;
  overall -= blockingBlocked * 3 + atRisk * 1.5 + highRisks * 1.5;

  const blockedStreams = blueprint.streams.filter((s) => s.status === "blocked").length;
  const confidence = clamp(100 - blockedStreams * 8 - highRisks * 6 - blockingBlocked * 4, 40, 99);

  return { overall: clamp(overall), confidence };
}
