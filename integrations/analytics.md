# Analytics Integration

## Purpose

Analytics tracks activation, feature usage, checkout conversion, and product validation signals.

## Status

M4 Auth analytics implementation is in progress. Client-side PostHog initialization and Auth event wrappers are implemented; production event verification depends on deployment environment variables and real Auth testing.

## Default Providers

- PostHog for global-friendly product analytics.
- Jiguang reserved for China-friendly analytics.

## Initial Event Taxonomy

- `page_viewed`
- `auth_signup_submitted`
- `auth_signup_succeeded`
- `auth_login_submitted`
- `auth_login_succeeded`
- `auth_login_failed`
- `auth_logout_succeeded`
- `auth_profile_updated`
- `feature_used`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`

## Environment Variables

```text
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_JIGUANG_APP_KEY=
```

`NEXT_PUBLIC_POSTHOG_KEY` is the preferred project variable name in this starter. `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is also supported for compatibility with PostHog's current Next.js docs.

## Rules

- Business code should call a local `trackEvent` abstraction.
- Do not call provider SDKs throughout product code.
- Analytics must not be used as a payment or entitlement source of truth.
- Production event verification should be documented after deployment.
- M4 Auth uses Supabase Auth as the source of truth and PostHog only for product analytics.
- On successful login during M4 testing, identify the current test user with the GitHub-bound email `1851884@qq.com`.
- Never send passwords, OTPs, session cookies, Supabase tokens, service role keys, or raw provider payloads to PostHog.
- Map auth failures into safe categories such as `validation_error`, `provider_error`, and `rate_limited`.

## M4 Auth Events

Implemented through `apps/web/lib/analytics/client.ts`:

- `auth_signup_submitted`
- `auth_signup_succeeded`
- `auth_login_submitted`
- `auth_login_succeeded`
- `auth_login_failed`
- `auth_logout_succeeded`
- `auth_profile_updated`

Safe properties:

- `auth_provider`
- `auth_method`
- `result`
- `error_category`
- `next_path`
- `has_display_name`
