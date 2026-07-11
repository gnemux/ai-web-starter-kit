import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeSafeCapabilityContext,
  resolveShareTokenGate,
  safeCapabilityContextKeys
} from "./index.ts";

const syntheticStripeLikeKey = ["sk", "live", "abcdefghijklmnopqrstuvwxyz"].join("_");

test("capability context exposes exactly four validated external keys", () => {
  assert.deepEqual(safeCapabilityContextKeys, [
    "correlation_id",
    "resource_id",
    "resource_type",
    "request_source"
  ]);
  assert.deepEqual(
    normalizeSafeCapabilityContext({
      correlation_id: "travel_plan_generation:request-123",
      request_source: "travel_results",
      resource_id: "123e4567-e89b-12d3-a456-426614174000",
      resource_type: "care_plan"
    }),
    {
      data: {
        correlation_id: "travel_plan_generation:request-123",
        request_source: "travel_results",
        resource_id: "123e4567-e89b-12d3-a456-426614174000",
        resource_type: "care_plan"
      },
      ok: true
    }
  );
});

test("capability context rejects unknown, URL, whitespace, long text, and bearer-like values", () => {
  for (const value of [
    { prompt: "private" },
    { resource_id: "https://example.test/private" },
    { resource_id: "private customer text" },
    { resource_id: "A".repeat(43) },
    { resource_id: "a".repeat(200) },
    { resource_id: "bearer:ghp_abcdefghijklmnopqrstuvwxyz123456" },
    { resource_id: "secret:abcdefghijklmnopqrstuvwxyz123456" },
    { resource_id: "private:customer-record" },
    { resource_id: "travel:abcdefghijklmnopqrstuvwxyz" },
    { resource_id: "travel:abcDEF0123456789opaque" },
    { correlation_id: "credential:phx_abcdefghijklmnopqrstuvwxyz" },
    { correlation_id: `api-key:${syntheticStripeLikeKey}` },
    { correlation_id: "request:ghp_abcdefghijklmnopqrstuvwxyz123456" },
    { resource_type: "Care Plan" },
    { request_source: "share?token=secret" }
  ]) {
    assert.equal(normalizeSafeCapabilityContext(value).ok, false);
  }
});

test("capability context accepts UUID and bounded namespaced business identifiers", () => {
  for (const correlation_id of [
    "123e4567-e89b-12d3-a456-426614174000",
    "catcare_plan_generation:123e4567-e89b-12d3-a456-426614174000",
    "travel_job:request-123"
  ]) {
    assert.equal(normalizeSafeCapabilityContext({ correlation_id }).ok, true);
  }
});

const record = {
  expiresAt: "2026-07-12T10:00:00.000Z",
  ownerId: "owner-id",
  resourceId: "resource-id",
  resourceType: "trip_plan",
  revokedAt: null,
  scope: "trip_plan",
  tokenId: "token-id"
};

test("share-token contract resolves portable authorization states without runtime crypto", () => {
  assert.equal(
    resolveShareTokenGate({ record, secretVerified: false }).status,
    "invalid"
  );
  assert.equal(
    resolveShareTokenGate({
      now: new Date("2026-07-11T10:00:00.000Z"),
      record,
      secretVerified: true
    }).status,
    "valid"
  );
  assert.equal(
    resolveShareTokenGate({
      now: new Date("2026-07-12T10:00:00.000Z"),
      record,
      secretVerified: true
    }).status,
    "expired"
  );
  assert.equal(
    resolveShareTokenGate({
      record: { ...record, revokedAt: "2026-07-11T09:00:00.000Z" },
      secretVerified: true
    }).status,
    "revoked"
  );
  assert.equal(
    resolveShareTokenGate({
      record,
      resourceAvailable: false,
      secretVerified: true
    }).status,
    "unavailable"
  );
});
