import assert from "node:assert/strict";
import test from "node:test";

import { catCareOutboxLeaseMs, getCatCareOutboxRetryAt, runCatCareOutboxBatch } from "./outbox-worker.ts";

function memoryStore(initial) {
  const rows = new Map(initial.map((row) => [row.id, { ...row }]));
  return {
    rows,
    async listReady(now, limit) { const lease = new Date(new Date(now).getTime() - catCareOutboxLeaseMs).toISOString(); return [...rows.values()].filter((row) => row.status === "processing" ? row.updated_at <= lease : ["pending", "failed"].includes(row.status) && (!row.next_attempt_at || row.next_attempt_at <= now)).slice(0, limit).map((row) => ({ ...row })); },
    async claim(event) { const row = rows.get(event.id); if (!row || row.status !== event.status || row.attempt_count !== event.attempt_count || row.next_attempt_at !== event.next_attempt_at || row.updated_at !== event.updated_at) return null; row.status = "processing"; row.updated_at = new Date().toISOString(); return { ...row }; },
    async markSent(event) { Object.assign(rows.get(event.id), { attempt_count: event.attempt_count + 1, status: "sent" }); },
    async markRetry(event, next_attempt_at, payload) { Object.assign(rows.get(event.id), { attempt_count: event.attempt_count, next_attempt_at, payload, status: "failed", updated_at: new Date().toISOString() }); },
    async markDeadLetter(event, payload) { Object.assign(rows.get(event.id), { attempt_count: Math.max(event.attempt_count, 1), payload, status: "dead_letter" }); }
  };
}

const event = { attempt_count: 0, created_at: "2026-07-11T00:00:00.000Z", event_type: "owner_notification", id: "event-1", idempotency_key: "submission:event-1", next_attempt_at: null, payload: {}, status: "pending", updated_at: "2026-07-11T00:00:00.000Z" };

test("outbox transitions pending to sent and a second worker cannot repeat the side effect", async () => {
  const store = memoryStore([event]);
  let effects = 0;
  const dispatcher = async () => { effects += 1; return { ok: true }; };
  assert.equal((await runCatCareOutboxBatch({ dispatcher, store })).sent, 1);
  assert.equal((await runCatCareOutboxBatch({ dispatcher, store })).claimed, 0);
  assert.equal(effects, 1);
});

test("outbox schedules deterministic retry and reaches dead letter at max attempts", async () => {
  const now = new Date("2026-07-12T00:00:00.000Z");
  const store = memoryStore([event]);
  const dispatcher = async () => ({ ok: false, errorCode: "dispatch_timeout" });
  assert.equal((await runCatCareOutboxBatch({ dispatcher, now, store })).retried, 1);
  assert.equal(store.rows.get(event.id).next_attempt_at, getCatCareOutboxRetryAt(1, now));
  Object.assign(store.rows.get(event.id), { attempt_count: 2, next_attempt_at: now.toISOString(), status: "failed" });
  assert.equal((await runCatCareOutboxBatch({ dispatcher, now, store })).deadLettered, 1);
  assert.equal(store.rows.get(event.id).status, "dead_letter");
  assert.equal(store.rows.get(event.id).payload.worker_failure_code.length <= 64, true);
  assert.equal(store.rows.get(event.id).payload.worker_failure_code, "dispatch_timeout");
});

test("stale candidates fail ABA claim after processing moves to a future retry", async () => {
  const store = memoryStore([event]);
  const stale = (await store.listReady("2026-07-12T00:00:00.000Z", 1))[0];
  const claimed = await store.claim(stale);
  await store.markRetry({ ...claimed, attempt_count: 1 }, "2026-07-13T00:00:00.000Z", {});
  assert.equal(await store.claim(stale), null);
});

test("dispatcher throws become retry and stale processing can recover with idempotent destination", async () => {
  const now = new Date("2026-07-12T00:00:00.000Z");
  const store = memoryStore([{ ...event, status: "processing", updated_at: new Date(now.getTime() - catCareOutboxLeaseMs - 1).toISOString() }]);
  assert.equal((await runCatCareOutboxBatch({ dispatcher: async () => { throw new Error("private provider text"); }, now, store })).retried, 1);
  assert.equal(store.rows.get(event.id).payload.worker_failure_code, "destination_unavailable");
});

test("crash-after-send recovery relies on the required destination idempotency key", async () => {
  const now = new Date("2026-07-12T00:00:00.000Z");
  const delivered = new Set([event.idempotency_key]);
  const store = memoryStore([{ ...event, status: "processing", updated_at: new Date(now.getTime() - catCareOutboxLeaseMs - 1).toISOString() }]);
  let effects = 0;
  await runCatCareOutboxBatch({ now, store, dispatcher: async (item) => { if (!delivered.has(item.idempotency_key)) { delivered.add(item.idempotency_key); effects += 1; } return { ok: true }; } });
  assert.equal(effects, 0);
  assert.equal(store.rows.get(event.id).status, "sent");
});

test("outbox conditional claim prevents concurrent duplicate dispatch", async () => {
  const store = memoryStore([event]);
  const candidate = (await store.listReady(new Date().toISOString(), 1))[0];
  const first = await store.claim(candidate);
  const second = await store.claim(candidate);
  assert.ok(first);
  assert.equal(second, null);
});

test("future retries and active leases do not starve later ready work", async () => {
  const now = "2026-07-12T00:00:00.000Z";
  const store = memoryStore([
    { ...event, id: "future", next_attempt_at: "2026-07-13T00:00:00.000Z", status: "failed" },
    { ...event, id: "active", status: "processing", updated_at: now },
    { ...event, created_at: "2026-07-11T01:00:00.000Z", id: "ready" }
  ]);
  assert.deepEqual((await store.listReady(now, 1)).map((item) => item.id), ["ready"]);
});
