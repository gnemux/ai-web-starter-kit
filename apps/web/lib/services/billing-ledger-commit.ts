export type LedgerCommitResult<T> = { ok: true; data: T } | { ok: false; error: { code: "system_error" | "validation_error"; message: string } };
export type BillingUsageStatus = "reserved" | "committed" | "released" | "failed";
export type BillingAiCreditUsageCommit = { accountingPending: boolean; consumedCredits: number; creditLedgerId: string | null; deduplicated: boolean; usageLedgerId: string; usageStatus: BillingUsageStatus };
export type BillingUsageRow = { createdAt: string; id: string; relatedCreditLedgerId: string | null; status: BillingUsageStatus };
export const billingReservationLeaseMs = 5 * 60_000;
export function isBillingReservationStale(row: BillingUsageRow, now = new Date()) { return row.status === "reserved" && new Date(row.createdAt).getTime() <= now.getTime() - billingReservationLeaseMs; }
export type BillingFindResult<T> = { ok: true; data: T | null } | { ok: false };
export type BillingLedgerStore = {
  findCredit(ownerId: string, idempotencyKey: string): Promise<BillingFindResult<{ id: string }>>;
  findUsage(ownerId: string, idempotencyKey: string): Promise<BillingFindResult<BillingUsageRow>>;
  insertCredit(input: { amount: number; idempotencyKey: string; metadata: unknown; ownerId: string; reason: string; sourceId: string }): Promise<{ duplicate: boolean; id: string } | { error: true }>;
  insertUsageReservation(input: { idempotencyKey: string; metadata: unknown; ownerId: string; units: number }): Promise<{ duplicate: boolean; row: BillingUsageRow } | { error: true }>;
  updateUsage(input: { creditLedgerId: string | null; expectedStatus: BillingUsageStatus; id: string; status: BillingUsageStatus }): Promise<BillingFindResult<BillingUsageRow>>;
};

export async function reserveAiCreditUsageWithStore(input: { credits: number; idempotencyKey: string; metadata: unknown; ownerId: string }, store: BillingLedgerStore): Promise<LedgerCommitResult<{ acquired: boolean; usage: BillingUsageRow }>> {
  const normalized = validate(input);
  if (!normalized.ok) return normalized;
  const key = `${input.idempotencyKey}:usage`;
  const found = await store.findUsage(input.ownerId, key);
  if (!found.ok) return failure("Billing usage lookup failed.");
  if (found.data) return success({ acquired: false, usage: found.data });
  const inserted = await store.insertUsageReservation({ idempotencyKey: key, metadata: input.metadata, ownerId: input.ownerId, units: input.credits });
  if ("error" in inserted) return failure("Billing usage reservation failed.");
  return success({ acquired: !inserted.duplicate, usage: inserted.row });
}

export async function failAiCreditUsageWithStore(input: { idempotencyKey: string; ownerId: string }, store: BillingLedgerStore): Promise<LedgerCommitResult<BillingUsageRow>> {
  const found = await store.findUsage(input.ownerId, `${input.idempotencyKey}:usage`);
  if (!found.ok || !found.data) return failure("Billing usage reservation lookup failed.");
  const updated = await store.updateUsage({ creditLedgerId: found.data.relatedCreditLedgerId, expectedStatus: "reserved", id: found.data.id, status: "failed" });
  return updated.ok && updated.data ? success(updated.data) : failure("Billing usage reservation could not be failed.");
}

export async function reconcileReservedAiCreditUsageWithStore(input: { idempotencyKey: string; now?: Date; ownerId: string }, store: BillingLedgerStore): Promise<LedgerCommitResult<BillingUsageRow>> {
  const usage = await store.findUsage(input.ownerId, `${input.idempotencyKey}:usage`);
  if (!usage.ok || !usage.data) return failure("Billing usage reservation lookup failed.");
  if (usage.data.status !== "reserved") return success(usage.data);
  if (!isBillingReservationStale(usage.data, input.now)) return success(usage.data);
  const credit = await store.findCredit(input.ownerId, `${input.idempotencyKey}:credit_consume`);
  if (!credit.ok) return failure("Billing credit reconciliation lookup failed.");
  const updated = await store.updateUsage({ creditLedgerId: credit.data?.id ?? null, expectedStatus: "reserved", id: usage.data.id, status: credit.data ? "committed" : "failed" });
  return updated.ok && updated.data ? success(updated.data) : failure("Billing usage reconciliation failed.");
}

export async function commitAiCreditUsageWithStore(input: { credits: number; idempotencyKey: string; metadata: unknown; ownerId: string; reason: string; sourceId: string }, store: BillingLedgerStore): Promise<LedgerCommitResult<BillingAiCreditUsageCommit>> {
  const normalized = validate(input);
  if (!normalized.ok) return normalized;
  const usageKey = `${input.idempotencyKey}:usage`;
  const creditKey = `${input.idempotencyKey}:credit_consume`;
  const usage = await store.findUsage(input.ownerId, usageKey);
  if (!usage.ok) return failure("Billing usage lookup failed.");
  if (!usage.data) return failure("Billing usage reservation is missing.");
  if (usage.data.status === "committed") return success(toCommit(usage.data, 0, true));
  if (usage.data.status !== "reserved") return failure("Billing usage reservation is not active.");

  const foundCredit = await store.findCredit(input.ownerId, creditKey);
  if (!foundCredit.ok) return failure("Billing credit lookup failed.");
  const credit = foundCredit.data ?? await store.insertCredit({ amount: -input.credits, idempotencyKey: creditKey, metadata: input.metadata, ownerId: input.ownerId, reason: input.reason, sourceId: input.sourceId });
  if ("error" in credit) {
    await store.updateUsage({ creditLedgerId: null, expectedStatus: "reserved", id: usage.data.id, status: "failed" });
    return failure("Billing credit commit failed; the Provider result is not charged.");
  }
  const creditId = "duplicate" in credit ? credit.id : credit.id;
  const updated = await store.updateUsage({ creditLedgerId: creditId, expectedStatus: "reserved", id: usage.data.id, status: "committed" });
  if (!updated.ok || !updated.data) return success(toCommit({ ...usage.data, relatedCreditLedgerId: creditId }, 0, false, true));
  return success(toCommit(updated.data, foundCredit.data ? 0 : input.credits, Boolean(foundCredit.data)));
}

function validate(input: { credits?: number; idempotencyKey: string; ownerId: string }): LedgerCommitResult<true> {
  if (!Number.isFinite(input.credits) || (input.credits ?? 0) <= 0 || !input.idempotencyKey || input.idempotencyKey !== input.idempotencyKey.trim() || !input.ownerId || input.ownerId !== input.ownerId.trim()) return validationFailure("Credit usage input is invalid.");
  return success(true);
}
function toCommit(row: BillingUsageRow, consumedCredits: number, deduplicated: boolean, accountingPending = false): BillingAiCreditUsageCommit { return { accountingPending, consumedCredits, creditLedgerId: row.relatedCreditLedgerId, deduplicated, usageLedgerId: row.id, usageStatus: row.status }; }
function success<T>(data: T): LedgerCommitResult<T> { return { data, ok: true }; }
function failure(message: string): LedgerCommitResult<never> { return { error: { code: "system_error", message }, ok: false }; }
function validationFailure(message: string): LedgerCommitResult<never> { return { error: { code: "validation_error", message }, ok: false }; }
