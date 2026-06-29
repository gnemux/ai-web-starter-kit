# Analytics Integration

## Purpose

Analytics tracks activation, feature usage, checkout conversion, and product validation signals.

## Status

MVP1 base analytics is implemented and merged for Auth/pageview:

- product analytics config and env reader
- PostHog adapter with no-op fallback
- shared property injection
- Auth and pageview events

Production PostHog reception and required shared properties have been visually verified from the PostHog Activity page against the deployed Vercel URL. The latest verification confirmed the corrected production event property `env=production`.

The Linear planning source is `GNE-73 MVP1-MVP3 ANALYTICS-00 [ANALYTICS] 统一事件标准、生产验收与转化看板`. Its current execution order is mirrored in `context/linear.md`.

Deployment and environment memory:

- Production event verification should be recorded in `context/deployment-status.md`.
- Environment and product separation rules live in `context/environment-matrix.md`.
- Production monitoring checks live in `context/production-monitoring.md`.

Provider matrix:

- MVP2 provider stage boundaries and mock/no-op rules live in `integrations/provider-matrix.md`.

Provider adapter boundary:

- GNE-181 keeps PostHog behind `apps/web/lib/analytics/*`.
- `apps/web/lib/providers/analytics-client.ts` is a client-only facade for future provider convention alignment.
- Do not move existing Auth analytics calls to a new provider layer unless a later Analytics issue explicitly requires it.
- GNE-155 adds safe server-side AI summary events from the AI service boundary.
  These events are for observation only; AI entitlement, Credit, and usage
  ledger truth remain in Billing and AI services.

## Default Providers

- PostHog for global-friendly product analytics.
- Jiguang reserved for China-friendly analytics.

## PostHog Project Strategy

MVP1-MVP3 use one PostHog Project by default. Do not split projects just to make early dashboards cleaner.

Separate products, environments, markets, and stages through shared event properties:

- `app`: product or starter instance name, for example `XWLC`.
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
- `payment_canceled`
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
NEXT_PUBLIC_PRODUCT_ID=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=
NEXT_PUBLIC_APP_MARKET=
NEXT_PUBLIC_APP_VERSION=
NEXT_PUBLIC_MVP_STAGE=
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_JIGUANG_APP_KEY=
```

`NEXT_PUBLIC_ANALYTICS_PROVIDER` is the only browser-visible provider selector introduced by GNE-182. It is not a secret.

`NEXT_PUBLIC_POSTHOG_KEY` is the preferred project variable name in this starter. `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is also supported for compatibility with PostHog's current Next.js docs.

## Rules

- Business code should call a local `trackEvent` abstraction.
- Do not call provider SDKs throughout product code.
- Analytics must not be used as a payment or entitlement source of truth.
- Analytics must not be used as the Auth, Payment, Entitlement, or AI token ledger source of truth.
- Production event verification should be documented after deployment.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing analytics env keys before using that deployment as production or preview evidence.
- M4 Auth uses Supabase Auth as the source of truth and PostHog only for product analytics.
- Every event should carry the shared MVP factory properties: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- For local M4 testing, the current operator account can be identified with the GitHub-bound email `<test-operator-email>` after successful login.
- Never send passwords, OTPs, session cookies, Supabase tokens, service role keys, or raw provider payloads to PostHog.
- Never send prompt text, generated text, provider secrets, payment card data, webhook raw payloads, or personal secrets to PostHog.
- Map auth failures into safe categories such as `validation_error`, `provider_error`, and `rate_limited`.

## Event Implementation Contract

New instrumentation must follow this contract before a reviewer treats it as valid evidence:

- Client-side UI events should use `apps/web/lib/analytics/client.ts`; server-side business facts should use `apps/web/lib/analytics/server.ts`.
- Server-side conversion events should be emitted only after the trusted service boundary has made the decision. For example, `payment_succeeded` and `entitlement_granted` happen after Billing facts are written, not because a success URL loaded.
- `quota_limit_reached` must come from a server-side entitlement or quota block decision. Do not emit it from a disabled button, pricing-page click, static route load, or other client-only inference.
- All events must include the shared factory properties: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- Server-side events should also include safe runtime context such as `$lib=server`, `current_url` / `$current_url`, and `host` when available, so PostHog Activity rows do not look like incomplete browser-only events.
- Event-specific properties must be minimal and decision-relevant. Examples: `plan`, `price_id`, `provider`, `payment_mode`, `result`, `feature_key`, `requested_credit`, `remaining_credit`, `model`, and `provider_mode`.
- Analytics events may observe Auth, Payment, Billing, AI, and quota behavior, but these systems must keep their own trusted facts in services and database tables.
- Reviewers should expand a fresh PostHog event and verify both shared properties and event-specific properties. A row appearing in Activity is not enough if the properties are missing.

## PostHog Funnel And Dashboard Templates

`GNE-124` owns reusable PostHog funnel and dashboard templates for MVP2/MVP3 reviewer acceptance. These templates are observation surfaces only; they do not make PostHog the source of truth for Auth, Billing, Payment, Entitlement, AI, or quota state.

Recommended Core dashboard name:

```text
XWLC MVP2 Core Analytics
```

Recommended AI dashboard name:

```text
XWLC MVP2 AI Analytics
```

Dashboard review should start with these shared filters:

- `app = XWLC` or the current product slug.
- `env = local`, `preview`, or `production`; production evidence must use `production`.
- `market = overseas` unless a later China-mode issue changes the provider matrix.
- `mvp_stage = mvp2` for extension-foundation checks or `mvp_stage = mvp3` for Product Validation Kit checks.
- `module = auth`, `payment`, `billing`, `ai`, `growth`, or `core` depending on the review question.

Template cards:

| Card | Events | Required filters / breakdowns | Trusted source boundary | Reviewer proof |
| --- | --- | --- | --- | --- |
| Production health | `Pageview` or `page_viewed`, `login_started`, `user_logged_in` | Filter `env=production`; use deployed Vercel URL only. | Deployed app runtime plus PostHog client/server wrappers. | Recent production event shows deployed URL and `app`, `mvp_stage`, `market`, `env`, `version`, `module`. |
| Auth lifecycle | `signup_started`, `user_signed_up`, `login_started`, `user_logged_in`, `auth_login_failed` | Filter `module=auth`; breakdown by `env` and safe auth properties when useful. | Supabase Auth and app Auth server actions. | Expanded event shows shared properties and safe auth properties; no password, OTP, token, cookie, or raw provider payload. |
| Payment conversion | `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, `entitlement_granted` | Filter `module=payment` or `module=billing`; breakdown by `plan`, `price_id`, `provider`, and `payment_mode`. | Payment service, Billing service, orders, subscriptions, entitlements, and webhook handling. | Success/failure events are emitted after trusted server-side facts, not from a success URL alone. |
| Quota and paywall | `quota_limit_reached`, then optional `checkout_started` and `payment_succeeded` | Filter by `feature_key`, `plan`, `reason`, and `provider`. | Billing entitlement and quota decision service. | `quota_limit_reached` appears only after a real gated action is blocked server-side. |
| AI usage | `ai_request_started`, `ai_request_completed`, `ai_request_failed`, `quota_limit_reached` | Filter `module=ai`; breakdown by `model`, `provider`, `provider_mode`, `result`, and `reason`. | AI service boundary and Billing usage / Credit ledger. | No raw prompt or generated text; events include safe usage, model, Credit, and result fields. |
| Data quality review | Critical named events above | Table or HogQL checks for missing shared properties and forbidden sensitive keys. | Analytics wrappers and environment config. | Reviewer can show that required shared properties are present and sensitive fields are absent. |

Dashboard boundary:

- MVP2 uses PostHog saved dashboards and saved insights only. It does not build a station-internal admin analytics page.
- MVP3 may add product-owner validation dashboards inside Product Validation Kit when project/product entities exist.
- MVP4 or later may add role-gated station/operator analytics under an admin route.

The current PostHog connector can update dashboards and saved insights, but it does not expose reusable top-level dashboard quick-filter creation. MVP2 dashboards therefore use fixed query scopes plus visible filter/breakdown columns. Reviewers should narrow views with PostHog's built-in filters for `env`, `app`, `mvp_stage`, `market`, `module`, `provider`, `plan`, `price_id`, and `model`.

Reviewer checklist:

- Auth, Payment, AI, Quota, Production health, and Data Quality are visible from saved sections or saved insights.
- Each template separates observational analytics from trusted app facts.
- Each template uses the shared factory properties: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.
- MVP2 foundation templates are separated from future MVP3 activation / growth templates.
- No template requires sending secrets, raw provider payloads, prompts, generated output, payment card data, or private customer data to PostHog.

## Latest MVP2 Dashboard Evidence

Core dashboard:

- Name: `XWLC MVP2 Core Analytics`
- Project: `ai-web-starter-kit` (`476986`)
- URL: <https://us.posthog.com/project/476986/dashboard/1748902>

AI dashboard:

- Name: `XWLC MVP2 AI Analytics`
- Project: `ai-web-starter-kit` (`476986`)
- URL: <https://us.posthog.com/project/476986/dashboard/1748661>

Latest verification on 2026-06-23:

- Core dashboard coverage includes production health, Auth lifecycle, Auth funnel, Payment lifecycle, Payment funnel, AI/Quota, and data-quality insights.
- AI dashboard coverage includes AI request start/completion/failure, quota blocks, Credit/payment entry, and AI data-quality checks.
- `payment_failed` was verified through a protected sandbox/server-side failure path during MVP2 analytics testing. Formal MVP2 UI must not expose a dedicated failure-only button; future samples should come from provider failure callbacks, sandbox failure fixtures, or targeted service tests.
- `ai_request_failed` was verified through the server-side AI service without external provider calls, Credit consumption, prompt capture, or generated-content capture. Formal MVP2 UI must not expose a dedicated failure-test model.
- Core shared properties `app`, `env`, `module`, `mvp_stage`, and `market` had zero missing values in the critical-event data-quality table at the time of review.
- `provider` and `plan` can be missing on Auth events; those fields are required for Payment and applicable AI/Billing events only.
- PostHog remains observation-only. Trusted facts still come from Auth, Payment, Billing, AI services, provider callbacks, and database tables.

## Multi-Environment And Multi-Product Viewing Rules

`GNE-122` owns the default viewing convention while MVP1-MVP3 share one PostHog Project.

- Start every investigation by setting `env` first. Do not mix `local`, `preview`, and `production` unless the question is explicitly cross-environment.
- Set `app` / `NEXT_PUBLIC_APP_NAME` second. Do not compare starter-kit events with a future real product unless the dashboard title says it is a cross-product view.
- Set `mvp_stage` third. MVP2 foundation behavior and MVP3 Product Validation Kit behavior should not be reviewed in the same funnel unless the chart is intentionally a stage comparison.
- Use `market` to separate overseas and future China-mode events.
- Use `module` to keep Auth, Payment, Billing, AI, Growth, and Core questions narrow.
- Treat browser autocapture rows as supporting clues only. Product acceptance should use named events with the required shared properties.
- Production evidence must show the deployed Vercel URL and `env=production`; local evidence must show `env=local`.
- If a row has no URL or library column because it came from the server-side analytics wrapper, expand the event and verify `$lib=server`, `current_url` / `$current_url`, `host`, and the shared factory properties.

## Linear Execution Order

```text
GNE-73 MVP1-MVP3 ANALYTICS-00
├── GNE-101 ANALYTICS-01 [DOC][MVP1] Event naming, shared properties, and privacy boundary
├── GNE-123 ANALYTICS-02 [DEV][MVP1] Product analytics config and env entry
├── GNE-102 ANALYTICS-03 [DEV][MVP1] PostHog adapter, no-op, and shared property injection
├── GNE-103 ANALYTICS-04 [DEV][MVP1] Auth and pageview conversion events
├── GNE-105 ANALYTICS-05 [TEST][MVP2] Production PostHog event and field verification
├── GNE-124 ANALYTICS-06 [DOC][MVP2/MVP3] PostHog funnel and dashboard templates
├── GNE-122 ANALYTICS-07 [DOC][MVP2] Multi-env and multi-product data viewing rules
├── GNE-125 ANALYTICS-08 [TEST][MVP2/MVP3] Single Project data isolation verification
└── GNE-159 ANALYTICS-09 [AI][MVP2] AI usage, cost, and conversion dashboards
```

Status rule:

- `Done`: the spec or delivery is complete and can be used by downstream work.
- `In Progress`: verified enough to move forward, but still has a documented remaining acceptance item.
- `Todo`: not implemented; execute later in number order.

Current status:

- `ANALYTICS-01..04`: Done for MVP1.
- `ANALYTICS-05`: Done. Production PostHog event reception and required shared properties have visual proof.
- `ANALYTICS-06`: Done. Reusable PostHog dashboard and funnel templates are defined above and have saved dashboard evidence.
- `ANALYTICS-07`: Done. Multi-environment and multi-product viewing rules are defined above and in `context/environment-matrix.md`.
- `ANALYTICS-08`: Done. Single-Project separation is verified through the required `env`, `app`, `mvp_stage`, `market`, and `module` filters and saved dashboard evidence.
- `ANALYTICS-09`: Done. AI server-side events, AI dashboard evidence, and data-quality checks exist. Failure samples must come from service-level fixtures, provider errors, webhook/deployment smoke paths, or controlled tests, not UI-only fake events.
- MVP3 activation and core feature events are not part of MVP2; keep them under `GNE-188 MVP3-CP-10` when real Product Validation Kit activation actions exist.
- Payment-specific analytics execution moved to `GNE-104 PAYMENT-05` under the Payment parent.

Payment-specific analytics execution lives under `GNE-104 PAYMENT-05`; Analytics owns the shared standard and dashboards, not the Payment implementation task.

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

### 2026-06-20 Production Evidence

Observed in PostHog Activity for project `ai-web-starter-kit`:

- Production URL: `https://ai-web-starter-kit-web.vercel.app/...`
- Visible events: `Pageview`, `Identify`, `login_started`, `user_logged_in`, submitted form, and click events.
- Visible library/source: `web`.
- Visible event detail example: `Pageview` for `/account` on the production Vercel URL, with browser/runtime properties and `App version = v0.1`.

### 2026-06-21 Production Evidence

Observed in PostHog Activity after the Vercel Production env correction and redeploy:

- Production URL: `https://ai-web-starter-kit-web.vercel.app/account`
- Visible event: recent `Pageview`.
- Corrected shared property: `env=production`.
- Combined with the prior expanded production evidence, the required safe shared property set is now visually confirmed: `app`, `mvp_stage`, `market`, `env`, `version`, and `module`.

Full Production Smoke Path remains separate from `ANALYTICS-05`.
