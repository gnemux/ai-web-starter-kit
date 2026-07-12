import assert from "node:assert/strict";
import test from "node:test";
import { aiProviderTimeoutMs, buildSafeAiProviderFailureObservation, executeAiProviderWithTimeout } from "./ai-provider-execution.ts";
import { billingReservationLeaseMs } from "./billing-ledger-commit.ts";

test("Provider throw becomes a safe observation without exception text", async () => {
  const result = await executeAiProviderWithTimeout(async () => { throw new Error("secret provider payload"); }, 20);
  assert.deepEqual(result, { ok: false, reason: "provider_threw" });
  assert.deepEqual(buildSafeAiProviderFailureObservation(), { reason: "provider_failed", result: "failed" });
  assert.doesNotMatch(JSON.stringify(buildSafeAiProviderFailureObservation()), /secret|payload/);
});

test("synchronous Provider throw is captured by the same failure boundary", async () => {
  const result = await executeAiProviderWithTimeout(() => { throw new Error("sync provider secret"); }, 20);
  assert.deepEqual(result, { ok: false, reason: "provider_threw" });
});

test("Provider timeout wins before the Billing reservation lease", async () => {
  assert.equal(aiProviderTimeoutMs < billingReservationLeaseMs, true);
  const result = await executeAiProviderWithTimeout(() => new Promise(() => {}), 5);
  assert.deepEqual(result, { ok: false, reason: "provider_timeout" });
});
