import assert from "node:assert/strict";
import test from "node:test";
import { productConfig } from "./product.config.ts";
import { assertProductEventName, sanitizeAnalyticsProperties } from "../modules/platform/analytics/properties.ts";

test("generated product config has a stable identity and bounded provider modes", () => {
  assert.match(productConfig.identity.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(productConfig.identity.eventNamespace, /^[a-z][a-z0-9_]*$/);
  assert.ok(["disabled", "enabled"].includes(productConfig.capabilities.analytics));
  assert.ok(["disabled", "sandbox"].includes(productConfig.capabilities.payment));
  assert.ok(["disabled", "sandbox"].includes(productConfig.capabilities.ai));
});

test("analytics accepts only bounded neutral event properties", () => {
  assert.equal(assertProductEventName("product_opened"), "product_opened");
  assert.deepEqual(sanitizeAnalyticsProperties({ surface: "product", status: "success", count: 2, enabled: true }), {
    surface: "product",
    status: "success",
    count: 2,
    enabled: true,
  });
  assert.throws(() => assertProductEventName("Product Opened"), /bounded snake_case/);
  for (const properties of [
    { prompt: "private input" },
    { result: "private output" },
    { email: "person@example.test" },
    { token: "private-token" },
    { unknown: "value" },
    { surface: "free form private text" },
    { count: Number.POSITIVE_INFINITY },
  ]) assert.throws(() => sanitizeAnalyticsProperties(properties), /analytics/i);
});
