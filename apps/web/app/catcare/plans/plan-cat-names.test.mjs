import assert from "node:assert/strict";
import test from "node:test";

import { formatPlanCatNames, getPlanCatNames } from "./plan-cat-names.ts";

function makePlan(participants, aiInputSummary = {}) {
  return {
    aiInputSummary,
    catId: participants[0]?.catId ?? null,
    participants
  };
}

test("historical plan uses immutable participant snapshots and marks deleted cats", () => {
  const plan = makePlan([
    {
      catId: "cat-1",
      deletedAt: "2026-07-13T10:00:00.000Z",
      nameSnapshot: "汤圆",
      sortOrder: 0
    },
    {
      catId: "cat-2",
      deletedAt: null,
      nameSnapshot: "饺子",
      sortOrder: 1
    }
  ]);

  assert.equal(formatPlanCatNames(plan), "汤圆（已删除）、饺子");
  assert.deepEqual(getPlanCatNames(plan), ["汤圆", "饺子"]);
});

test("legacy plan falls back to the existing JSON snapshot during rollout", () => {
  const plan = makePlan([], { cat_names: ["汤圆", "饺子"] });

  assert.equal(formatPlanCatNames(plan), "汤圆、饺子");
});
