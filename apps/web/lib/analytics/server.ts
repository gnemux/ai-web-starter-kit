import "server-only";

import type {
  AiAnalyticsEvent,
  AiAnalyticsProperties,
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
  event: PaymentAnalyticsEvent | AiAnalyticsEvent;
  module: AnalyticsBaseProperties["module"];
  properties: PaymentAnalyticsProperties | AiAnalyticsProperties;
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
          ...sanitizeServerProperties(properties)
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

function sanitizeServerProperties(
  properties: PaymentAnalyticsProperties | AiAnalyticsProperties
): Record<string, unknown> {
  const values = properties as Record<string, unknown>;

  return {
    ...(typeof values.amount_cents === "number"
      ? { amount_cents: values.amount_cents }
      : {}),
    ...(values.billing_period
      ? { billing_period: values.billing_period }
      : {}),
    ...(values.checkout_kind ? { checkout_kind: values.checkout_kind } : {}),
    ...(values.checkout_session_id
      ? { checkout_session_id: values.checkout_session_id }
      : {}),
    ...(values.currency ? { currency: values.currency } : {}),
    ...(values.entitlement_type
      ? { entitlement_type: values.entitlement_type }
      : {}),
    ...(values.feature_key ? { feature_key: values.feature_key } : {}),
    ...(values.quota_reason ? { quota_reason: values.quota_reason } : {}),
    ...(typeof values.requested_units === "number"
      ? { requested_units: values.requested_units }
      : {}),
    ...(values.order_status ? { order_status: values.order_status } : {}),
    ...(values.payment_mode ? { payment_mode: values.payment_mode } : {}),
    ...(values.plan ? { plan: values.plan } : {}),
    ...(values.price_id ? { price_id: values.price_id } : {}),
    provider: values.provider,
    ...(typeof values.remaining_units === "number"
      ? { remaining_units: values.remaining_units }
      : {}),
    ...(values.capability ? { capability: values.capability } : {}),
    ...(typeof values.consumed_credits === "number"
      ? { consumed_credits: values.consumed_credits }
      : {}),
    ...(values.mode ? { mode: values.mode } : {}),
    ...(values.model ? { model: values.model } : {}),
    ...(values.provider_model_id
      ? { provider_model_id: values.provider_model_id }
      : {}),
    ...(values.reason ? { reason: values.reason } : {}),
    ...(typeof values.remaining_credits === "number"
      ? { remaining_credits: values.remaining_credits }
      : {}),
    ...(typeof values.requested_credits === "number"
      ? { requested_credits: values.requested_credits }
      : {}),
    ...(values.result ? { result: values.result } : {}),
    ...(values.source ? { source: values.source } : {}),
    ...(values.usage_record_status
      ? { usage_record_status: values.usage_record_status }
      : {})
  };
}
