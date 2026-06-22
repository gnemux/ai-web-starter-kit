import {
  createPaymentIdempotencyKey,
  getBillingPrice,
  getCheckoutOption,
  isBillingCheckoutPriceId,
  listCheckoutOptions,
  normalizePaymentWebhookEvent,
  serviceError,
  serviceOk,
  type BillingEntitlementSnapshot,
  type BillingOrderStatus,
  type BillingFeatureKey,
  type BillingPriceId,
  type PaymentAnalyticsEvent,
  type PaymentAnalyticsProperties,
  type PaymentCheckoutResultStatus,
  type PaymentReviewState,
  type PaymentWebhookAcknowledgement,
  type ServiceResult
} from "@starter/core";
import { randomUUID } from "crypto";

import { trackServerEvent } from "@/lib/analytics/server";
import { createSandboxPaymentProvider } from "@/lib/providers/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

import { getCurrentAccount } from "./auth";
import {
  assertCurrentBillingEntitlement,
  getCurrentBillingEntitlements
} from "./billing";

export type PaymentPageState = PaymentReviewState & {
  ownerId: string;
  billing: ServiceResult<BillingEntitlementSnapshot>;
};

export type SandboxCheckoutState = {
  checkoutSessionId: string;
  priceId: BillingPriceId;
  planId: string | null;
  returnUrl: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
};

export type PaymentResultState = {
  status: PaymentCheckoutResultStatus;
  checkoutSessionId: string | null;
  priceId: BillingPriceId | null;
  billing: ServiceResult<BillingEntitlementSnapshot>;
};

export type PaymentQuotaGateResult = {
  allowed: boolean;
  featureKey: BillingFeatureKey;
  planId: string;
  reason: string;
  remaining: number | null;
  requestedQuantity: number;
};

export const paymentReviewAiCreditCost = 10000;

export type PaymentReviewUsageResult = {
  allowed: boolean;
  consumedUnits: number;
  featureKey: BillingFeatureKey;
  planId: string;
  reason: string;
  remaining: number | null;
};

export async function getPaymentPageState(): Promise<
  ServiceResult<PaymentPageState>
> {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const provider = createSandboxPaymentProvider();
  const billing = await getCurrentBillingEntitlements();

  return serviceOk({
    ownerId: accountResult.data.user.id,
    provider: provider.descriptor.provider,
    mode: provider.descriptor.mode,
    checkoutOptions: listCheckoutOptions(),
    billing
  });
}

export async function createPaymentCheckoutFromFormData(
  formData: FormData
): Promise<ServiceResult<{ redirectTo: string }>> {
  const priceIdValue = String(formData.get("priceId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  return createPaymentCheckout(priceIdValue, { returnTo });
}

export async function createPaymentCheckout(
  priceIdValue: string,
  options: { returnTo?: string } = {}
): Promise<ServiceResult<{ redirectTo: string }>> {
  const normalizedPriceId = priceIdValue.trim();

  if (!isBillingCheckoutPriceId(normalizedPriceId)) {
    return serviceError(
      "validation_error",
      "Choose a supported checkout price."
    );
  }

  const optionResult = getCheckoutOption(normalizedPriceId);

  if (!optionResult.ok) {
    return optionResult;
  }

  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const price = optionResult.data.price;
  const provider = createSandboxPaymentProvider();
  const returnTo = normalizeReturnTo(options.returnTo, "/account/payment");
  const result = await provider.createCheckoutSession({
    userId: accountResult.data.user.id,
    planId: price.planId ?? "credit_pack",
    priceId: price.id,
    checkoutUrl: "/account/payment/sandbox",
    successUrl: buildResultUrl("success", price.id),
    cancelUrl: buildResultUrl("cancel", price.id),
    failureUrl: buildResultUrl("failure", price.id),
    metadata: {
      checkout_kind: optionResult.data.checkoutKind,
      return_url: returnTo,
      source: "account_payment_review"
    }
  });

  if (!result.ok) {
    return result;
  }

  if (!result.data.url) {
    return serviceError(
      "system_error",
      "The payment provider did not return a checkout URL."
    );
  }

  await trackPaymentEvent({
    distinctId: accountResult.data.user.id,
    event: "checkout_started",
    properties: buildPaymentAnalyticsProperties({
      checkoutKind: optionResult.data.checkoutKind,
      checkoutSessionId: result.data.id,
      priceId: price.id,
      provider: provider.descriptor.provider,
      result: undefined,
      source: "account_payment_review"
    })
  });

  return serviceOk({
    redirectTo: result.data.url
  });
}

export function getSandboxCheckoutState(input: {
  checkoutSessionId?: string;
  priceId?: string;
  planId?: string;
  successUrl?: string;
  cancelUrl?: string;
  failureUrl?: string;
  returnUrl?: string;
}): ServiceResult<SandboxCheckoutState> {
  const checkoutSessionId = String(input.checkoutSessionId ?? "").trim();
  const priceId = String(input.priceId ?? "").trim();
  const planId = String(input.planId ?? "").trim();
  const successUrl = String(input.successUrl ?? "").trim();
  const cancelUrl = String(input.cancelUrl ?? "").trim();
  const failureUrl = String(input.failureUrl ?? "").trim();
  const returnUrl = normalizeReturnTo(input.returnUrl, "/account/payment");

  if (
    !checkoutSessionId ||
    !isBillingCheckoutPriceId(priceId) ||
    !successUrl ||
    !cancelUrl ||
    !failureUrl
  ) {
    return serviceError(
      "validation_error",
      "The sandbox checkout session is incomplete."
    );
  }

  return serviceOk({
    checkoutSessionId,
    priceId,
    planId: planId || (getBillingPrice(priceId)?.planId ?? null),
    returnUrl,
    successUrl: withSessionId(successUrl, checkoutSessionId),
    cancelUrl: withSessionId(cancelUrl, checkoutSessionId),
    failureUrl: withSessionId(failureUrl, checkoutSessionId)
  });
}

export async function getPaymentResultState(input: {
  status?: string;
  checkoutSessionId?: string;
  priceId?: string;
}): Promise<ServiceResult<PaymentResultState>> {
  const status = normalizeResultStatus(input.status);

  if (!status) {
    return serviceError(
      "validation_error",
      "The payment result status is not supported."
    );
  }

  const billing = await getCurrentBillingEntitlements();
  const priceId =
    input.priceId && isBillingCheckoutPriceId(input.priceId)
      ? input.priceId
      : null;

  return serviceOk({
    status,
    checkoutSessionId: input.checkoutSessionId?.trim() || null,
    priceId,
    billing
  });
}

export async function processSandboxCheckoutResult(input: {
  checkoutSessionId: string;
  priceId: BillingPriceId;
  returnTo?: string;
  status: PaymentCheckoutResultStatus;
}): Promise<ServiceResult<{ redirectTo: string }>> {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const optionResult = getCheckoutOption(input.priceId);

  if (!optionResult.ok) {
    return optionResult;
  }

  const checkoutSessionId = input.checkoutSessionId.trim();

  if (!checkoutSessionId) {
    return serviceError(
      "validation_error",
      "Sandbox checkout session is required."
    );
  }

  const orderResult = await recordSandboxBillingFacts({
    amountCents: optionResult.data.price.amountCents,
    checkoutKind: optionResult.data.checkoutKind,
    checkoutSessionId,
    currency: optionResult.data.price.currency,
    ownerId: accountResult.data.user.id,
    planId: optionResult.data.price.planId ?? "credit_pack",
    priceId: optionResult.data.price.id,
    status: input.status
  });

  if (!orderResult.ok) {
    return orderResult;
  }

  const provider = createSandboxPaymentProvider();
  const analyticsProperties = buildPaymentAnalyticsProperties({
    checkoutKind: optionResult.data.checkoutKind,
    checkoutSessionId,
    orderStatus: orderResult.data.orderStatus,
    priceId: optionResult.data.price.id,
    provider: provider.descriptor.provider,
    result: input.status,
    source: "sandbox_payment_result"
  });

  if (input.status === "success") {
    await trackPaymentEvent({
      distinctId: accountResult.data.user.id,
      event: "payment_succeeded",
      properties: analyticsProperties
    });
    await trackPaymentEvent({
      distinctId: accountResult.data.user.id,
      event: "entitlement_granted",
      properties: {
        ...analyticsProperties,
        entitlement_type:
          optionResult.data.checkoutKind === "subscription"
            ? "subscription"
            : "credit_pack"
      }
    });

    return serviceOk({
      redirectTo: withPaymentResult(
        normalizeReturnTo(input.returnTo, "/account/billing"),
        input.status,
        input.priceId
      )
    });
  }

  await trackPaymentEvent({
    distinctId: accountResult.data.user.id,
    event: input.status === "cancel" ? "payment_canceled" : "payment_failed",
    properties: analyticsProperties
  });

  return serviceOk({
    redirectTo:
      input.status === "cancel"
        ? withPaymentResult(
            normalizeReturnTo(input.returnTo, "/account/billing"),
            input.status,
            input.priceId
          )
        : buildResultRedirectUrl({
            checkoutSessionId,
            priceId: input.priceId,
            status: input.status
          })
  });
}

export async function reviewPaymentQuotaLimit(): Promise<
  ServiceResult<PaymentQuotaGateResult>
> {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const billingResult = await getCurrentBillingEntitlements();

  if (!billingResult.ok) {
    return billingResult;
  }

  const featureKey: BillingFeatureKey = "leads";
  const requestedQuantity = 1;
  const decisionResult = await assertCurrentBillingEntitlement(
    featureKey,
    requestedQuantity
  );

  if (!decisionResult.ok) {
    return decisionResult;
  }

  if (!decisionResult.data.allowed) {
    await trackPaymentEvent({
      distinctId: accountResult.data.user.id,
      event: "quota_limit_reached",
      properties: {
        feature_key: featureKey,
        payment_mode: normalizePaymentAnalyticsMode(process.env.PAYMENT_MODE),
        plan: billingResult.data.planId,
        provider: createSandboxPaymentProvider().descriptor.provider,
        quota_reason: normalizeQuotaReason(decisionResult.data.reason),
        remaining_units: decisionResult.data.remaining,
        requested_units: requestedQuantity,
        source: "payment_quota_review"
      }
    });
  }

  return serviceOk({
    allowed: decisionResult.data.allowed,
    featureKey,
    planId: billingResult.data.planId,
    reason: decisionResult.data.reason,
    remaining: decisionResult.data.remaining ?? null,
    requestedQuantity
  });
}

export async function consumePaymentReviewAiUsage(): Promise<
  ServiceResult<PaymentReviewUsageResult>
> {
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const billingResult = await getCurrentBillingEntitlements();

  if (!billingResult.ok) {
    return billingResult;
  }

  const featureKey: BillingFeatureKey = "ai_tokens";
  const decisionResult = await assertCurrentBillingEntitlement(
    featureKey,
    paymentReviewAiCreditCost
  );

  if (!decisionResult.ok) {
    return decisionResult;
  }

  if (!decisionResult.data.allowed) {
    await trackPaymentEvent({
      distinctId: accountResult.data.user.id,
      event: "quota_limit_reached",
      properties: {
        feature_key: featureKey,
        payment_mode: normalizePaymentAnalyticsMode(process.env.PAYMENT_MODE),
        plan: billingResult.data.planId,
        provider: createSandboxPaymentProvider().descriptor.provider,
        quota_reason: normalizeQuotaReason(decisionResult.data.reason),
        remaining_units: decisionResult.data.remaining,
        requested_units: paymentReviewAiCreditCost,
        source: "account_ai_usage_demo"
      }
    });

    return serviceOk({
      allowed: false,
      consumedUnits: 0,
      featureKey,
      planId: billingResult.data.planId,
      reason: decisionResult.data.reason,
      remaining: decisionResult.data.remaining ?? null
    });
  }

  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const usageId = randomUUID();
  const usageResult = await adminResult.data.from("billing_usage_ledger").insert({
    owner_id: accountResult.data.user.id,
    feature_key: featureKey,
    units: paymentReviewAiCreditCost,
    unit: "credit",
    status: "committed",
    idempotency_key: `account_ai_usage_demo:${usageId}`,
    metadata: {
      source: "account_ai_usage_demo"
    }
  });

  if (usageResult.error) {
    return mapSupabasePaymentError(usageResult.error);
  }

  return serviceOk({
    allowed: true,
    consumedUnits: paymentReviewAiCreditCost,
    featureKey,
    planId: billingResult.data.planId,
    reason: decisionResult.data.reason,
    remaining:
      decisionResult.data.remaining === undefined
        ? null
        : Math.max(decisionResult.data.remaining - paymentReviewAiCreditCost, 0)
  });
}

export function acknowledgeSandboxWebhook(
  input: Record<string, unknown>
): ServiceResult<PaymentWebhookAcknowledgement> {
  const eventResult = normalizePaymentWebhookEvent(input);

  if (!eventResult.ok) {
    return eventResult;
  }

  if (eventResult.data.provider !== "sandbox") {
    return serviceError(
      "configuration_error",
      "Only sandbox payment events are accepted by this MVP2 route."
    );
  }

  return serviceOk({
    accepted: true,
    idempotencyKey: createPaymentIdempotencyKey({
      provider: eventResult.data.provider,
      eventId: eventResult.data.eventId
    }),
    message:
      "Sandbox payment event acknowledged. No Billing facts were written."
  });
}

async function recordSandboxBillingFacts(input: {
  amountCents: number;
  checkoutKind: "subscription" | "credit_pack";
  checkoutSessionId: string;
  currency: "usd";
  ownerId: string;
  planId: string;
  priceId: BillingPriceId;
  status: PaymentCheckoutResultStatus;
}): Promise<ServiceResult<{ orderStatus: BillingOrderStatus }>> {
  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const orderStatus = mapResultToOrderStatus(input.status);
  const idempotencyKey = createPaymentIdempotencyKey({
    provider: "sandbox",
    eventId: `${input.checkoutSessionId}:${input.status}`
  });
  const providerOrderId = `sandbox-order-${input.checkoutSessionId}:${input.status}`;
  const orderResult = await adminResult.data
    .from("billing_orders")
    .upsert(
      {
        owner_id: input.ownerId,
        provider: "sandbox",
        provider_order_id: providerOrderId,
        provider_checkout_session_id: input.checkoutSessionId,
        idempotency_key: idempotencyKey,
        plan_id: input.planId,
        price_id: input.priceId,
        status: orderStatus,
        currency: input.currency,
        amount_cents: input.amountCents,
        metadata: {
          checkout_kind: input.checkoutKind,
          source: "sandbox_payment_result"
        },
        occurred_at: new Date().toISOString()
      },
      {
        onConflict: "idempotency_key"
      }
    )
    .select("id")
    .single();

  if (orderResult.error || !orderResult.data) {
    return mapSupabasePaymentError(orderResult.error);
  }

  if (input.status !== "success") {
    return serviceOk({ orderStatus });
  }

  if (input.checkoutKind === "subscription" && input.planId !== "credit_pack") {
    const now = new Date();
    const cancelResult = await adminResult.data
      .from("billing_subscriptions")
      .update({
        cancel_at_period_end: false,
        canceled_at: now.toISOString(),
        current_period_end: now.toISOString(),
        status: "canceled"
      })
      .eq("owner_id", input.ownerId)
      .neq("plan_id", input.planId)
      .in("status", ["trialing", "active", "past_due"]);

    if (cancelResult.error) {
      return mapSupabasePaymentError(cancelResult.error);
    }

    const subscriptionResult = await adminResult.data
      .from("billing_subscriptions")
      .insert({
        owner_id: input.ownerId,
        provider: "sandbox",
        provider_subscription_id: `sandbox-subscription-${input.checkoutSessionId}`,
        plan_id: input.planId,
        price_id: input.priceId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: addMonths(now, 1).toISOString(),
        metadata: {
          order_id: orderResult.data.id,
          source: "sandbox_payment_result"
        }
      })
      .select("id")
      .single();

    if (subscriptionResult.error || !subscriptionResult.data) {
      if (subscriptionResult.error?.code === "23505") {
        return serviceOk({ orderStatus });
      }

      return mapSupabasePaymentError(subscriptionResult.error);
    }
  }

  if (
    input.checkoutKind === "credit_pack" &&
    input.priceId === "ai_credit_pack_100k"
  ) {
    const entitlementResult = await adminResult.data
      .from("billing_entitlements")
      .insert({
        owner_id: input.ownerId,
        source_type: "credit_pack",
        source_id: orderResult.data.id,
        feature_key: "ai_tokens",
        allowance_kind: "quantity",
        quantity: 100000,
        unit: "credit",
        status: "active",
        metadata: {
          order_id: orderResult.data.id,
          source: "sandbox_payment_result"
        }
      })
      .select("id")
      .single();

    if (entitlementResult.error || !entitlementResult.data) {
      if (entitlementResult.error.code !== "23505") {
        return mapSupabasePaymentError(entitlementResult.error);
      }
    }

    const creditLedgerResult = await adminResult.data
      .from("billing_credit_ledger")
      .upsert(
        {
          owner_id: input.ownerId,
          entitlement_id: entitlementResult.data?.id ?? null,
          event_type: "grant",
          amount: 100000,
          unit: "credit",
          idempotency_key: `${idempotencyKey}:credit_grant`,
          source_type: "credit_pack",
          source_id: orderResult.data.id,
          reason: "Sandbox AI credit pack checkout success.",
          metadata: {
            checkout_session_id: input.checkoutSessionId
          }
        },
        {
          onConflict: "idempotency_key"
        }
      );

    if (creditLedgerResult.error) {
      return mapSupabasePaymentError(creditLedgerResult.error);
    }
  }

  return serviceOk({ orderStatus });
}

function buildResultUrl(
  status: PaymentCheckoutResultStatus,
  priceId: BillingPriceId
) {
  const params = new URLSearchParams({
    status,
    price_id: priceId
  });

  return `/account/payment/result?${params.toString()}`;
}

function buildResultRedirectUrl(input: {
  checkoutSessionId: string;
  priceId: BillingPriceId;
  status: PaymentCheckoutResultStatus;
}) {
  const params = new URLSearchParams({
    checkout_session_id: input.checkoutSessionId,
    price_id: input.priceId,
    status: input.status
  });

  return `/account/payment/result?${params.toString()}`;
}

function withSessionId(url: string, checkoutSessionId: string) {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);

  params.set("checkout_session_id", checkoutSessionId);

  return `${path}?${params.toString()}`;
}

function withPaymentResult(
  url: string,
  status: PaymentCheckoutResultStatus,
  priceId: BillingPriceId
) {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);

  params.set("payment_result", status);
  params.set("price_id", priceId);

  return `${path}?${params.toString()}`;
}

function normalizeReturnTo(value: string | undefined, fallback: string) {
  const trimmed = String(value ?? "").trim();

  if (
    !trimmed ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return fallback;
  }

  if (trimmed.startsWith("/account")) {
    return trimmed;
  }

  return fallback;
}

function normalizeResultStatus(
  status: string | undefined
): PaymentCheckoutResultStatus | null {
  if (
    status === "success" ||
    status === "cancel" ||
    status === "failure"
  ) {
    return status;
  }

  return null;
}

function mapResultToOrderStatus(
  status: PaymentCheckoutResultStatus
): BillingOrderStatus {
  if (status === "success") {
    return "paid";
  }

  if (status === "cancel") {
    return "canceled";
  }

  return "failed";
}

function addMonths(date: Date, months: number): Date {
  const nextDate = new Date(date);

  nextDate.setMonth(nextDate.getMonth() + months);

  return nextDate;
}

function mapSupabasePaymentError(error: { code?: string } | null) {
  return serviceError(
    "system_error",
    "The sandbox payment result could not update Billing facts."
  );
}

async function trackPaymentEvent(input: {
  distinctId: string;
  event: PaymentAnalyticsEvent;
  properties: PaymentAnalyticsProperties;
}) {
  await trackServerEvent({
    distinctId: input.distinctId,
    event: input.event,
    module: "payment",
    properties: input.properties
  });
}

function buildPaymentAnalyticsProperties(input: {
  checkoutKind: "subscription" | "credit_pack";
  checkoutSessionId: string;
  orderStatus?: BillingOrderStatus;
  priceId: BillingPriceId;
  provider: string;
  result?: PaymentCheckoutResultStatus;
  source: string;
}): PaymentAnalyticsProperties {
  const price = getBillingPrice(input.priceId);

  return {
    amount_cents: price?.amountCents,
    billing_period: price?.interval ?? "one_time",
    checkout_kind: input.checkoutKind,
    checkout_session_id: input.checkoutSessionId,
    currency: price?.currency,
    ...(input.orderStatus ? { order_status: input.orderStatus } : {}),
    payment_mode: normalizePaymentAnalyticsMode(process.env.PAYMENT_MODE),
    plan: price?.planId ?? "credit_pack",
    price_id: input.priceId,
    provider: input.provider,
    ...(input.result ? { result: input.result } : {}),
    source: input.source
  };
}

function normalizePaymentAnalyticsMode(
  value: string | undefined
): PaymentAnalyticsProperties["payment_mode"] {
  if (value === "test" || value === "live") {
    return value;
  }

  return "sandbox";
}

function normalizeQuotaReason(
  reason: string
): PaymentAnalyticsProperties["quota_reason"] | undefined {
  if (
    reason === "not_enabled" ||
    reason === "quota_exceeded" ||
    reason === "subscription_inactive"
  ) {
    return reason;
  }

  return undefined;
}
