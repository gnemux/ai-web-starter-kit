import assert from "node:assert/strict";
import test from "node:test";

import {
  getTodayInShanghai,
  isHistoryPlan,
  isPlanOverdue
} from "./plan-list-state.ts";

test("Shanghai date is stable across the UTC day boundary", () => {
  assert.equal(getTodayInShanghai(new Date("2026-07-16T15:59:59.000Z")), "2026-07-16");
  assert.equal(getTodayInShanghai(new Date("2026-07-16T16:00:00.000Z")), "2026-07-17");
});

test("an ended published plan is history without mutating its lifecycle state", () => {
  const plan = { endOn: "2026-07-16", status: "published" };

  assert.equal(isPlanOverdue(plan, "2026-07-17"), true);
  assert.equal(isHistoryPlan(plan, "2026-07-17"), true);
  assert.equal(plan.status, "published");
});

test("today and future published plans remain active", () => {
  assert.equal(
    isHistoryPlan({ endOn: "2026-07-17", status: "published" }, "2026-07-17"),
    false
  );
  assert.equal(
    isHistoryPlan({ endOn: "2026-07-18", status: "published" }, "2026-07-17"),
    false
  );
});

test("reviewed and closed plans remain history regardless of dates", () => {
  assert.equal(isHistoryPlan({ endOn: null, status: "reviewed" }, "2026-07-17"), true);
  assert.equal(isHistoryPlan({ endOn: "2026-07-18", status: "closed" }, "2026-07-17"), true);
});
