import assert from "node:assert/strict";
import test from "node:test";

import { resolveSafeAnalyticsCurrentUrl } from "./request-context.ts";

test("analytics URL redacts share tokens from referer", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer:
        "https://example.test/s/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789?tab=tasks#visit"
    }),
    "https://example.test/s/[redacted]"
  );
});

test("analytics URL redacts share tokens from host and request path", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      host: "app.example.test",
      path: "/s/abcdefghijklmnopqrstuvwxyz123456?tab=tasks",
      protocol: "https"
    }),
    "https://app.example.test/s/[redacted]"
  );
});

test("analytics URL redacts future share routes and drops query and hash fail-closed", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer:
        "https://example.test/travel/share/abcdefghijklmnopqrstuvwxyz123456?token=query-secret#hash-secret"
    }),
    "https://example.test/travel/share/[redacted]"
  );
});

test("analytics URL redacts high-entropy bearer segments on unknown future routes", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer:
        "https://example.test/invite/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
    }),
    "https://example.test/invite/[redacted]"
  );
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer:
        "https://example.test/public-link/ghp_abcdefghijklmnopqrstuvwxyz123456"
    }),
    "https://example.test/public-link/[redacted]"
  );
});

test("analytics URL preserves normal resource UUID paths", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer:
        "https://example.test/catcare/plans/123e4567-e89b-12d3-a456-426614174000?tab=tasks"
    }),
    "https://example.test/catcare/plans/123e4567-e89b-12d3-a456-426614174000"
  );
});

test("analytics URL preserves safe paths but drops all query and hash values", () => {
  assert.equal(
    resolveSafeAnalyticsCurrentUrl({
      referer: "https://example.test/catcare/plans?status=published"
    }),
    "https://example.test/catcare/plans"
  );
});
