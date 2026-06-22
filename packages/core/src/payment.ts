import { serviceError, serviceOk, type ServiceResult } from "./api";
import {
  billingPriceIds,
  getBillingPrice,
  type BillingPrice,
  type BillingPriceId
} from "./billing";

export const paymentCheckoutResultStatuses = [
  "success",
  "cancel",
  "failure"
] as const;

export type PaymentCheckoutResultStatus =
  (typeof paymentCheckoutResultStatuses)[number];

export const paymentEventTypes = [
  "checkout.started",
  "checkout.completed",
  "checkout.canceled",
  "checkout.failed"
] as const;

export type PaymentEventType = (typeof paymentEventTypes)[number];

export type PaymentCheckoutOption = {
  price: BillingPrice;
  checkoutKind: "subscription" | "credit_pack";
};

export type PaymentReviewState = {
  provider: string;
  mode: "sandbox" | "mock" | "noop" | "real" | "reserved";
  checkoutOptions: PaymentCheckoutOption[];
};

export type PaymentWebhookEvent = {
  provider: string;
  eventId: string;
  eventType: PaymentEventType;
  checkoutSessionId: string;
  ownerId: string;
  priceId: BillingPriceId;
  occurredAt: string;
};

export type PaymentWebhookAcknowledgement = {
  accepted: boolean;
  idempotencyKey: string;
  message: string;
};

export function getCheckoutOption(
  priceId: BillingPriceId
): ServiceResult<PaymentCheckoutOption> {
  const price = getBillingPrice(priceId);

  if (!price) {
    return serviceError("not_found", "The requested price does not exist.");
  }

  if (price.type === "free") {
    return serviceError(
      "validation_error",
      "Free prices do not create payment checkout sessions."
    );
  }

  return serviceOk({
    price,
    checkoutKind: price.type === "recurring" ? "subscription" : "credit_pack"
  });
}

export function listCheckoutOptions(): PaymentCheckoutOption[] {
  return billingPriceIds
    .map((priceId) => getCheckoutOption(priceId))
    .filter((result): result is ServiceResult<PaymentCheckoutOption> & { ok: true } =>
      result.ok
    )
    .map((result) => result.data);
}

export function isBillingCheckoutPriceId(
  value: string
): value is BillingPriceId {
  return billingPriceIds.includes(value as BillingPriceId);
}

export function isPaymentCheckoutResultStatus(
  value: string | undefined
): value is PaymentCheckoutResultStatus {
  return paymentCheckoutResultStatuses.includes(
    value as PaymentCheckoutResultStatus
  );
}

export function createPaymentIdempotencyKey(input: {
  provider: string;
  eventId: string;
}): string {
  return `payment:${sanitizeKeyPart(input.provider)}:${sanitizeKeyPart(
    input.eventId
  )}`;
}

export function normalizePaymentWebhookEvent(
  input: Record<string, unknown>
): ServiceResult<PaymentWebhookEvent> {
  const provider = normalizeRequiredString(input.provider);
  const eventId = normalizeRequiredString(input.eventId);
  const eventType = normalizeRequiredString(input.eventType);
  const checkoutSessionId = normalizeRequiredString(input.checkoutSessionId);
  const ownerId = normalizeRequiredString(input.ownerId);
  const priceId = normalizeRequiredString(input.priceId);
  const occurredAt = normalizeRequiredString(input.occurredAt);

  if (
    !provider ||
    !eventId ||
    !eventType ||
    !checkoutSessionId ||
    !ownerId ||
    !priceId ||
    !occurredAt
  ) {
    return serviceError(
      "validation_error",
      "Payment webhook events require provider, eventId, eventType, checkoutSessionId, ownerId, priceId, and occurredAt."
    );
  }

  if (!paymentEventTypes.includes(eventType as PaymentEventType)) {
    return serviceError(
      "validation_error",
      "Payment webhook eventType is not supported."
    );
  }

  if (!isBillingCheckoutPriceId(priceId)) {
    return serviceError(
      "validation_error",
      "Payment webhook priceId is not supported."
    );
  }

  if (Number.isNaN(Date.parse(occurredAt))) {
    return serviceError(
      "validation_error",
      "Payment webhook occurredAt must be an ISO date string."
    );
  }

  return serviceOk({
    provider,
    eventId,
    eventType: eventType as PaymentEventType,
    checkoutSessionId,
    ownerId,
    priceId,
    occurredAt
  });
}

function normalizeRequiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeKeyPart(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9._:-]+/g, "_");
}
