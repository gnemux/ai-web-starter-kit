import {
  createPaymentIdempotencyKey,
  getBillingPrice,
  getCheckoutOption,
  isBillingCheckoutPriceId,
  isBillingPlanUpgrade,
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
} from "@xwlc/core";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";

import { trackServerEvent } from "@/lib/analytics/server";
import { createPaymentProvider } from "@/lib/providers/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

import { getCurrentAccount } from "./auth";
import {
  assertCurrentBillingEntitlement,
  clearBillingCacheForOwner,
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
  orderId: string | null;
  status: PaymentCheckoutResultStatus;
  checkoutSessionId: string | null;
  priceId: BillingPriceId | null;
  returnTo: string;
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

  const provider = createPaymentProvider();
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

  if (price.planId) {
    const billingResult = await getCurrentBillingEntitlements();

    if (!billingResult.ok) {
      return billingResult;
    }

    if (!isBillingPlanUpgrade(billingResult.data.planId, price.planId)) {
      return serviceError(
        "validation_error",
        "Choose a plan above the current subscription."
      );
    }
  }

  const provider = createPaymentProvider();
  const returnTo = normalizeReturnTo(options.returnTo, "/account/payment");
  const result = await provider.createCheckoutSession({
    userId: accountResult.data.user.id,
    planId: price.planId ?? "credit_pack",
    priceId: price.id,
    checkoutUrl: "/account/payment/sandbox",
    successUrl: buildResultUrl("success", price.id, returnTo),
    cancelUrl: buildResultUrl("cancel", price.id, returnTo),
    failureUrl: buildResultUrl("failure", price.id, returnTo),
    metadata: {
      checkout_kind: optionResult.data.checkoutKind,
      owner_id: accountResult.data.user.id,
      plan_id: price.planId ?? "credit_pack",
      price_id: price.id,
      referenceId: accountResult.data.user.id,
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

  if (isSandboxPaymentReviewProvider(provider)) {
    const pendingResult = await recordSandboxPendingCheckout({
      amountCents: price.amountCents,
      checkoutKind: optionResult.data.checkoutKind,
      checkoutSessionId: result.data.id,
      currency: price.currency,
      ownerId: accountResult.data.user.id,
      planId: price.planId ?? "credit_pack",
      priceId: price.id
    });

    if (!pendingResult.ok) {
      return pendingResult;
    }
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
  const sandboxResult = assertSandboxPaymentReviewEnabled();

  if (!sandboxResult.ok) {
    return sandboxResult;
  }

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
  orderId?: string;
  status?: string;
  checkoutSessionId?: string;
  priceId?: string;
  returnTo?: string;
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
  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const orderResult = await getConfirmedPaymentResultOrder({
    checkoutSessionId: input.checkoutSessionId,
    orderId: input.orderId,
    ownerId: accountResult.data.user.id,
    priceId,
    status
  });

  if (!orderResult.ok) {
    return orderResult;
  }

  return serviceOk({
    orderId: orderResult.data.orderId,
    status,
    checkoutSessionId: orderResult.data.checkoutSessionId,
    priceId,
    returnTo: normalizeReturnTo(input.returnTo, "/account/billing"),
    billing
  });
}

async function getConfirmedPaymentResultOrder(input: {
  checkoutSessionId?: string;
  orderId?: string;
  ownerId: string;
  priceId: BillingPriceId | null;
  status: PaymentCheckoutResultStatus;
}): Promise<ServiceResult<{ checkoutSessionId: string | null; orderId: string }>> {
  const orderId = input.orderId?.trim();
  const checkoutSessionId = input.checkoutSessionId?.trim();

  if (!orderId && !checkoutSessionId) {
    return serviceError(
      "not_found",
      "The payment result has not been confirmed by a trusted order record."
    );
  }

  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  let query = clientResult.data
    .from("billing_orders")
    .select("id, provider_checkout_session_id, price_id, status")
    .eq("owner_id", input.ownerId)
    .eq("status", mapResultToOrderStatus(input.status))
    .limit(1);

  if (input.priceId) {
    query = query.eq("price_id", input.priceId);
  }

  query = orderId
    ? query.eq("id", orderId)
    : query.eq("provider_checkout_session_id", checkoutSessionId ?? "");

  const { data, error } = await query.maybeSingle();

  if (error) {
    return mapSupabasePaymentError(error);
  }

  if (!data) {
    return serviceError(
      "not_found",
      "The payment result has not been confirmed by a trusted order record."
    );
  }

  return serviceOk({
    checkoutSessionId:
      data.provider_checkout_session_id ?? checkoutSessionId ?? null,
    orderId: data.id
  });
}

export async function processSandboxCheckoutResult(input: {
  checkoutSessionId: string;
  priceId: BillingPriceId;
  returnTo?: string;
  status: PaymentCheckoutResultStatus;
}): Promise<ServiceResult<{ redirectTo: string }>> {
  const sandboxResult = assertSandboxPaymentReviewEnabled();

  if (!sandboxResult.ok) {
    return sandboxResult;
  }

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

  const pendingResult = await assertSandboxPendingCheckout({
    checkoutSessionId,
    ownerId: accountResult.data.user.id,
    priceId: optionResult.data.price.id
  });

  if (!pendingResult.ok) {
    return pendingResult;
  }

  const orderResult = await recordPaymentBillingFacts({
    amountCents: optionResult.data.price.amountCents,
    checkoutKind: optionResult.data.checkoutKind,
    checkoutSessionId,
    currency: optionResult.data.price.currency,
    ownerId: accountResult.data.user.id,
    planId: optionResult.data.price.planId ?? "credit_pack",
    priceId: optionResult.data.price.id,
    provider: "sandbox",
    source: "sandbox_payment_result",
    status: input.status
  });

  if (!orderResult.ok) {
    return orderResult;
  }

  const provider = createPaymentProvider();
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
    redirectTo: withPaymentResult(
      normalizeReturnTo(input.returnTo, "/account/billing"),
      input.status,
      input.priceId
    )
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
        provider: createPaymentProvider().descriptor.provider,
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
        provider: createPaymentProvider().descriptor.provider,
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

export async function processPaymentWebhook(input: {
  creemSignature?: string | null;
  rawBody: string;
}): Promise<ServiceResult<PaymentWebhookAcknowledgement>> {
  const payload = parseJsonObject(input.rawBody);

  if (!payload) {
    return serviceError("validation_error", "Invalid JSON payload.");
  }

  if (payload.provider === "sandbox") {
    return acknowledgeSandboxWebhook(payload);
  }

  return processCreemWebhook({
    payload,
    rawBody: input.rawBody,
    signature: input.creemSignature
  });
}

async function processCreemWebhook(input: {
  payload: Record<string, unknown>;
  rawBody: string;
  signature?: string | null;
}): Promise<ServiceResult<PaymentWebhookAcknowledgement>> {
  const safetyResult = validateCreemWebhookConfig(input.rawBody, input.signature);

  if (!safetyResult.ok) {
    return safetyResult;
  }

  const eventResult = normalizeCreemWebhookEvent(input.payload);

  if (!eventResult.ok) {
    return eventResult;
  }

  const idempotencyKey = createPaymentIdempotencyKey({
    provider: eventResult.data.provider,
    eventId: eventResult.data.eventId
  });
  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const existingEventResult = await adminResult.data
    .from("payment_events")
    .select("id, status")
    .eq("provider", eventResult.data.provider)
    .eq("event_id", eventResult.data.eventId)
    .maybeSingle();

  if (existingEventResult.error) {
    return mapSupabasePaymentError(existingEventResult.error);
  }

  if (
    existingEventResult.data &&
    (existingEventResult.data.status === "processed" ||
      existingEventResult.data.status === "ignored")
  ) {
    return serviceOk({
      accepted: true,
      idempotencyKey,
      message: "Creem webhook event was already handled."
    });
  }

  let paymentEventId = existingEventResult.data?.id ?? null;

  if (!paymentEventId) {
    const insertEventResult = await adminResult.data
      .from("payment_events")
      .insert({
        provider: eventResult.data.provider,
        event_id: eventResult.data.eventId,
        event_type: eventResult.data.eventType,
        status: "received",
        owner_id: eventResult.data.ownerId,
        checkout_session_id: eventResult.data.checkoutSessionId,
        price_id: eventResult.data.priceId,
        idempotency_key: idempotencyKey,
        raw_payload: toJson(input.payload),
        occurred_at: eventResult.data.occurredAt
      })
      .select("id")
      .single();

    if (insertEventResult.error || !insertEventResult.data) {
      return mapSupabasePaymentError(insertEventResult.error);
    }

    paymentEventId = insertEventResult.data.id;
  }

  if (eventResult.data.eventType !== "checkout.completed") {
    const ignoreResult = await updatePaymentEventStatus({
      eventId: paymentEventId,
      status: "ignored"
    });

    if (!ignoreResult.ok) {
      return ignoreResult;
    }

    return serviceOk({
      accepted: true,
      idempotencyKey,
      message:
        "Creem lifecycle event acknowledged. Billing facts are only granted from checkout.completed in MVP2."
    });
  }

  if (
    !eventResult.data.ownerId ||
    !eventResult.data.priceId ||
    !eventResult.data.planId ||
    !eventResult.data.checkoutKind ||
    !eventResult.data.amountCents ||
    !eventResult.data.currency
  ) {
    await updatePaymentEventStatus({
      eventId: paymentEventId,
      errorMessage:
        "Creem checkout.completed did not include enough metadata to grant Billing facts.",
      status: "failed"
    });

    return serviceError(
      "validation_error",
      "Creem checkout.completed requires owner, price, product, amount, and currency metadata."
    );
  }

  const orderResult = await recordPaymentBillingFacts({
    amountCents: eventResult.data.amountCents,
    checkoutKind: eventResult.data.checkoutKind,
    checkoutSessionId: eventResult.data.checkoutSessionId,
    currency: eventResult.data.currency,
    ownerId: eventResult.data.ownerId,
    planId: eventResult.data.planId,
    priceId: eventResult.data.priceId,
    provider: eventResult.data.provider,
    providerOrderId: eventResult.data.providerOrderId,
    providerSubscriptionId: eventResult.data.providerSubscriptionId,
    source: "creem_webhook",
    status: "success",
    occurredAt: eventResult.data.occurredAt,
    metadata: {
      creem_event_id: eventResult.data.eventId,
      creem_event_type: eventResult.data.eventType,
      creem_product_id: eventResult.data.productId,
      payment_event_id: paymentEventId
    }
  });

  if (!orderResult.ok) {
    await updatePaymentEventStatus({
      eventId: paymentEventId,
      errorMessage: orderResult.error.message,
      status: "failed"
    });

    return orderResult;
  }

  await updatePaymentEventStatus({
    eventId: paymentEventId,
    status: "processed"
  });

  const analyticsProperties = buildPaymentAnalyticsProperties({
    checkoutKind: eventResult.data.checkoutKind,
    checkoutSessionId: eventResult.data.checkoutSessionId,
    orderStatus: orderResult.data.orderStatus,
    priceId: eventResult.data.priceId,
    provider: eventResult.data.provider,
    result: "success",
    source: "creem_webhook"
  });

  await trackPaymentEvent({
    distinctId: eventResult.data.ownerId,
    event: "payment_succeeded",
    properties: analyticsProperties
  });
  await trackPaymentEvent({
    distinctId: eventResult.data.ownerId,
    event: "entitlement_granted",
    properties: {
      ...analyticsProperties,
      entitlement_type:
        eventResult.data.checkoutKind === "subscription"
          ? "subscription"
          : "credit_pack"
    }
  });

  return serviceOk({
    accepted: true,
    idempotencyKey,
    message: "Creem checkout.completed processed into Billing facts."
  });
}

async function recordSandboxPendingCheckout(input: {
  amountCents: number;
  checkoutKind: "subscription" | "credit_pack";
  checkoutSessionId: string;
  currency: "usd";
  ownerId: string;
  planId: string;
  priceId: BillingPriceId;
}): Promise<ServiceResult<true>> {
  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const idempotencyKey = createPaymentIdempotencyKey({
    provider: "sandbox",
    eventId: `${input.checkoutSessionId}:pending`
  });
  const orderResult = await adminResult.data
    .from("billing_orders")
    .upsert(
      {
        owner_id: input.ownerId,
        provider: "sandbox",
        provider_order_id: `sandbox-order-${input.checkoutSessionId}:pending`,
        provider_checkout_session_id: input.checkoutSessionId,
        idempotency_key: idempotencyKey,
        plan_id: input.planId,
        price_id: input.priceId,
        status: "pending",
        currency: input.currency,
        amount_cents: input.amountCents,
        metadata: {
          checkout_kind: input.checkoutKind,
          source: "sandbox_checkout_started"
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

  return serviceOk(true);
}

async function assertSandboxPendingCheckout(input: {
  checkoutSessionId: string;
  ownerId: string;
  priceId: BillingPriceId;
}): Promise<ServiceResult<true>> {
  const clientResult = await createSupabaseServerClient();

  if (!clientResult.ok) {
    return clientResult;
  }

  const { data, error } = await clientResult.data
    .from("billing_orders")
    .select("id")
    .eq("owner_id", input.ownerId)
    .eq("provider", "sandbox")
    .eq("provider_checkout_session_id", input.checkoutSessionId)
    .eq("price_id", input.priceId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (error) {
    return mapSupabasePaymentError(error);
  }

  if (!data) {
    return serviceError(
      "forbidden",
      "Sandbox checkout session is not recognized."
    );
  }

  return serviceOk(true);
}

async function recordPaymentBillingFacts(input: {
  amountCents: number;
  checkoutKind: "subscription" | "credit_pack";
  checkoutSessionId: string;
  currency: "usd";
  metadata?: Record<string, unknown>;
  ownerId: string;
  planId: string;
  priceId: BillingPriceId;
  provider?: string;
  providerOrderId?: string | null;
  providerSubscriptionId?: string | null;
  source?: string;
  occurredAt?: string;
  status: PaymentCheckoutResultStatus;
}): Promise<ServiceResult<{ orderStatus: BillingOrderStatus }>> {
  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const provider = input.provider ?? "sandbox";
  const source = input.source ?? "sandbox_payment_result";
  const orderStatus = mapResultToOrderStatus(input.status);
  const idempotencyKey = createPaymentIdempotencyKey({
    provider,
    eventId: `${input.checkoutSessionId}:${input.status}`
  });
  const providerOrderId =
    input.providerOrderId ?? `sandbox-order-${input.checkoutSessionId}:${input.status}`;
  const orderResult = await adminResult.data
    .from("billing_orders")
    .upsert(
      {
        owner_id: input.ownerId,
        provider,
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
          ...input.metadata,
          source
        },
        occurred_at: input.occurredAt ?? new Date().toISOString()
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
        provider,
        provider_subscription_id:
          input.providerSubscriptionId ??
          `sandbox-subscription-${input.checkoutSessionId}`,
        plan_id: input.planId,
        price_id: input.priceId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: addMonths(now, 1).toISOString(),
        metadata: {
          ...input.metadata,
          order_id: orderResult.data.id,
          source
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
      .upsert(
        {
          owner_id: input.ownerId,
          source_type: "credit_pack",
          source_id: orderResult.data.id,
          feature_key: "ai_tokens",
          allowance_kind: "quantity",
          quantity: 100000,
          unit: "credit",
          status: "active",
          metadata: {
            ...input.metadata,
            order_id: orderResult.data.id,
            source
          }
        },
        {
          onConflict: "source_type,source_id,feature_key"
        }
      )
      .select("id")
      .single();

    if (entitlementResult.error || !entitlementResult.data) {
      return mapSupabasePaymentError(entitlementResult.error);
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
          reason: `${provider} AI credit pack checkout success.`,
          metadata: {
            ...input.metadata,
            checkout_session_id: input.checkoutSessionId,
            source
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

  clearBillingCacheForOwner(input.ownerId);

  return serviceOk({ orderStatus });
}

type NormalizedCreemWebhookEvent = {
  amountCents: number | null;
  checkoutKind: "subscription" | "credit_pack" | null;
  checkoutSessionId: string;
  currency: "usd" | null;
  eventId: string;
  eventType: string;
  occurredAt: string;
  ownerId: string | null;
  planId: string | null;
  priceId: BillingPriceId | null;
  productId: string | null;
  provider: "creem";
  providerOrderId: string | null;
  providerSubscriptionId: string | null;
};

function validateCreemWebhookConfig(
  rawBody: string,
  signature: string | null | undefined
): ServiceResult<{ webhookSecret: string }> {
  if (process.env.PAYMENT_PROVIDER !== "creem") {
    return serviceError(
      "configuration_error",
      "Creem webhooks require PAYMENT_PROVIDER=creem."
    );
  }

  if (process.env.PAYMENT_MODE !== "test") {
    return serviceError(
      "configuration_error",
      "Creem webhooks are only enabled for PAYMENT_MODE=test in MVP2."
    );
  }

  if (process.env.PAYMENT_LIVE_ENABLED !== "false") {
    return serviceError(
      "configuration_error",
      "Creem webhooks require PAYMENT_LIVE_ENABLED=false in MVP2."
    );
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return serviceError(
      "configuration_error",
      "Creem webhooks require PAYMENT_WEBHOOK_SECRET."
    );
  }

  if (!verifyCreemWebhookSignature(rawBody, signature, webhookSecret)) {
    return serviceError(
      "validation_error",
      "Creem webhook signature is invalid."
    );
  }

  return serviceOk({ webhookSecret });
}

function verifyCreemWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string
) {
  const normalizedSignature = signature?.trim();

  if (!normalizedSignature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const actual = Buffer.from(normalizedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function normalizeCreemWebhookEvent(
  payload: Record<string, unknown>
): ServiceResult<NormalizedCreemWebhookEvent> {
  const eventId = readString(payload.id);
  const eventType = readString(payload.eventType);
  const object = readObject(payload.object) ?? {};
  const checkout = readObject(object.checkout);
  const order = readObject(object.order);
  const subscription = readObject(object.subscription) ?? (
    readString(object.object) === "subscription" ? object : null
  );
  const product =
    readObject(object.product) ??
    readObject(subscription?.product) ??
    readObject(order?.product);
  const metadata =
    readObject(object.metadata) ??
    readObject(checkout?.metadata) ??
    readObject(subscription?.metadata) ??
    {};
  const checkoutSessionId =
    readString(readString(object.object) === "checkout" ? object.id : null) ??
    readString(checkout?.id) ??
    readString(metadata.checkout_session_id) ??
    eventId;
  const productId =
    readString(product?.id) ??
    readString(order?.product) ??
    readString(subscription?.product);

  if (!eventId || !eventType || !checkoutSessionId) {
    return serviceError(
      "validation_error",
      "Creem webhook events require id, eventType, and checkout id."
    );
  }

  const priceId = readBillingPriceId(metadata.price_id) ??
    resolveBillingPriceIdFromCreemProductId(productId);
  const optionResult = priceId ? getCheckoutOption(priceId) : null;
  const price = priceId ? getBillingPrice(priceId) : null;

  if (priceId && optionResult && !optionResult.ok) {
    return optionResult;
  }

  const currency = normalizeCurrency(readString(order?.currency) ?? readString(product?.currency));
  const amountCents =
    readNumber(order?.amount) ?? readNumber(product?.price) ?? price?.amountCents ?? null;
  const occurredAt = normalizeCreemTimestamp(
    payload.created_at,
    readString(order?.created_at) ?? readString(subscription?.created_at)
  );
  const ownerId =
    readString(metadata.referenceId) ??
    readString(metadata.owner_id) ??
    readString(metadata.user_id) ??
    readString(metadata.internal_customer_id);

  return serviceOk({
    amountCents,
    checkoutKind: optionResult?.ok ? optionResult.data.checkoutKind : null,
    checkoutSessionId,
    currency,
    eventId,
    eventType,
    occurredAt,
    ownerId,
    planId: price?.planId ?? (priceId ? "credit_pack" : null),
    priceId,
    productId,
    provider: "creem",
    providerOrderId: readString(order?.id),
    providerSubscriptionId:
      readString(subscription?.id) ?? readString(object.subscription_id)
  });
}

async function updatePaymentEventStatus(input: {
  errorMessage?: string;
  eventId: string;
  status: "processed" | "ignored" | "failed";
}): Promise<ServiceResult<void>> {
  const adminResult = createSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const result = await adminResult.data
    .from("payment_events")
    .update({
      error_message: input.errorMessage ?? null,
      processed_at: new Date().toISOString(),
      status: input.status
    })
    .eq("id", input.eventId);

  if (result.error) {
    return mapSupabasePaymentError(result.error);
  }

  return serviceOk(undefined);
}

function buildResultUrl(
  status: PaymentCheckoutResultStatus,
  priceId: BillingPriceId,
  returnTo: string
) {
  const params = new URLSearchParams({
    return_to: returnTo,
    status,
    price_id: priceId
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

function assertSandboxPaymentReviewEnabled(): ServiceResult<true> {
  const provider = createPaymentProvider();

  if (!isSandboxPaymentReviewProvider(provider)) {
    return serviceError(
      "configuration_error",
      "Sandbox payment review is not enabled for this environment."
    );
  }

  return serviceOk(true);
}

function isSandboxPaymentReviewProvider(
  provider: ReturnType<typeof createPaymentProvider>
) {
  return (
    provider.descriptor.provider === "sandbox" &&
    provider.descriptor.mode === "sandbox"
  );
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

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text) as unknown;

    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readBillingPriceId(value: unknown): BillingPriceId | null {
  const priceId = readString(value);

  return priceId && isBillingCheckoutPriceId(priceId) ? priceId : null;
}

function resolveBillingPriceIdFromCreemProductId(
  productId: string | null
): BillingPriceId | null {
  if (!productId) {
    return null;
  }

  const productIdByPriceId: Record<BillingPriceId, string | undefined> = {
    free: undefined,
    plus_monthly: process.env.CREEM_PLUS_MONTHLY_PRODUCT_ID,
    pro_monthly: process.env.CREEM_PRO_MONTHLY_PRODUCT_ID,
    ai_credit_pack_100k: process.env.CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID
  };

  const entry = Object.entries(productIdByPriceId).find(
    ([, configuredProductId]) => configuredProductId?.trim() === productId
  );

  return entry && isBillingCheckoutPriceId(entry[0]) ? entry[0] : null;
}

function normalizeCurrency(value: string | null): "usd" | null {
  return value?.toLowerCase() === "usd" ? "usd" : null;
}

function normalizeCreemTimestamp(
  createdAt: unknown,
  fallback: string | null
): string {
  if (typeof createdAt === "number" && Number.isFinite(createdAt)) {
    return new Date(createdAt).toISOString();
  }

  if (fallback && !Number.isNaN(Date.parse(fallback))) {
    return new Date(fallback).toISOString();
  }

  return new Date().toISOString();
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
