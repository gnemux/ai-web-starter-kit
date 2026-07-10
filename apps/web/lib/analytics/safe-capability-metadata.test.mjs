import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeSafeCapabilityMetadata,
  safeCapabilityMetadataKeys
} from "./safe-capability-metadata.ts";

test("safe capability metadata keeps only the four correlation context keys", () => {
  assert.deepEqual(safeCapabilityMetadataKeys, [
    "correlation_id",
    "resource_id",
    "resource_type",
    "request_source"
  ]);
  assert.deepEqual(
    normalizeSafeCapabilityMetadata({
      correlation_id: " correlation-id ",
      request_source: " catcare_results ",
      resource_id: " plan-id ",
      resource_type: " care_plan "
    }),
    {
      data: {
        correlation_id: "correlation-id",
        request_source: "catcare_results",
        resource_id: "plan-id",
        resource_type: "care_plan"
      },
      ok: true
    }
  );
});

test("safe capability metadata rejects sensitive and unknown fields", () => {
  for (const key of [
    "prompt",
    "notes",
    "share_token",
    "token_hash",
    "owner_email",
    "private_handoff",
    "body",
    "custom_field"
  ]) {
    const result = normalizeSafeCapabilityMetadata({ [key]: "blocked" });

    assert.equal(result.ok, false, `${key} must be rejected`);
  }
});
