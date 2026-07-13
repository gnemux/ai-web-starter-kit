import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeCatCareAnalyticsProperties } from "./analytics-properties.ts";

test("CatCare owns and filters its product analytics properties", () => {
  assert.deepEqual(
    sanitizeCatCareAnalyticsProperties({
      cat_count: 2,
      deletion_mode: "soft",
      outcome: "valid",
      share_secret: "blocked",
      result: "success"
    }),
    {
      cat_count: 2,
      deletion_mode: "soft",
      outcome: "valid",
      result: "success"
    }
  );
});
