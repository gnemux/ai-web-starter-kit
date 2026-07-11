import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeServerProperties } from "./server-properties.ts";

const syntheticStripeLikeKey = ["sk", "live", "abcdefghijklmnopqrstuvwxyz"].join("_");

test("shared transport accepts bounded primitives and drops sensitive values", () => {
  assert.deepEqual(
    sanitizeServerProperties({
      custom_trip_count: 2,
      enabled: true,
      external_ref: "https://private.example/path",
      module: "attacker-controlled",
      prompt: "private prompt",
      provider: "posthog",
      provider_secret_value: syntheticStripeLikeKey,
      safe_provider: "posthog-us",
      source: "Bearer abcdefghijklmnopqrstuvwxyz",
      suspicious: "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789",
      free_text: "private customer details",
      resource_id: "attacker-controlled",
      share_secret: "private-token"
    }),
    {
      custom_trip_count: 2,
      enabled: true,
      provider: "posthog",
      safe_provider: "posthog-us"
    }
  );
});

test("shared transport rejects secrets even under otherwise safe property names", () => {
  for (const value of [
    "Bearer abcdefghijklmnopqrstuvwxyz",
    syntheticStripeLikeKey,
    "ghp_abcdefghijklmnopqrstuvwxyz123456",
    "phx_abcdefghijklmnopqrstuvwxyz123456",
    "private-customer-value",
    "secret-value",
    "travel:token:value",
    "https://private.example/path",
    "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789",
    "abcdefghijklmnopqrstuvwxyz1234567890",
    "private customer details"
  ]) {
    assert.deepEqual(sanitizeServerProperties({ provider: value }), {});
  }
});
