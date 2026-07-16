import posthog from "posthog-js";

import {
  getAnalyticsBaseProperties,
  readOptionalPublicEnv
} from "@/lib/analytics/config";

const posthogKey =
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY) ??
  readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
const isSensitiveRecoveryPage =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/auth/recovery");

if (posthogKey && !isSensitiveRecoveryPage) {
  posthog.init(posthogKey, {
    api_host:
      readOptionalPublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST) ??
      "https://us.i.posthog.com",
    defaults: "2026-01-30",
    capture_pageview: true
  });
  posthog.register(getAnalyticsBaseProperties());
}
