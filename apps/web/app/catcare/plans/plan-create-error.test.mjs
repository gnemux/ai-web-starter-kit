import assert from "node:assert/strict";
import test from "node:test";

import {
  getPlanCreateErrorKind,
  getPlanCreateErrorRedirect,
  parsePlanCreateErrorKind,
  shouldSelectPlanCatByDefault
} from "./plan-create-error.ts";

const catId = "760faa14-a2a7-414b-a919-07be17c80ac6";

test("plan creation validation maps to a stable recovery state", () => {
  assert.equal(getPlanCreateErrorKind({ routine: "required" }), "routine");
  assert.equal(getPlanCreateErrorKind({ startOn: "past" }), "date");
  assert.equal(getPlanCreateErrorKind({ endOn: "invalid" }), "date");
  assert.equal(getPlanCreateErrorKind({ catIds: "required" }), "cats");
  assert.equal(getPlanCreateErrorKind({ handoffNotes: "invalid" }), "validation");
  assert.equal(getPlanCreateErrorKind(), "validation");
});

test("plan creation recovery keeps only a valid selected cat id", () => {
  assert.equal(
    getPlanCreateErrorRedirect({ routine: "required" }, catId),
    `/catcare/plans?plan_error=routine&cat_id=${catId}`
  );
  assert.equal(
    getPlanCreateErrorRedirect({ routine: "required" }, "not-a-uuid"),
    "/catcare/plans?plan_error=routine"
  );
});

test("plan creation error query accepts only known recovery states", () => {
  assert.equal(parsePlanCreateErrorKind("routine"), "routine");
  assert.equal(parsePlanCreateErrorKind("date"), "date");
  assert.equal(parsePlanCreateErrorKind("private-error-message"), null);
  assert.equal(parsePlanCreateErrorKind(), null);
});

test("plan entry selects the requested cat without reselecting every cat", () => {
  assert.equal(
    shouldSelectPlanCatByDefault({
      catId,
      disabled: false,
      selectedCatId: catId
    }),
    true
  );
  assert.equal(
    shouldSelectPlanCatByDefault({
      catId: "de422342-f053-45eb-b8df-29af06c77f39",
      disabled: false,
      selectedCatId: catId
    }),
    false
  );
  assert.equal(
    shouldSelectPlanCatByDefault({ catId, disabled: true, selectedCatId: catId }),
    false
  );
  assert.equal(
    shouldSelectPlanCatByDefault({ catId, disabled: false }),
    true
  );
});
