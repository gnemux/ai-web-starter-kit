"use client";

import posthog from "posthog-js";

import type {
  AuthAnalyticsEvent,
  AuthAnalyticsProperties,
  AuthenticatedUser
} from "@xwlc/core";

import { getAnalyticsBaseProperties, readOptionalPublicEnv } from "./config";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

type CatCareClientEvent =
  | "catcare_page_viewed"
  | "catcare_navigation_clicked"
  | "catcare_results_opened";

export function trackEvent(
  event: AuthAnalyticsEvent,
  properties: AuthAnalyticsProperties
) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.capture(event, {
    ...getAnalyticsBaseProperties(),
    ...sanitizeAuthProperties(properties)
  });
}

export function identifyAuthUser(user: AuthenticatedUser) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.identify(user.id, {
    ...getAnalyticsBaseProperties(),
    email: user.email
  });
}

export function trackCatCareEvent(
  event: CatCareClientEvent,
  properties: Record<string, unknown>
) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.capture(event, {
    ...getAnalyticsBaseProperties("core"),
    module: "catcare",
    provider: "posthog",
    ...sanitizeCatCareProperties(properties)
  });
}

export function resetAnalytics() {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.reset();
}

function isAnalyticsEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(posthogKey);
}

function sanitizeAuthProperties(
  properties: AuthAnalyticsProperties
): AuthAnalyticsProperties {
  return {
    auth_provider: properties.auth_provider,
    ...(properties.auth_method ? { auth_method: properties.auth_method } : {}),
    ...(properties.result ? { result: properties.result } : {}),
    ...(properties.error_category
      ? { error_category: properties.error_category }
      : {}),
    ...(properties.next_path ? { next_path: properties.next_path } : {}),
    ...(typeof properties.has_display_name === "boolean"
      ? { has_display_name: properties.has_display_name }
      : {})
  };
}

function sanitizeCatCareProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(typeof properties.page_key === "string"
      ? { page_key: properties.page_key }
      : {}),
    ...(typeof properties.from_page_key === "string"
      ? { from_page_key: properties.from_page_key }
      : {}),
    ...(typeof properties.target_page_key === "string"
      ? { target_page_key: properties.target_page_key }
      : {}),
    ...(typeof properties.surface === "string" ? { surface: properties.surface } : {}),
    ...(typeof properties.status === "string" ? { status: properties.status } : {}),
    ...(typeof properties.is_detail === "boolean"
      ? { is_detail: properties.is_detail }
      : {})
  };
}
