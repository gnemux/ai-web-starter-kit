"use client";
import posthog from "posthog-js";
import { productConfig, templateMetadata } from "@/config/product.config";
import { analyticsPrivacyOptions, assertProductEventName, buildAnalyticsBaseProperties, isSafePosthogPublicKey, sanitizeAnalyticsProperties } from "./properties";

let initialized = false;

export function analyticsBaseProperties() {
  return buildAnalyticsBaseProperties({
    productId: productConfig.identity.id,
    appEnvironment: process.env.NEXT_PUBLIC_APP_ENV,
    templateVersion: templateMetadata.templateVersion,
    releaseVersion: process.env.NEXT_PUBLIC_RELEASE_VERSION,
    defaultReleaseVersion: productConfig.identity.releaseVersion
  });
}

export function initializeAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (String(productConfig.capabilities.analytics) !== "external" || !isSafePosthogPublicKey(key) || typeof window === "undefined") return false;
  if (initialized) return true;
  try {
    posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", ...analyticsPrivacyOptions });
    initialized = true;
    return true;
  } catch {
    initialized = false;
    return false;
  }
}

export function captureProductEvent(name: string, properties: Record<string, unknown> = {}) {
  let safeName: string;
  let safeProperties: Record<string, string | number | boolean>;
  try {
    safeName = assertProductEventName(name);
    safeProperties = sanitizeAnalyticsProperties(properties);
  } catch {
    return false;
  }
  if (!initializeAnalytics()) return false;
  posthog.capture(`${productConfig.identity.eventNamespace}_${safeName}`, { ...safeProperties, ...analyticsBaseProperties() });
  return true;
}
