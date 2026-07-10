import assert from "node:assert/strict";
import test from "node:test";

import { validateCatCarePlanDateRange } from "../plan-date-range.ts";

test("catcare plan input requires a valid future date range", () => {
  const valid = validateCatCarePlanDateRange({
    endOn: "2099-07-12",
    startOn: "2099-07-10",
    today: "2099-07-09"
  });
  assert.deepEqual(valid, {});

  const missingEnd = validateCatCarePlanDateRange({
    endOn: null,
    startOn: "2099-07-10",
    today: "2099-07-09"
  });
  assert.equal(missingEnd.endOn, "required");

  const pastStart = validateCatCarePlanDateRange({
    endOn: "2099-07-12",
    startOn: "2000-01-01",
    today: "2099-07-09"
  });
  assert.equal(pastStart.startOn, "past");

  const reversed = validateCatCarePlanDateRange({
    endOn: "2099-07-09",
    startOn: "2099-07-10",
    today: "2099-07-09"
  });
  assert.equal(reversed.endOn, "invalid");
});
