import "server-only";

import type {
  AiAnalyticsEvent,
  AiAnalyticsProperties,
  PaymentAnalyticsEvent,
  PaymentAnalyticsProperties
} from "@xwlc/core";
import { headers } from "next/headers";

import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv,
  type AnalyticsModule
} from "./config";
import {
  normalizeSafeCapabilityMetadata,
  type SafeCapabilityMetadata
} from "./safe-capability-metadata";
import { resolveSafeAnalyticsCurrentUrl } from "./request-context";
import {
  sanitizeServerProperties,
  type ProductAnalyticsEvent,
  type ProductAnalyticsProperties
} from "./server-properties";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

const posthogHost =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
  "https://us.i.posthog.com";

type ServerAnalyticsEvent = {
  distinctId: string;
  event: PaymentAnalyticsEvent | AiAnalyticsEvent | ProductAnalyticsEvent;
  metadata?: SafeCapabilityMetadata;
  module: AnalyticsModule;
  properties:
    | PaymentAnalyticsProperties
    | AiAnalyticsProperties
    | ProductAnalyticsProperties;
};

export async function trackServerEvent({
  distinctId,
  event,
  metadata,
  module,
  properties
}: ServerAnalyticsEvent): Promise<void> {
  const metadataResult = normalizeSafeCapabilityMetadata(metadata);

  if (!metadataResult.ok) {
    console.warn("Analytics metadata rejected", { event });
    return;
  }

  if (!posthogKey) {
    return;
  }

  try {
    const requestContextProperties = await getServerRequestContextProperties();

    const response = await fetch(`${posthogHost.replace(/\/$/, "")}/capture/`, {
      body: JSON.stringify({
        api_key: posthogKey,
        distinct_id: distinctId,
        event,
        properties: {
          ...getAnalyticsBaseProperties(module),
          ...requestContextProperties,
          ...(metadataResult.data ?? {}),
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

async function getServerRequestContextProperties(): Promise<
  Record<string, unknown>
> {
  const baseProperties = {
    $lib: "server"
  };

  try {
    const requestHeaders = await headers();
    const host =
      requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const currentUrl = resolveSafeAnalyticsCurrentUrl({
      host,
      path:
        requestHeaders.get("next-url") ??
        requestHeaders.get("x-next-url") ??
        requestHeaders.get("x-invoke-path"),
      protocol: requestHeaders.get("x-forwarded-proto"),
      referer: requestHeaders.get("referer")
    });

    return {
      ...baseProperties,
      ...(currentUrl
        ? {
            $current_url: currentUrl,
            current_url: currentUrl
          }
        : {}),
      ...(host ? { host } : {})
    };
  } catch {
    return baseProperties;
  }
}
