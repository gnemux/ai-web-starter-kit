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
  type BillingPriceId,
  type PaymentCheckoutResultStatus,
  type PaymentReviewState,
  type PaymentWebhookAcknowledgement,
  type ServiceResult
} from "@starter/core";

import { createSandboxPaymentProvider } from "@/lib/providers/server";

import { getCurrentAccount } from "./auth";
import { getCurrentBillingEntitlements } from "./billing";

export type PaymentPageState = PaymentReviewState & {
  ownerId: string;
  billing: ServiceResult<BillingEntitlementSnapshot>;
};

export type SandboxCheckoutState = {
  checkoutSessionId: string;
  priceId: BillingPriceId;
  planId: string | null;
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

  if (!isBillingCheckoutPriceId(priceIdValue)) {
    return serviceError(
      "validation_error",
      "Choose a supported checkout price."
    );
  }

  const optionResult = getCheckoutOption(priceIdValue);

  if (!optionResult.ok) {
    return optionResult;
  }

  const accountResult = await getCurrentAccount();

  if (!accountResult.ok) {
    return accountResult;
  }

  const price = optionResult.data.price;
  const provider = createSandboxPaymentProvider();
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
}): ServiceResult<SandboxCheckoutState> {
  const checkoutSessionId = String(input.checkoutSessionId ?? "").trim();
  const priceId = String(input.priceId ?? "").trim();
  const planId = String(input.planId ?? "").trim();
  const successUrl = String(input.successUrl ?? "").trim();
  const cancelUrl = String(input.cancelUrl ?? "").trim();
  const failureUrl = String(input.failureUrl ?? "").trim();

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

function withSessionId(url: string, checkoutSessionId: string) {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);

  params.set("checkout_session_id", checkoutSessionId);

  return `${path}?${params.toString()}`;
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
