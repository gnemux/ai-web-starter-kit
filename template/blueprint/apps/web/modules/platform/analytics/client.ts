"use client";
import posthog from "posthog-js";
import { productConfig } from "@/config/product.config";
import { assertProductEventName, sanitizeAnalyticsProperties } from "./properties";

export function initializeAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (String(productConfig.capabilities.analytics) !== "enabled" || !key || typeof window === "undefined") return false;
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com", capture_pageview: true, persistence: "memory" });
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
  posthog.capture(`${productConfig.identity.eventNamespace}_${safeName}`, { module: "product", ...safeProperties });
  return true;
}
