import assert from "node:assert/strict";
import test from "node:test";

import { resolveSafeAnalyticsCurrentUrl } from "./request-context.ts";

test("analytics URL redacts share tokens from referer", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer: "https://example.test/s/private-segment?tab=tasks#visit"
    }),
    "https://example.test/s/[token]?tab=tasks#visit"
  );
});

test("analytics URL redacts share tokens from host and request path", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      host: "app.example.test",
      path: "/s/another-segment?tab=tasks",
      protocol: "https"
    }),
    "https://app.example.test/s/[token]?tab=tasks"
  );
});

test("analytics URL preserves other safe URLs", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer: "https://example.test/catcare/plans?status=published"
    }),
    "https://example.test/catcare/plans?status=published"
  );
});
