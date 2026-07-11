import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catCareAdapter = readFileSync(
  new URL("../catcare/analytics.ts", import.meta.url),
  "utf8"
);

test("CatCare owns a product adapter that delegates to shared transport", () => {
  assert.match(catCareAdapter, /trackServerEvent/);
  assert.match(catCareAdapter, /sanitizeCatCareAnalyticsProperties/);
  assert.doesNotMatch(catCareAdapter, /\/i\/v0\/e\//);
  assert.doesNotMatch(catCareAdapter, /NEXT_PUBLIC_POSTHOG/);
});
