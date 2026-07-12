import assert from "node:assert/strict";
import test from "node:test";
import { billingReservationLeaseMs, commitAiCreditUsageWithStore, failAiCreditUsageWithStore, isBillingReservationStale, reconcileReservedAiCreditUsageWithStore, reserveAiCreditUsageWithStore } from "./billing-ledger-commit.ts";

function store(options = {}) {
  const credits = new Map();
  const usage = new Map();
  return {
    credits, usage,
    async findCredit(ownerId, key) { return options.failFind ? { ok: false } : { data: credits.get(`${ownerId}:${key}`) ?? null, ok: true }; },
    async findUsage(ownerId, key) { return options.failFind ? { ok: false } : { data: usage.get(`${ownerId}:${key}`) ?? null, ok: true }; },
    async insertCredit(input) { const key = `${input.ownerId}:${input.idempotencyKey}`; if (credits.has(key)) return { duplicate: true, id: credits.get(key).id }; const row = { id: `credit-${credits.size + 1}` }; credits.set(key, row); return { duplicate: false, ...row }; },
    async insertUsageReservation(input) { const key = `${input.ownerId}:${input.idempotencyKey}`; if (usage.has(key)) return { duplicate: true, row: usage.get(key) }; const row = { createdAt: options.createdAt ?? new Date().toISOString(), id: `usage-${usage.size + 1}`, relatedCreditLedgerId: null, status: "reserved" }; usage.set(key, row); return { duplicate: false, row }; },
    async updateUsage(input) { if (options.failFinalize) return { ok: false }; const row = [...usage.values()].find((item) => item.id === input.id); if (!row || row.status !== input.expectedStatus) return { data: null, ok: true }; Object.assign(row, { relatedCreditLedgerId: input.creditLedgerId, status: input.status }); return { data: row, ok: true }; }
  };
}
const input = { credits: 10000, idempotencyKey: "request-1", metadata: {}, ownerId: "owner-1", reason: "AI usage", sourceId: "request-1" };

test("reservation is acquired once so same-key retry cannot invoke provider twice", async () => {
  const ledger = store();
  let providerCalls = 0;
  const first = await reserveAiCreditUsageWithStore(input, ledger);
  if (first.ok && first.data.acquired) providerCalls += 1;
  const retry = await reserveAiCreditUsageWithStore(input, ledger);
  if (retry.ok && retry.data.acquired) providerCalls += 1;
  assert.equal(providerCalls, 1);
  assert.equal(retry.data.usage.status, "reserved");
  assert.equal(isBillingReservationStale(retry.data.usage), false);
});

test("active duplicate cannot mutate the first in-flight reservation", async () => {
  const ledger = store();
  const first = await reserveAiCreditUsageWithStore(input, ledger);
  let releaseProvider;
  let providerCalls = 0;
  const provider = new Promise((resolve) => { releaseProvider = resolve; });
  const firstProvider = first.data.acquired ? (providerCalls += 1, provider) : Promise.resolve();
  const second = await reserveAiCreditUsageWithStore(input, ledger);
  if (second.data.acquired) providerCalls += 1;
  assert.equal(first.data.acquired, true);
  assert.equal(second.data.acquired, false);
  assert.equal(providerCalls, 1);
  assert.equal([...ledger.usage.values()][0].status, "reserved");
  releaseProvider();
  await firstProvider;
  assert.equal((await commitAiCreditUsageWithStore(input, ledger)).data.usageStatus, "committed");
});

test("only stale reservations qualify for reconciliation", async () => {
  const now = new Date();
  const ledger = store({ createdAt: new Date(now.getTime() - billingReservationLeaseMs - 1).toISOString() });
  const reservation = await reserveAiCreditUsageWithStore(input, ledger);
  assert.equal(isBillingReservationStale(reservation.data.usage, now), true);
});

test("direct reconciliation leaves an active reservation unchanged", async () => {
  const ledger = store();
  await reserveAiCreditUsageWithStore(input, ledger);
  const result = await reconcileReservedAiCreditUsageWithStore(input, ledger);
  assert.equal(result.ok, true);
  assert.equal(result.data.status, "reserved");
  assert.equal(ledger.credits.size, 0);
});

test("usage transition CAS refuses a non-reserved row", async () => {
  const ledger = store();
  await reserveAiCreditUsageWithStore(input, ledger);
  const row = [...ledger.usage.values()][0];
  row.status = "failed";
  const result = await ledger.updateUsage({ creditLedgerId: "credit-1", expectedStatus: "reserved", id: row.id, status: "committed" });
  assert.equal(result.data, null);
  assert.equal(row.status, "failed");
});

test("reserved -> credit -> committed is the only effective deduction", async () => {
  const ledger = store();
  await reserveAiCreditUsageWithStore(input, ledger);
  const committed = await commitAiCreditUsageWithStore(input, ledger);
  assert.equal(committed.ok, true);
  assert.equal(committed.data.usageStatus, "committed");
  assert.equal(ledger.credits.size, 1);
});

test("finalize failure stays reserved and reconciliation converges without provider", async () => {
  const ledger = store({ failFinalize: true });
  await reserveAiCreditUsageWithStore(input, ledger);
  const delivery = await commitAiCreditUsageWithStore(input, ledger);
  assert.equal(delivery.ok, true);
  assert.equal(delivery.data.accountingPending, true);
  assert.equal(delivery.data.consumedCredits, 0);
  assert.equal([...ledger.usage.values()][0].status, "reserved");
  ledger.updateUsage = async (update) => { const row = [...ledger.usage.values()][0]; if (row.status !== update.expectedStatus) return { data: null, ok: true }; Object.assign(row, { relatedCreditLedgerId: update.creditLedgerId, status: update.status }); return { data: row, ok: true }; };
  const reconciled = await reconcileReservedAiCreditUsageWithStore({ ...input, now: new Date(Date.now() + billingReservationLeaseMs + 1) }, ledger);
  assert.equal(reconciled.ok, true);
  assert.equal(reconciled.data.status, "committed");
  assert.equal(ledger.credits.size, 1);
});

test("reservation without credit is compensated to failed; query errors are not not-found", async () => {
  const ledger = store();
  await reserveAiCreditUsageWithStore(input, ledger);
  assert.equal((await reconcileReservedAiCreditUsageWithStore({ ...input, now: new Date(Date.now() + billingReservationLeaseMs + 1) }, ledger)).data.status, "failed");
  assert.equal((await reserveAiCreditUsageWithStore(input, store({ failFind: true }))).ok, false);
});

test("finalize and reconciliation double failure remains reserved and never reports effective usage", async () => {
  const ledger = store({ failFinalize: true });
  await reserveAiCreditUsageWithStore(input, ledger);
  const delivery = await commitAiCreditUsageWithStore(input, ledger);
  assert.equal(delivery.ok, true);
  assert.equal(delivery.data.accountingPending, true);
  assert.equal((await reconcileReservedAiCreditUsageWithStore({ ...input, now: new Date(Date.now() + billingReservationLeaseMs + 1) }, ledger)).ok, false);
  assert.equal([...ledger.usage.values()].filter((row) => row.status === "committed").length, 0);
  assert.equal(ledger.credits.size, 1);
});

test("raw identity keys reject whitespace instead of silently normalizing", async () => {
  const ledger = store();
  assert.equal((await reserveAiCreditUsageWithStore({ ...input, idempotencyKey: " request-1" }, ledger)).ok, false);
  assert.equal((await reserveAiCreditUsageWithStore({ ...input, ownerId: "owner-1 " }, ledger)).ok, false);
});

test("thrown Provider failure closes reservation with zero credit", async () => {
  const ledger = store();
  await reserveAiCreditUsageWithStore(input, ledger);
  try { throw new Error("provider secret detail"); } catch { await failAiCreditUsageWithStore(input, ledger); }
  assert.equal([...ledger.usage.values()][0].status, "failed");
  assert.equal(ledger.credits.size, 0);
});
