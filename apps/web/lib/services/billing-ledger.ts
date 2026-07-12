import { serviceOk, type BillingFeatureKey, type ServiceResult } from "@xwlc/core";

import type { Json } from "../supabase/database.types";
import type { AppSupabaseClient } from "../supabase/server";
import { createSupabaseAdminClient } from "../supabase/server";

import { commitAiCreditUsageWithStore, failAiCreditUsageWithStore, reconcileReservedAiCreditUsageWithStore, reserveAiCreditUsageWithStore, type BillingAiCreditUsageCommit, type BillingLedgerStore } from "./billing-ledger-commit";
export { commitAiCreditUsageWithStore, failAiCreditUsageWithStore, reconcileReservedAiCreditUsageWithStore, reserveAiCreditUsageWithStore, type BillingAiCreditUsageCommit, type BillingLedgerStore } from "./billing-ledger-commit";

export async function reserveAiCreditUsage(input: { credits: number; idempotencyKey: string; metadata: Json; ownerId: string }) {
  const admin = createSupabaseAdminClient();
  if (!admin.ok) return admin;
  return reserveAiCreditUsageWithStore(input, createSupabaseBillingLedgerStore(admin.data));
}

export async function failAiCreditUsage(input: { idempotencyKey: string; ownerId: string }) {
  const admin = createSupabaseAdminClient();
  if (!admin.ok) return admin;
  return failAiCreditUsageWithStore(input, createSupabaseBillingLedgerStore(admin.data));
}

export async function reconcileReservedAiCreditUsage(input: { idempotencyKey: string; ownerId: string }) {
  const admin = createSupabaseAdminClient();
  if (!admin.ok) return admin;
  return reconcileReservedAiCreditUsageWithStore(input, createSupabaseBillingLedgerStore(admin.data));
}

export async function commitAiCreditUsage(input: {
  credits: number; featureKey: Extract<BillingFeatureKey, "ai_tokens">; idempotencyKey: string; metadata: Json; ownerId: string; reason: string; sourceId: string;
}): Promise<ServiceResult<BillingAiCreditUsageCommit>> {
  const admin = createSupabaseAdminClient();
  if (!admin.ok) return admin;
  return commitAiCreditUsageWithStore(input, createSupabaseBillingLedgerStore(admin.data));
}

export async function findCommittedAiCreditUsage(input: { idempotencyKey: string; ownerId: string }): Promise<ServiceResult<BillingAiCreditUsageCommit | null>> {
  const admin = createSupabaseAdminClient();
  if (!admin.ok) return admin;
  const usage = await createSupabaseBillingLedgerStore(admin.data).findUsage(input.ownerId, `${input.idempotencyKey}:usage`);
  if (!usage.ok) return { error: { code: "system_error", message: "Billing usage lookup failed." }, ok: false };
  return serviceOk(usage.data?.status === "committed" ? toCommit(usage.data, 0, true) : null);
}

export function createSupabaseBillingLedgerStore(client: AppSupabaseClient): BillingLedgerStore {
  return {
    async findCredit(ownerId, idempotencyKey) {
      const result = await client.from("billing_credit_ledger").select("id").eq("owner_id", ownerId).eq("idempotency_key", idempotencyKey).maybeSingle();
      return result.error ? { ok: false } : { data: result.data, ok: true };
    },
    async findUsage(ownerId, idempotencyKey) {
      const result = await client.from("billing_usage_ledger").select("id, related_credit_ledger_id, status, created_at").eq("owner_id", ownerId).eq("idempotency_key", idempotencyKey).maybeSingle();
      if (result.error) return { ok: false };
      return { data: result.data ? { createdAt: result.data.created_at, id: result.data.id, relatedCreditLedgerId: result.data.related_credit_ledger_id, status: result.data.status } : null, ok: true };
    },
    async insertCredit(input) {
      const result = await client.from("billing_credit_ledger").insert({ owner_id: input.ownerId, entitlement_id: null, event_type: "consume", amount: input.amount, unit: "credit", idempotency_key: input.idempotencyKey, source_type: "ai_usage", source_id: input.sourceId, reason: input.reason, metadata: input.metadata as Json }).select("id").single();
      if (!result.error && result.data) return { duplicate: false, id: result.data.id };
      if (result.error?.code !== "23505") return { error: true };
      const existing = await this.findCredit(input.ownerId, input.idempotencyKey);
      return existing.ok && existing.data ? { duplicate: true, id: existing.data.id } : { error: true };
    },
    async insertUsageReservation(input) {
      const result = await client.from("billing_usage_ledger").insert({ owner_id: input.ownerId, feature_key: "ai_tokens", units: input.units, unit: "credit", status: "reserved", idempotency_key: input.idempotencyKey, related_credit_ledger_id: null, metadata: input.metadata as Json }).select("id, related_credit_ledger_id, status, created_at").single();
      if (!result.error && result.data) return { duplicate: false, row: { createdAt: result.data.created_at, id: result.data.id, relatedCreditLedgerId: result.data.related_credit_ledger_id, status: result.data.status } };
      if (result.error?.code !== "23505") return { error: true };
      const existing = await this.findUsage(input.ownerId, input.idempotencyKey);
      return existing.ok && existing.data ? { duplicate: true, row: existing.data } : { error: true };
    },
    async updateUsage(input) {
      const result = await client.from("billing_usage_ledger").update({ related_credit_ledger_id: input.creditLedgerId, status: input.status }).eq("id", input.id).eq("status", input.expectedStatus).select("id, related_credit_ledger_id, status, created_at").maybeSingle();
      if (result.error) return { ok: false };
      return { data: result.data ? { createdAt: result.data.created_at, id: result.data.id, relatedCreditLedgerId: result.data.related_credit_ledger_id, status: result.data.status } : null, ok: true };
    }
  };
}

function toCommit(row: { id: string; relatedCreditLedgerId: string | null; status: BillingAiCreditUsageCommit["usageStatus"] }, consumedCredits: number, deduplicated: boolean): BillingAiCreditUsageCommit {
  return { accountingPending: false, consumedCredits, creditLedgerId: row.relatedCreditLedgerId, deduplicated, usageLedgerId: row.id, usageStatus: row.status };
}
