import assert from "node:assert/strict";
import test from "node:test";

import {
  createAnonymousTaskSubmissionRef,
  getAnonymousTaskVisitTimes,
  isLegacyPrepareTask
} from "./anonymous-view-policy.ts";

test("anonymous view keeps explicit visit slots and bounded fallbacks", () => {
  assert.deepEqual(
    getAnonymousTaskVisitTimes({
      category: "meal",
      frequency: "daily_2",
      timeHint: "09:30，18:45"
    }),
    ["09:30", "18:45"]
  );
  assert.deepEqual(
    getAnonymousTaskVisitTimes({
      category: "medicine",
      frequency: "daily_2",
      timeHint: null
    }),
    ["08:30", "18:30"]
  );
});

test("anonymous submission references stay plan scoped across link regeneration", () => {
  assert.equal(
    createAnonymousTaskSubmissionRef("plan-id", "task-id"),
    createAnonymousTaskSubmissionRef("plan-id", "task-id")
  );
  assert.notEqual(
    createAnonymousTaskSubmissionRef("plan-id", "task-id"),
    createAnonymousTaskSubmissionRef("another-plan", "task-id")
  );
});

test("anonymous view excludes legacy preparation rows", () => {
  assert.equal(
    isLegacyPrepareTask({ source: "care_item", title: "准备猫粮" }),
    true
  );
  assert.equal(
    isLegacyPrepareTask({ source: "owner", title: "家庭共用：准备 猫砂" }),
    true
  );
  assert.equal(
    isLegacyPrepareTask({ source: "owner", title: "更换饮用水" }),
    false
  );
});
