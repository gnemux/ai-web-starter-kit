import posthog from "posthog-js";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-01-30",
    capture_pageview: true
  });
}
