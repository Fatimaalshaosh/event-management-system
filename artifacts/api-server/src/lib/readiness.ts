// Pure readiness computation helpers, decoupled from the database so they can be
// unit-tested in isolation.

export function isDone(status: string): boolean {
  return status === "done" || status === "completed";
}

export type ReadinessTaskInput = {
  status: string;
  readinessImpact: number | null;
};

export type ReadinessUpdate = {
  pendingTasksCount: number;
  readinessPercent?: number;
};

// Compute an event's denormalized readiness + pending task count from its tasks.
// Readiness is impact-weighted completion across the event's tasks. When no task
// contributes impact, readinessPercent is left undefined so callers preserve the
// existing (category-based) readiness rather than zeroing it.
export function computeReadinessUpdate(
  tasks: ReadinessTaskInput[],
): ReadinessUpdate {
  const totalImpact = tasks.reduce(
    (sum, t) => sum + (t.readinessImpact ?? 0),
    0,
  );
  const doneImpact = tasks
    .filter((t) => isDone(t.status))
    .reduce((sum, t) => sum + (t.readinessImpact ?? 0), 0);
  const pendingTasksCount = tasks.filter((t) => !isDone(t.status)).length;

  const update: ReadinessUpdate = { pendingTasksCount };
  if (totalImpact > 0) {
    update.readinessPercent = Math.round((doneImpact / totalImpact) * 100);
  }
  return update;
}
