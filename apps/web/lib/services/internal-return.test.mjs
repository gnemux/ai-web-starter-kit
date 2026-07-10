import assert from "node:assert/strict";
import test from "node:test";

import {
  isAllowedInternalReturnTo,
  isInternalReturnPathWithin,
  normalizeInternalReturnTo
} from "./internal-return.ts";

test("normalizes only account and CatCare internal returns", () => {
  assert.equal(
    normalizeInternalReturnTo("/catcare/plans/plan-1/results", "/account"),
    "/catcare/plans/plan-1/results"
  );
  assert.equal(
    normalizeInternalReturnTo("/account/usage?source=catcare", "/account"),
    "/account/usage?source=catcare"
  );
  assert.equal(normalizeInternalReturnTo("/catcareevil", "/account"), "/account");
  assert.equal(normalizeInternalReturnTo("https://evil.example", "/account"), "/account");
  assert.equal(normalizeInternalReturnTo("//evil.example", "/account"), "/account");
});

test("matches exact product roots without sibling prefix leaks", () => {
  assert.equal(isAllowedInternalReturnTo("/catcare"), true);
  assert.equal(isAllowedInternalReturnTo("/catcare/tasks"), true);
  assert.equal(isAllowedInternalReturnTo("/catcare?tab=plans"), true);
  assert.equal(isAllowedInternalReturnTo("/catcareevil"), false);
  assert.equal(isInternalReturnPathWithin("/catcare/plans", "/catcare"), true);
  assert.equal(isInternalReturnPathWithin("/accountant", "/account"), false);
});
