import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catCareCore = readFileSync(
  new URL("../catcare/product-service/core.ts", import.meta.url),
  "utf8"
);

test("CatCare server product events use the shared analytics wrapper", () => {
  assert.match(catCareCore, /trackServerEvent/);
  assert.doesNotMatch(catCareCore, /\/capture\//);
  assert.doesNotMatch(catCareCore, /NEXT_PUBLIC_POSTHOG/);
});
