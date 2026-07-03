import type { DeptKey } from "@/components/contacts/org-structure";
import type { Blueprint, OperationalRelationship } from "./types";

/** The true critical path — the chain of blocking/at-risk dependencies that
 * gates the mission, ordered by readiness impact (root cause first). */
export function computeCriticalPath(blueprint: Blueprint, rels: OperationalRelationship[]): DeptKey[] {
  const edges = rels
    .filter((r) => r.blocking || r.status === "atRisk")
    .slice()
    .sort((a, b) => b.readinessImpact - a.readinessImpact);
  const order: DeptKey[] = [];
  const push = (d: DeptKey) => { if (!order.includes(d)) order.push(d); };
  for (const e of edges) { push(e.source); push(e.target); }
  blueprint.streams.filter((s) => s.status === "blocked").forEach((s) => push(s.deptKey));
  return order.slice(0, 5);
}
