"use client";

import type { AuthAnalyticsEvent } from "@xwlc/core";
import posthog from "posthog-js";

import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv
} from "@/lib/analytics/config";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

type OAuthAnalyticsProperties = {
  auth_method: "oauth";
  auth_provider: "apple" | "google";
  error_category?:
    | "callback_failed"
    | "cancelled"
    | "provider_unavailable";
  result?: "failure" | "success";
};

export function trackOAuthEvent(
  event: Extract<
    AuthAnalyticsEvent,
    "auth_login_failed" | "login_started" | "user_logged_in"
  >,
  properties: OAuthAnalyticsProperties
) {
  // Research-app bridge until GNE-317 decides whether the clean template's
  // generic Auth analytics contract should add social providers.
  if (typeof window === "undefined" || !posthogKey) {
    return;
  }

  posthog.capture(event, {
    ...getAnalyticsBaseProperties(),
    auth_method: properties.auth_method,
    auth_provider: properties.auth_provider,
    ...(properties.error_category
      ? { error_category: properties.error_category }
      : {}),
    ...(properties.result ? { result: properties.result } : {})
  });
}
