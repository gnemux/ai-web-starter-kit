import assert from "node:assert/strict";
import test from "node:test";
import { ensureCriticalSubmissionEffects } from "./critical-effects.ts";

test("failed Audit prevents success and a same-reference retry completes Audit and Outbox", async () => {
  let auditAttempts = 0;
  let outboxWrites = 0;
  const effects = () => ensureCriticalSubmissionEffects({
    writeAudit: async () => ({ ok: ++auditAttempts > 1 }),
    writeOutbox: async () => { outboxWrites += 1; return { ok: true }; }
  });
  assert.deepEqual(await effects(), { ok: false });
  assert.equal(outboxWrites, 0);
  assert.deepEqual(await effects(), { ok: true });
  assert.equal(auditAttempts, 2);
  assert.equal(outboxWrites, 1);
});

test("failed Outbox keeps the submission incomplete until retry", async () => {
  let outboxAttempts = 0;
  const effects = () => ensureCriticalSubmissionEffects({
    writeAudit: async () => ({ ok: true }),
    writeOutbox: async () => ({ ok: ++outboxAttempts > 1 })
  });
  assert.deepEqual(await effects(), { ok: false });
  assert.deepEqual(await effects(), { ok: true });
});

test("23505 loser can repair winner effects before reporting duplicate success", async () => {
  let auditPresent = false;
  let outboxPresent = false;
  const loserRepair = await ensureCriticalSubmissionEffects({
    writeAudit: async () => { auditPresent = true; return { ok: true }; },
    writeOutbox: async () => { outboxPresent = true; return { ok: true }; }
  });
  assert.deepEqual(loserRepair, { ok: true });
  assert.equal(auditPresent, true);
  assert.equal(outboxPresent, true);
});
