import type { Blueprint, HealthDimension, Level, MissionDNA, MissionHealth, ResourceGroup } from "./types";

const RISK_SCORE: Record<Level, number> = { veryHigh: 85, high: 65, medium: 45, low: 25 };
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const statusFor = (v: number): HealthDimension["status"] => (v >= 85 ? "good" : v >= 70 ? "watch" : "risk");

/** Executive mission health — a composite of operational dimensions (demo). */
export function buildHealth(
  blueprint: Blueprint, resources: ResourceGroup[], readiness: number, confidence: number, dna: MissionDNA,
): MissionHealth {
  const sr = (k: string) => blueprint.streams.find((s) => s.deptKey === k)?.readiness ?? 80;
  const avg = blueprint.streams.reduce((s, x) => s + x.readiness, 0) / (blueprint.streams.length || 1);
  const totalRes = resources.reduce((s, g) => s + g.items.length, 0);
  const allocRes = resources.reduce((s, g) => s + g.items.filter((i) => i.allocated).length, 0);
  const resourcePct = totalRes ? (allocRes / totalRes) * 100 : 90;

  const dimensions: HealthDimension[] = [
    { key: "operational", value: clamp(avg) },
    { key: "protocol", value: clamp(sr("protocol")) },
    { key: "media", value: clamp(sr("media")) },
    { key: "security", value: clamp(sr("operations")) },
    { key: "transport", value: clamp(sr("logistics")) },
    { key: "resource", value: clamp(resourcePct) },
    { key: "budget", value: clamp(sr("finance")) },
    { key: "timeline", value: clamp(confidence) },
    { key: "diplomatic", value: clamp(100 - RISK_SCORE[dna.riskSensitivity]) },
    { key: "weather", value: 88 },
  ].map((d) => ({ ...d, status: statusFor(d.value) }));

  const avgDims = dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length;
  const overall = clamp(readiness * 0.5 + confidence * 0.2 + avgDims * 0.3);
  return { overall, dimensions };
}
