import {
  assertBillingEntitlement as evaluateBillingEntitlement,
  billingFeatureKeys,
  billingPlanIds,
  billingPriceIds,
  createBillingSnapshot,
  serviceError,
  serviceOk,
  type BillingEntitlement,
  type BillingEntitlementDecision,
  type BillingEntitlementSnapshot,
  type BillingFeatureKey,
  type BillingPlanId,
  type BillingPriceId,
  type BillingSubscription,
  type ServiceResult
} from "@starter/core";

import {
  createSupabaseServerClient,
  type AppSupabaseClient
} from "../supabase/server";
import type { Database } from "../supabase/database.types";

type BillingEntitlementRow =
  Database["public"]["Tables"]["billing_entitlements"]["Row"];
type BillingSubscriptionRow =
  Database["public"]["Tables"]["billing_subscriptions"]["Row"];

export async function getCurrentBillingEntitlements(): Promise<
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

  const subscriptionResult = await getLatestSubscription(
    clientResult.data,
    userIdResult.data
  );

  if (!subscriptionResult.ok) {
    return subscriptionResult;
  }

  const entitlementsResult = await listActiveEntitlements(
    clientResult.data,
    userIdResult.data
  );

  if (!entitlementsResult.ok) {
    return entitlementsResult;
  }

  const subscription = subscriptionResult.data;

  return serviceOk(
    createBillingSnapshot({
      ownerId: userIdResult.data,
      planId: subscription?.planId ?? "free",
      subscriptionStatus: subscription?.status ?? "none",
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      entitlements: entitlementsResult.data
    })
  );
}

export async function assertCurrentBillingEntitlement(
  featureKey: BillingFeatureKey,
  requiredQuantity = 1
): Promise<ServiceResult<BillingEntitlementDecision>> {
  const snapshotResult = await getCurrentBillingEntitlements();

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
      .filter((row): row is BillingEntitlement => Boolean(row))
  );
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
            unit: row.unit === "token" ? "token" : "count",
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
