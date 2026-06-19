"use client";

import posthog from "posthog-js";

import type {
  AuthAnalyticsEvent,
  AuthAnalyticsProperties,
  AuthenticatedUser
} from "@starter/core";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

export function trackEvent(
  event: AuthAnalyticsEvent,
  properties: AuthAnalyticsProperties
) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.capture(event, sanitizeAuthProperties(properties));
}

export function identifyAuthUser(user: AuthenticatedUser) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.identify(user.id, {
    email: user.email
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
