import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCatCarePlanGenerationPrompt,
  normalizeGenerationRequestId
} from "./plan-ai-generation.ts";

test("generation request metadata accepts only a UUID from the client", () => {
  const fallback = "123e4567-e89b-12d3-a456-426614174000";
  const clientUuid = "223e4567-e89b-42d3-a456-426614174000";

  assert.equal(normalizeGenerationRequestId(clientUuid, fallback), clientUuid);
  for (const value of [
    "private:customer-record",
    "secret:abcdefghijklmnopqrstuvwxyz",
    "abcdefghijklmnopqrstuvwxyz1234567890",
    "not-a-uuid"
  ]) {
    assert.equal(normalizeGenerationRequestId(value, fallback), fallback);
  }
});

test("catcare AI plan generation prompt uses structured context without handoff text", () => {
  const prompt = buildCatCarePlanGenerationPrompt({
    cats: [{ id: "cat-1", name: "汤圆" }],
    eventCount: 2,
    input: {
      catId: "cat-1",
      catIds: ["cat-1"],
      endOn: "2026-07-12",
      handoffNotes: "钥匙密码 123456 不应进入 prompt",
      scenario: "friend_visit",
      startOn: "2026-07-07",
      tasks: [],
      title: "朋友上门照护计划",
      visitCount: 2
    },
    itemCount: 3,
    ownerId: "owner-1",
    routineCount: 4,
    taskCount: 15
  });

  assert.match(prompt, /场景：朋友上门/);
  assert.match(prompt, /生成依据：4 条习惯，3 个用品，2 条近期事件。/);
  assert.match(prompt, /生成结果：15 项任务。/);
  assert.match(prompt, /主人补充：有额外交接说明。/);
  assert.doesNotMatch(prompt, /123456/);
});
