import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCatCarePlanCatCreation,
  assertCatCarePlanCatSelection,
  assertCatCarePlanItemCreation,
  formatCatCareAiUsageLabel,
  getCatCarePlanLimits
} from "./plan-limits.ts";

test("catcare plan limits describe product caps", () => {
  assert.deepEqual(getCatCarePlanLimits("free"), {
    aiSummaryUses: 2,
    maxCats: 1,
    maxItems: 20
  });
  assert.deepEqual(getCatCarePlanLimits("plus"), {
    aiSummaryUses: 12,
    maxCats: 3,
    maxItems: 80
  });
  assert.deepEqual(getCatCarePlanLimits("pro"), {
    aiSummaryUses: 25,
    maxCats: null,
    maxItems: null
  });
});

test("catcare AI usage label shows remaining product plan quota", () => {
  assert.equal(formatCatCareAiUsageLabel({
    planId: "pro",
    usedUses: 15
  }), "10 / 25");
  assert.equal(formatCatCareAiUsageLabel({
    planId: "pro",
    usedUses: 60
  }), "0 / 25");
});

test("catcare plan limits block new work without deleting saved data", () => {
  assert.equal(assertCatCarePlanCatSelection({
    planId: "free",
    selectedCatCount: 2
  }).ok, false);
  assert.equal(assertCatCarePlanCatCreation({
    currentCatCount: 1,
    planId: "free"
  }).ok, false);
  assert.equal(assertCatCarePlanItemCreation({
    currentItemCount: 20,
    planId: "free"
  }).ok, false);
  assert.equal(assertCatCarePlanCatSelection({
    planId: "pro",
    selectedCatCount: 8
  }).ok, true);
});
