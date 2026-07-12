import {
  assertBillingEntitlement as evaluateBillingEntitlement,
  billingFeatureKeys,
  billingPlanIds,
  billingPriceIds,
  createBillingSnapshot,
  serviceError,
  serviceOk,
  type BillingAllowance,
  type BillingEntitlement,
  type BillingEntitlementDecision,
  type BillingEntitlementSnapshot,
  type BillingFeatureKey,
  type BillingPlanId,
  type BillingPriceId,
  type BillingSubscription,
  type ServiceResult
} from "@xwlc/core";
import { randomUUID } from "crypto";
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import {
  formatAiCreditsAsUsesLabel,
  formatAiUsesFromCredits
} from "./ai-credit-format";
import type { Database } from "../supabase/database.types";
export { commitAiCreditUsage, failAiCreditUsage, findCommittedAiCreditUsage, reconcileReservedAiCreditUsage, reserveAiCreditUsage, type BillingAiCreditUsageCommit } from "./billing-ledger";

export {
  formatAiCreditsAsUsesLabel,
  formatAiUsesFromCredits
} from "./ai-credit-format";

type BillingEntitlementRow =
  Database["public"]["Tables"]["billing_entitlements"]["Row"];
type BillingSubscriptionRow =
  Database["public"]["Tables"]["billing_subscriptions"]["Row"];
type BillingUsageRow = Pick<
  Database["public"]["Tables"]["billing_usage_ledger"]["Row"],
  "feature_key" | "units"
>;
type BillingOrderRecordRow = Pick<
  Database["public"]["Tables"]["billing_orders"]["Row"],
  "id" | "plan_id" | "price_id" | "status" | "currency" | "amount_cents" | "occurred_at"
>;
type BillingUsageRecordRow = Pick<
  Database["public"]["Tables"]["billing_usage_ledger"]["Row"],
  "id" | "feature_key" | "units" | "unit" | "status" | "created_at"
>;

const billingPlanCacheTtlMs = 5 * 60_000;
const billingSnapshotCacheTtlMs = billingPlanCacheTtlMs;
const billingEntitlementTagPrefix = "billing-entitlements";
const billingPlanCache = new Map<
  string,
  {
    expiresAt: number;
    value: BillingPlanId;
  }
>();

export type BillingPaymentRecord = {
  amountCents: number;
  currency: string;
  id: string;
  occurredAt: string;
  planId: string;
  priceId: string;
  status: BillingOrderRecordRow["status"];
};

export type BillingUsageRecord = {
  createdAt: string;
  featureKey: BillingFeatureKey;
  id: string;
  status: BillingUsageRecordRow["status"];
  unit: string;
  units: number;
};

export type BillingActivity = {
  paymentRecords: BillingPaymentRecord[];
  usageRecords: BillingUsageRecord[];
};


export function getQuantityAllowanceUsage(allowance: BillingAllowance) {
  if (allowance.kind !== "quantity") {
    return null;
  }

  const used = allowance.used ?? 0;

  return {
    quantity: allowance.quantity,
    remaining: Math.max(allowance.quantity - used, 0),
    used
  };
}

export function formatQuantityAllowanceLabel(allowance: BillingAllowance) {
  const usage = getQuantityAllowanceUsage(allowance);

  return usage
    ? `${formatBillingNumber(usage.remaining)} / ${formatBillingNumber(usage.quantity)}`
    : "不可用";
}

export function getAiCreditAllowanceUsage(allowance: BillingAllowance) {
  if (allowance.kind !== "quantity") {
    return null;
  }

  const used = allowance.used ?? 0;
  const quantity = allowance.quantity;

  return {
    quantity: formatAiUsesFromCredits(quantity),
    remaining: formatAiUsesFromCredits(Math.max(quantity - used, 0)),
    used: formatAiUsesFromCredits(used)
  };
}

export function formatAiCreditAllowanceLabel(allowance: BillingAllowance) {
  if (allowance.kind !== "quantity") {
    return "不可用";
  }

  const remaining = Math.max(allowance.quantity - (allowance.used ?? 0), 0);

  return `${formatAiCreditsAsUsesLabel(remaining)} / ${formatAiCreditsAsUsesLabel(allowance.quantity)}`;
}

export const getCurrentBillingEntitlements = cache(
  async function getCurrentBillingEntitlements(): Promise<
    ServiceResult<BillingEntitlementSnapshot>
  > {
    const clientResult = await createSupabaseServerClient();

    if (!clientResult.ok) {
      return clientResult;
    }

    const userIdResult = await getAuthenticatedUserId(clientResult.data);

    if (!userIdResult.ok) {
      return userIdResult;
    }

    return getCachedBillingEntitlementSnapshot(userIdResult.data);
  }
);

export async function getCurrentBillingEntitlementsForGate(): Promise<
  ServiceResult<BillingEntitlementSnapshot>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userIdResult = await getAuthenticatedUserId(clientResult.data);

  if (!userIdResult.ok) {
    return userIdResult;
  }

  return getBillingEntitlementSnapshot(clientResult.data, userIdResult.data);
}

export const getCurrentBillingPlanId = cache(
  async function getCurrentBillingPlanId(): Promise<ServiceResult<BillingPlanId>> {
    const clientResult = await createSupabaseServerClient();

    if (!clientResult.ok) {
      return clientResult;
    }

    const userIdResult = await getAuthenticatedUserId(clientResult.data);

    if (!userIdResult.ok) {
      return userIdResult;
    }

    const cachedPlanId = readBillingPlanCache(userIdResult.data);

    if (cachedPlanId) {
      return serviceOk(cachedPlanId);
    }

    const subscriptionResult = await getLatestSubscription(
      clientResult.data,
      userIdResult.data
    );

    if (!subscriptionResult.ok) {
      return subscriptionResult;
    }

    const planId = subscriptionResult.data?.planId ?? "free";
    writeBillingPlanCache(userIdResult.data, planId);

    return serviceOk(planId);
  }
);

export function clearBillingCacheForOwner(ownerId: string) {
  billingPlanCache.delete(ownerId);
  revalidateTag(getBillingEntitlementTag(ownerId));
}

function getBillingEntitlementTag(ownerId: string) {
  return `${billingEntitlementTagPrefix}:${ownerId}`;
}

function getCachedBillingEntitlementSnapshot(ownerId: string) {
  return unstable_cache(
    async () => {
      const adminResult = createSupabaseAdminClient();

      if (!adminResult.ok) {
        return adminResult;
      }

      return getBillingEntitlementSnapshot(adminResult.data, ownerId);
    },
    [billingEntitlementTagPrefix, ownerId],
    {
      revalidate: Math.floor(billingSnapshotCacheTtlMs / 1000),
      tags: [getBillingEntitlementTag(ownerId)]
    }
  )();
}

export async function assertCurrentBillingEntitlement(
  featureKey: BillingFeatureKey,
  requiredQuantity = 1
): Promise<ServiceResult<BillingEntitlementDecision>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userIdResult = await getAuthenticatedUserId(clientResult.data);

  if (!userIdResult.ok) {
    return userIdResult;
  }

  const snapshotResult = await getBillingEntitlementSnapshot(
    clientResult.data,
    userIdResult.data
  );

  if (!snapshotResult.ok) {
    return snapshotResult;
  }

  return serviceOk(
    evaluateBillingEntitlement(
      snapshotResult.data,
      featureKey,
      requiredQuantity
    )
  );
}

export async function getCurrentBillingActivity(): Promise<
  ServiceResult<BillingActivity>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userIdResult = await getAuthenticatedUserId(clientResult.data);

  if (!userIdResult.ok) {
    return userIdResult;
  }

  const paymentResult = await listPaymentRecords(
    clientResult.data,
    userIdResult.data
  );

  if (!paymentResult.ok) {
    return paymentResult;
  }

  const usageResult = await listUsageRecords(
    clientResult.data,
    userIdResult.data
  );

  if (!usageResult.ok) {
    return usageResult;
  }

  return serviceOk({
    paymentRecords: paymentResult.data,
    usageRecords: usageResult.data
  });
}

export async function switchCurrentBillingPlanToFree(): Promise<
  ServiceResult<{ planId: "free" }>
> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const userIdResult = await getAuthenticatedUserId(clientResult.data);

  if (!userIdResult.ok) {
    return userIdResult;
  }

  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const now = new Date().toISOString();
  const eventId = randomUUID();
  const idempotencyKey = `billing:plan_switch:${userIdResult.data}:free:${eventId}`;

  const cancelResult = await adminResult.data
    .from("billing_subscriptions")
    .update({
      cancel_at_period_end: false,
      canceled_at: now,
      current_period_end: now,
      status: "canceled"
    })
    .eq("owner_id", userIdResult.data)
    .neq("plan_id", "free")
    .in("status", ["trialing", "active", "past_due"]);

  if (cancelResult.error) {
    return mapSupabaseError(cancelResult.error);
  }

  const orderResult = await adminResult.data
    .from("billing_orders")
    .insert({
      owner_id: userIdResult.data,
      provider: "sandbox",
      provider_order_id: `sandbox-plan-change-${eventId}`,
      idempotency_key: idempotencyKey,
      plan_id: "free",
      price_id: "free",
      status: "paid",
      currency: "usd",
      amount_cents: 0,
      metadata: {
        source: "account_plan_switch",
        target_plan: "free"
      },
      occurred_at: now
    })
    .select("id")
    .single();

  if (orderResult.error || !orderResult.data) {
    return mapSupabaseError(orderResult.error ?? {});
  }

  const subscriptionResult = await adminResult.data
    .from("billing_subscriptions")
    .insert({
      owner_id: userIdResult.data,
      provider: "sandbox",
      provider_subscription_id: `sandbox-free-plan-${eventId}`,
      plan_id: "free",
      price_id: "free",
      status: "active",
      current_period_start: now,
      current_period_end: null,
      metadata: {
        order_id: orderResult.data.id,
        source: "account_plan_switch"
      }
    });

  if (subscriptionResult.error) {
    return mapSupabaseError(subscriptionResult.error);
  }

  clearBillingCacheForOwner(userIdResult.data);

  return serviceOk({ planId: "free" });
}

async function getAuthenticatedUserId(
  supabase: AppSupabaseClient
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return serviceError(
      "unauthorized",
      "Sign in before using billing features."
    );
  }

  return serviceOk(userId);
}

async function getLatestSubscription(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<BillingSubscription | null>> {
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select(
      "id, owner_id, provider, provider_subscription_id, plan_id, price_id, status, current_period_start, current_period_end, trial_ends_at, cancel_at_period_end, canceled_at, metadata, created_at, updated_at"
    )
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return mapSupabaseError(error);
  }

  if (!data) {
    return serviceOk(null);
  }

  const mapped = mapBillingSubscription(data);

  if (!mapped) {
    return serviceError(
      "system_error",
      "The billing subscription has an unsupported plan or price."
    );
  }

  return serviceOk(mapped);
}

async function listActiveEntitlements(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<BillingEntitlement[]>> {
  const { data, error } = await supabase
    .from("billing_entitlements")
    .select(
      "id, owner_id, source_type, source_id, feature_key, allowance_kind, quantity, quantity_used, unit, renews_at, expires_at, status, metadata, created_at, updated_at"
    )
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(
    (data ?? [])
      .map(mapBillingEntitlement)
      .filter(isAdditionalBillingEntitlement)
  );
}

function isAdditionalBillingEntitlement(
  entitlement: BillingEntitlement | null
): entitlement is BillingEntitlement {
  return (
    Boolean(entitlement) &&
    entitlement?.sourceType !== "plan" &&
    entitlement?.sourceType !== "subscription"
  );
}

async function listCommittedUsage(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<Partial<Record<BillingFeatureKey, number>>>> {
  const { data, error } = await supabase
    .from("billing_usage_ledger")
    .select("feature_key, units")
    .eq("owner_id", ownerId)
    .eq("status", "committed");

  if (error) {
    return mapSupabaseError(error);
  }

  const totals: Partial<Record<BillingFeatureKey, number>> = {};

  for (const row of (data ?? []) as BillingUsageRow[]) {
    if (!isBillingFeatureKey(row.feature_key)) {
      continue;
    }

    totals[row.feature_key] = (totals[row.feature_key] ?? 0) + row.units;
  }

  return serviceOk(totals);
}

async function listPaymentRecords(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<BillingPaymentRecord[]>> {
  const { data, error } = await supabase
    .from("billing_orders")
    .select("id, plan_id, price_id, status, currency, amount_cents, occurred_at")
    .eq("owner_id", ownerId)
    .neq("status", "pending")
    .order("occurred_at", { ascending: false })
    .limit(5);

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(
    ((data ?? []) as BillingOrderRecordRow[]).map((row) => ({
      amountCents: row.amount_cents,
      currency: row.currency,
      id: row.id,
      occurredAt: row.occurred_at,
      planId: row.plan_id,
      priceId: row.price_id,
      status: row.status
    }))
  );
}

async function listUsageRecords(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<BillingUsageRecord[]>> {
  const { data, error } = await supabase
    .from("billing_usage_ledger")
    .select("id, feature_key, units, unit, status, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return mapSupabaseError(error);
  }

  return serviceOk(
    ((data ?? []) as BillingUsageRecordRow[])
      .filter((row) => isBillingFeatureKey(row.feature_key))
      .map((row) => ({
        createdAt: row.created_at,
        featureKey: row.feature_key as BillingFeatureKey,
        id: row.id,
        status: row.status,
        unit: row.unit,
        units: row.units
      }))
  );
}

async function getBillingEntitlementSnapshot(
  supabase: AppSupabaseClient,
  ownerId: string
): Promise<ServiceResult<BillingEntitlementSnapshot>> {
  const subscriptionResult = await getLatestSubscription(supabase, ownerId);

  if (!subscriptionResult.ok) {
    return subscriptionResult;
  }

  const entitlementsResult = await listActiveEntitlements(supabase, ownerId);

  if (!entitlementsResult.ok) {
    return entitlementsResult;
  }

  const usageResult = await listCommittedUsage(supabase, ownerId);

  if (!usageResult.ok) {
    return usageResult;
  }

  const subscription = subscriptionResult.data;
  const snapshot = createBillingSnapshot({
    ownerId,
    planId: subscription?.planId ?? "free",
    subscriptionStatus: subscription?.status ?? "none",
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    entitlements: entitlementsResult.data
  });

  return serviceOk(applyUsageToSnapshot(snapshot, usageResult.data));
}

function applyUsageToSnapshot(
  snapshot: BillingEntitlementSnapshot,
  usageTotals: Partial<Record<BillingFeatureKey, number>>
): BillingEntitlementSnapshot {
  return {
    ...snapshot,
    entitlements: Object.fromEntries(
      Object.entries(snapshot.entitlements).map(([featureKey, allowance]) => [
        featureKey,
        applyUsageToAllowance(
          allowance,
          usageTotals[featureKey as BillingFeatureKey] ?? 0
        )
      ])
    ) as BillingEntitlementSnapshot["entitlements"]
  };
}

function readBillingPlanCache(ownerId: string): BillingPlanId | null {
  const entry = billingPlanCache.get(ownerId);

  if (!entry || entry.expiresAt <= Date.now()) {
    billingPlanCache.delete(ownerId);
    return null;
  }

  return entry.value;
}

function writeBillingPlanCache(ownerId: string, value: BillingPlanId) {
  billingPlanCache.set(ownerId, {
    expiresAt: Date.now() + billingPlanCacheTtlMs,
    value
  });
}

function applyUsageToAllowance(
  allowance: BillingAllowance,
  used: number
): BillingAllowance {
  if (allowance.kind === "boolean") {
    return allowance;
  }

  return {
    ...allowance,
    used: (allowance.used ?? 0) + used
  };
}

function formatBillingNumber(value: number) {
  return Math.max(value, 0).toLocaleString("zh-CN");
}

function mapBillingSubscription(
  row: BillingSubscriptionRow
): BillingSubscription | null {
  const planId = isBillingPlanId(row.plan_id) ? row.plan_id : null;
  const priceId = isBillingPriceId(row.price_id) ? row.price_id : null;

  if (!planId || !priceId) {
    return null;
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    planId,
    priceId,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    trialEndsAt: row.trial_ends_at,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBillingEntitlement(
  row: BillingEntitlementRow
): BillingEntitlement | null {
  if (!isBillingFeatureKey(row.feature_key)) {
    return null;
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    featureKey: row.feature_key,
    allowance:
      row.allowance_kind === "boolean"
        ? { kind: "boolean", enabled: true }
        : {
            kind: "quantity",
            quantity: row.quantity ?? 0,
            unit:
              row.unit === "credit" || row.unit === "token"
                ? "credit"
                : "count",
            used: row.quantity_used
          },
    renewsAt: row.renews_at,
    expiresAt: row.expires_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function isBillingFeatureKey(value: string): value is BillingFeatureKey {
  return billingFeatureKeys.includes(value as BillingFeatureKey);
}

function isBillingPlanId(value: string): value is BillingPlanId {
  return billingPlanIds.includes(value as BillingPlanId);
}

function isBillingPriceId(value: string): value is BillingPriceId {
  return billingPriceIds.includes(value as BillingPriceId);
}

function mapSupabaseError(error: { code?: string }): ServiceResult<never> {
  if (error.code === "42501") {
    return serviceError(
      "forbidden",
      "This account does not have access to that billing data."
    );
  }

  if (error.code === "PGRST116") {
    return serviceError("not_found", "The requested billing record was not found.");
  }

  return serviceError(
    "system_error",
    "The billing service is temporarily unavailable."
  );
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}
