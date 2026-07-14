"use client";
import posthog from "posthog-js";
import { productConfig, templateMetadata } from "@/config/product.config";
import { assertProductEventName, sanitizeAnalyticsProperties } from "./properties";

let initialized = false;

export function analyticsBaseProperties() {
  return {
    product_id: productConfig.identity.id,
    app_environment: process.env.NEXT_PUBLIC_APP_ENV || "local",
    template_version: templateMetadata.templateVersion,
    release_version: process.env.NEXT_PUBLIC_RELEASE_VERSION || productConfig.identity.releaseVersion,
    module: "product"
  } as const;
}

export function initializeAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (String(productConfig.capabilities.analytics) !== "external" || !key || typeof window === "undefined") return false;
  if (initialized) return true;
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", capture_pageview: true, persistence: "memory" });
  initialized = true;
  return true;
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
