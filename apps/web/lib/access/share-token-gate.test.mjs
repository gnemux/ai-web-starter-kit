import assert from "node:assert/strict";
import test from "node:test";

import {
  createShareTokenCredential,
  hashShareTokenSecret,
  resolveShareTokenGate,
  verifyShareTokenSecret
} from "./share-token-gate.ts";

const now = new Date("2026-07-10T10:00:00.000Z");
const record = {
  expiresAt: "2026-07-11T10:00:00.000Z",
  ownerId: "owner-id",
  resourceId: "resource-id",
  resourceType: "care_plan",
  revokedAt: null,
  scope: "care_plan",
  tokenHash: hashShareTokenSecret("a".repeat(32)).data,
  tokenId: "token-id"
};

test("share-token credentials return the raw secret only at creation", () => {
  const credential = createShareTokenCredential();

  assert.deepEqual(Object.keys(credential).sort(), ["secret", "tokenHash"]);
  assert.notEqual(credential.secret, credential.tokenHash);
  assert.equal(verifyShareTokenSecret(credential.secret, credential.tokenHash), true);
});

test("share-token hashing and verification reject malformed or mismatched secrets", () => {
  assert.equal(hashShareTokenSecret("short").ok, false);
  assert.equal(verifyShareTokenSecret("b".repeat(32), record.tokenHash), false);
  assert.equal(verifyShareTokenSecret("a".repeat(32), record.tokenHash), true);
});

test("share-token gate returns a portable anonymous actor for a valid token", () => {
  assert.deepEqual(
    resolveShareTokenGate({
      now,
      record,
      resourceAvailable: true,
      secret: "a".repeat(32)
    }),
    {
      actor: {
        actorType: "anonymous_token",
        expiresAt: record.expiresAt,
        ownerId: record.ownerId,
        resourceId: record.resourceId,
        resourceType: record.resourceType,
        scope: record.scope,
        tokenId: record.tokenId
      },
      status: "valid"
    }
  );
});

test("share-token gate normalizes invalid, expired, revoked, and unavailable", () => {
  assert.equal(
    resolveShareTokenGate({ now, record: null, secret: "a".repeat(32) }).status,
    "invalid"
  );
  assert.equal(
    resolveShareTokenGate({ now, record, secret: "b".repeat(32) }).status,
    "invalid"
  );
  assert.equal(
    resolveShareTokenGate({
      now,
      record: { ...record, expiresAt: now.toISOString() },
      secret: "a".repeat(32)
    }).status,
    "expired"
  );
  assert.equal(
    resolveShareTokenGate({
      now,
      record: { ...record, revokedAt: "2026-07-10T09:00:00.000Z" },
      secret: "a".repeat(32)
    }).status,
    "revoked"
  );
  assert.equal(
    resolveShareTokenGate({
      now,
      record,
      resourceAvailable: false,
      secret: "a".repeat(32)
    }).status,
    "unavailable"
  );
  assert.equal(
    resolveShareTokenGate({
      now,
      record: { ...record, expiresAt: "not-a-date" },
      secret: "a".repeat(32)
    }).status,
    "unavailable"
  );
});
