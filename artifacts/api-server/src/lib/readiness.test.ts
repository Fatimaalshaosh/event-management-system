import { describe, it, expect } from "vitest";
import { computeReadinessUpdate, isDone } from "./readiness";

describe("isDone", () => {
  it("treats done and completed as done", () => {
    expect(isDone("done")).toBe(true);
    expect(isDone("completed")).toBe(true);
  });

  it("treats every other status as not done", () => {
    expect(isDone("pending")).toBe(false);
    expect(isDone("in_progress")).toBe(false);
    expect(isDone("")).toBe(false);
  });
});

describe("computeReadinessUpdate", () => {
  it("computes impact-weighted completion across mixed task impacts", () => {
    const result = computeReadinessUpdate([
      { status: "done", readinessImpact: 30 },
      { status: "completed", readinessImpact: 10 },
      { status: "pending", readinessImpact: 40 },
      { status: "in_progress", readinessImpact: 20 },
    ]);

    // doneImpact = 40, totalImpact = 100 => 40%
    expect(result.readinessPercent).toBe(40);
    expect(result.pendingTasksCount).toBe(2);
  });

  it("rounds impact-weighted completion to the nearest percent", () => {
    const result = computeReadinessUpdate([
      { status: "done", readinessImpact: 1 },
      { status: "pending", readinessImpact: 2 },
    ]);

    // 1 / 3 = 33.33% => 33
    expect(result.readinessPercent).toBe(33);
    expect(result.pendingTasksCount).toBe(1);
  });

  it("reports full readiness when all tasks are done", () => {
    const result = computeReadinessUpdate([
      { status: "done", readinessImpact: 5 },
      { status: "completed", readinessImpact: 15 },
    ]);

    expect(result.readinessPercent).toBe(100);
    expect(result.pendingTasksCount).toBe(0);
  });

  it("preserves existing readiness when there are no tasks", () => {
    const result = computeReadinessUpdate([]);

    expect(result.readinessPercent).toBeUndefined();
    expect(result.pendingTasksCount).toBe(0);
  });

  it("preserves existing readiness when tasks contribute zero impact", () => {
    const result = computeReadinessUpdate([
      { status: "pending", readinessImpact: 0 },
      { status: "done", readinessImpact: 0 },
    ]);

    expect(result.readinessPercent).toBeUndefined();
    // Still counts pending tasks even when impact is zero.
    expect(result.pendingTasksCount).toBe(1);
  });

  it("treats null impact as zero when summing", () => {
    const result = computeReadinessUpdate([
      { status: "done", readinessImpact: null },
      { status: "done", readinessImpact: 10 },
      { status: "pending", readinessImpact: null },
    ]);

    // doneImpact = 10, totalImpact = 10 => 100%
    expect(result.readinessPercent).toBe(100);
    expect(result.pendingTasksCount).toBe(1);
  });

  it("counts pending tasks accurately across statuses", () => {
    const result = computeReadinessUpdate([
      { status: "done", readinessImpact: 10 },
      { status: "completed", readinessImpact: 10 },
      { status: "pending", readinessImpact: 10 },
      { status: "in_progress", readinessImpact: 10 },
      { status: "blocked", readinessImpact: 10 },
    ]);

    expect(result.pendingTasksCount).toBe(3);
  });
});
