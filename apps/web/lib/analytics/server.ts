import "server-only";

import type {
  AnalyticsBaseProperties,
  PaymentAnalyticsEvent,
  PaymentAnalyticsProperties
} from "@starter/core";

import { getAnalyticsBaseProperties, readOptionalPublicEnv } from "./config";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

const posthogHost =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
  "https://us.i.posthog.com";

type ServerAnalyticsEvent = {
  distinctId: string;
  event: PaymentAnalyticsEvent;
  module: AnalyticsBaseProperties["module"];
  properties: PaymentAnalyticsProperties;
};

export async function trackServerEvent({
  distinctId,
  event,
  module,
  properties
}: ServerAnalyticsEvent): Promise<void> {
  if (!posthogKey) {
    return;
  }

  try {
    const response = await fetch(`${posthogHost.replace(/\/$/, "")}/capture/`, {
      body: JSON.stringify({
        api_key: posthogKey,
        distinct_id: distinctId,
        event,
        properties: {
          ...getAnalyticsBaseProperties(module),
          ...sanitizePaymentProperties(properties)
        }
      }),
      cache: "no-store",
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      console.warn("PostHog server capture failed", {
        event,
        status: response.status
      });
    }
  } catch (error) {
    console.warn("PostHog server capture failed", {
      event,
      message: error instanceof Error ? error.message : "unknown_error"
    });
  }
}

function sanitizePaymentProperties(
  properties: PaymentAnalyticsProperties
): PaymentAnalyticsProperties {
  return {
    ...(typeof properties.amount_cents === "number"
      ? { amount_cents: properties.amount_cents }
      : {}),
    ...(properties.billing_period
      ? { billing_period: properties.billing_period }
      : {}),
    ...(properties.checkout_kind ? { checkout_kind: properties.checkout_kind } : {}),
    ...(properties.checkout_session_id
      ? { checkout_session_id: properties.checkout_session_id }
      : {}),
    ...(properties.currency ? { currency: properties.currency } : {}),
    ...(properties.entitlement_type
      ? { entitlement_type: properties.entitlement_type }
      : {}),
    ...(properties.feature_key ? { feature_key: properties.feature_key } : {}),
    ...(properties.quota_reason ? { quota_reason: properties.quota_reason } : {}),
    ...(typeof properties.requested_units === "number"
      ? { requested_units: properties.requested_units }
      : {}),
    ...(properties.order_status ? { order_status: properties.order_status } : {}),
    payment_mode: properties.payment_mode,
    plan: properties.plan,
    ...(properties.price_id ? { price_id: properties.price_id } : {}),
    provider: properties.provider,
    ...(typeof properties.remaining_units === "number"
      ? { remaining_units: properties.remaining_units }
      : {}),
    ...(properties.result ? { result: properties.result } : {}),
    ...(properties.source ? { source: properties.source } : {})
  };
}
