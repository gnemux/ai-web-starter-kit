# Analytics Integration

## Purpose

Analytics tracks activation, feature usage, checkout conversion, and product validation signals.

## Status

M4 Auth analytics implementation is in place. Client-side PostHog initialization and Auth event wrappers are implemented; production event verification depends on deployment environment variables and real Auth testing.

The Linear planning source is `GNE-73 MVP1/MVP2 ANALYTICS-00 [ANALYTICS] 数据监控与转化事件`. Its current execution order is mirrored in `context/linear.md`.

Deployment and environment memory:

- Production event verification should be recorded in `context/deployment-status.md`.
- Environment and product separation rules live in `context/environment-matrix.md`.
- Production monitoring checks live in `context/production-monitoring.md`.

## Default Providers

- PostHog for global-friendly product analytics.
- Jiguang reserved for China-friendly analytics.

## PostHog Project Strategy

MVP1-MVP3 use one PostHog Project by default. Do not split projects just to make early dashboards cleaner.

Separate products, environments, markets, and stages through shared event properties:

- `app`: product or starter instance name, for example `ai-web-starter-kit`.
- `mvp_stage`: `mvp1`, `mvp2`, `mvp3`, and later stage values.
- `market`: `overseas` or `china`.
- `env`: `local`, `preview`, or `production`.
- `version`: product or template version.
- `module`: product module such as `auth`, `core`, `billing`, or `ai`.

Split into multiple PostHog Projects only when there is a clear reason such as event volume limits, customer isolation, permission isolation, compliance boundaries, or different legal entities.

## Event Taxonomy

- `page_viewed`
- `signup_started`
- `user_signed_up`
- `login_started`
- `user_logged_in`
- `auth_login_failed`
- `user_logged_out`
- `user_profile_updated`
- `activation_completed`
- `feature_used`
- `pricing_viewed`
- `checkout_started`
- `payment_succeeded`
- `payment_failed`
- `entitlement_granted`
- `subscription_status_changed`
- `feedback_submitted`
- `share_link_copied`
- `ai_request_started`
- `ai_request_completed`
- `ai_request_failed`
- `quota_limit_reached`

## Environment Variables

```text
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=
NEXT_PUBLIC_APP_MARKET=
NEXT_PUBLIC_APP_VERSION=
NEXT_PUBLIC_MVP_STAGE=
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
- Analytics must not be used as the Auth, Payment, Entitlement, or AI token ledger source of truth.
- Production event verification should be documented after deployment.
- M4 Auth uses Supabase Auth as the source of truth and PostHog only for product analytics.
- Every event should carry the shared MVP factory properties: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- For local M4 testing, the current operator account can be identified with the GitHub-bound email `1851884@qq.com` after successful login.
- Never send passwords, OTPs, session cookies, Supabase tokens, service role keys, or raw provider payloads to PostHog.
- Never send prompt text, generated text, provider secrets, payment card data, webhook raw payloads, or personal secrets to PostHog.
- Map auth failures into safe categories such as `validation_error`, `provider_error`, and `rate_limited`.

## Linear Execution Order

```text
GNE-73 MVP1/MVP2 ANALYTICS-00
├── GNE-101 ANALYTICS-01 [DOC][MVP1] Event naming, shared properties, and privacy boundary
├── GNE-123 ANALYTICS-02 [DEV][MVP1] Product analytics config and env entry
├── GNE-102 ANALYTICS-03 [DEV][MVP1] PostHog adapter, no-op, and shared property injection
├── GNE-103 ANALYTICS-04 [DEV][MVP1] Auth and pageview conversion events
├── GNE-188 ANALYTICS-05 [DEV][MVP1] Activation and core feature events
├── GNE-105 ANALYTICS-06 [TEST][MVP1] Production PostHog event and field verification
├── GNE-124 ANALYTICS-07 [DOC][MVP1] PostHog funnel and dashboard templates
├── GNE-122 ANALYTICS-08 [DOC][MVP1/MVP2] Multi-env and multi-product data viewing rules
├── GNE-125 ANALYTICS-09 [TEST][MVP1/MVP2] Single Project data isolation verification
├── GNE-104 ANALYTICS-10 [DEV][MVP2] Payment conversion events
└── GNE-159 ANALYTICS-11 [AI][MVP2] AI usage, cost, and conversion dashboards
```

Status rule:

- `Done`: the spec or delivery is complete and can be used by downstream work.
- `In Review`: implemented locally or on a branch, but still needs PR, main branch, or team confirmation.
- `Todo`: not implemented; execute later in number order.

## M4 Auth Events

Implemented through `apps/web/lib/analytics/client.ts`:

- `signup_started`
- `user_signed_up`
- `login_started`
- `user_logged_in`
- `auth_login_failed`
- `user_logged_out`
- `user_profile_updated`

Safe properties:

- `app`
- `mvp_stage`
- `market`
- `env`
- `version`
- `module`
- `auth_provider`
- `auth_method`
- `result`
- `error_category`
- `next_path`
- `has_display_name`

## Production Verification

Production analytics is not complete until the deployed site sends at least one pageview and one Auth event to PostHog with:

- production URL, not localhost
- `env=production`
- the expected `app`, `mvp_stage`, `market`, `version`, and `module`
- the correct PostHog project key and host

If production events are missing, check Vercel environment variables, redeploy timing, browser request blocking, PostHog key/host, and whether the deployed commit includes the latest instrumentation.
