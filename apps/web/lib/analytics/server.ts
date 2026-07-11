import "server-only";

import {
  normalizeSafeCapabilityContext,
  type SafeCapabilityContext
} from "@xwlc/platform";
import { headers } from "next/headers";

import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv,
  type AnalyticsModule
} from "./config";
import { resolveSafeAnalyticsCurrentUrl } from "./request-context";
import { buildPostHogCaptureRequest } from "./posthog-capture";
import { sanitizeServerProperties } from "./server-properties";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

const posthogHost =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
  "https://us.i.posthog.com";

type ServerAnalyticsEvent = {
  distinctId: string;
  event: string;
  metadata?: SafeCapabilityContext;
  module: AnalyticsModule;
  properties: object;
};

export async function trackServerEvent({
  distinctId,
  event,
  metadata,
  module,
  properties
}: ServerAnalyticsEvent): Promise<void> {
  const metadataResult = normalizeSafeCapabilityContext(metadata);

  if (!metadataResult.ok) {
    console.warn("Analytics metadata rejected", { event });
    return;
  }

  if (!posthogKey) {
    return;
  }

  try {
    const requestContextProperties = await getServerRequestContextProperties();

    const request = buildPostHogCaptureRequest({
      apiKey: posthogKey,
      distinctId,
      event,
      host: posthogHost,
      properties: {
        ...getAnalyticsBaseProperties(module),
        ...requestContextProperties,
        ...(metadataResult.data ?? {}),
        ...sanitizeServerProperties(properties)
      }
    });
    const response = await fetch(request.url, {
      body: request.body,
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
