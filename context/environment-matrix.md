# Environment And Product Configuration Matrix

## Purpose

This file defines naming and isolation rules for environments, products, markets, and provider configuration. It prevents future MVPs from mixing Preview and Production data or confusing starter-kit events with real product events.

## Current MVP1 Rule

The Vercel Production and Preview environment variable entries must be configured separately.

Because only one provider environment may exist right now, Production and Preview may temporarily use the same Supabase and PostHog values. This is an interim state, not final provider isolation. Keep the Vercel entries separate so values can diverge later without changing application code.

Do not create empty Vercel environment variable entries for fallback keys. For example, if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the active public key, do not add an empty `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` entry.

## Environment Names

| Environment | `NEXT_PUBLIC_APP_ENV` | Vercel target | Intended use | Data expectation |
| --- | --- | --- | --- | --- |
| Local | `local` | local dev server | Development on a developer machine. | Local or shared staging provider values in `.env.local`; never committed. |
| Preview | `preview` | Manual Vercel Preview from PR branch or commit SHA | Repo Owner checks PR behavior when a shared URL is needed. | May temporarily share provider values with Production; should later use staging provider resources. |
| Production | `production` | Vercel Production from `main` | Final MVP1 online acceptance and user-facing deployment. | Should later use production provider resources once created. |

Allowed values for `NEXT_PUBLIC_APP_ENV`:

```text
local
preview
production
```

Do not use `staging` as an app env value unless the shared TypeScript analytics contracts are changed first. A `staging` branch or staging provider can still map to `NEXT_PUBLIC_APP_ENV=preview`.

## Product And Market Identifiers

| Key | Purpose | Current MVP1 value | Future examples |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` / `app` | Product or starter instance identifier. | `XWLC` | `product-validation-kit`, real vertical product slug |
| `NEXT_PUBLIC_PRODUCT_ID` | Stable product slug for environment dashboards and future multi-product routing. | `xwlc` | `product-validation-kit`, real vertical product slug |
| `NEXT_PUBLIC_MVP_STAGE` / `mvp_stage` | Delivery stage identifier. | `mvp1` | `mvp2`, `mvp3`, `mvp4` |
| `NEXT_PUBLIC_APP_MARKET` / `market` | Market mode. | `overseas` | `china` |
| `NEXT_PUBLIC_APP_VERSION` / `version` | Product/template version label. | `v0.1` | release tag or product version |
| `module` | Event or capability module. | Set by code per module. | `auth`, `core`, `billing`, `payment`, `ai`, `growth` |

Allowed market values:

```text
overseas
china
```

China mode is reserved for MVP4 or later. MVP1 only reserves naming and does not integrate China cloud, China analytics, WeChat Pay, or Alipay.

`GNE-193 MVP4 INTEGRATIONS-00` owns the future real overseas/china dual-mode provider rollout. MVP2 only defines provider matrix, env naming, public/secret boundaries, and mock/no-op/sandbox behavior.

The MVP2 provider matrix lives in `integrations/provider-matrix.md`.

## Provider Selectors

Provider selector variables are non-secret. They choose the active provider family or mock/no-op/sandbox mode for a capability. Keep selectors server-side unless browser code needs to branch on the provider.

| Capability | Selector | Current value | Runtime visibility | Notes |
| --- | --- | --- | --- | --- |
| Auth | `AUTH_PROVIDER` | `supabase` | Server-side config | Supabase remains the real Auth provider. Browser code still uses public Supabase URL/key only. |
| Database/BaaS | `DATABASE_PROVIDER` | `supabase` | Server-side config | Supabase remains the real Database/BaaS provider. |
| Analytics | `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `posthog` | Public browser config | Browser analytics initialization may need to know the public analytics provider. |
| Payment | `PAYMENT_PROVIDER` | `sandbox` | Server-side config | Real payment providers and webhook verification are later Payment issues. |
| AI | `AI_PROVIDER` | `mock` | Server-side config | Real model providers and keys are later AI issues. |
| Email | `EMAIL_PROVIDER` | `noop` | Server-side config | No real email provider is configured yet. |
| Storage | `STORAGE_PROVIDER` | `noop` | Server-side config | No real product storage provider is configured yet. |
| SMS | `SMS_PROVIDER` | `noop` | Server-side config | No real SMS provider is configured yet. |

Allowed MVP2 selector values:

```text
AUTH_PROVIDER=supabase
DATABASE_PROVIDER=supabase
NEXT_PUBLIC_ANALYTICS_PROVIDER=posthog
PAYMENT_PROVIDER=sandbox
AI_PROVIDER=mock
EMAIL_PROVIDER=noop
STORAGE_PROVIDER=noop
SMS_PROVIDER=noop
```

Future real provider values must be introduced by the owning Payment, AI, Email, Storage, SMS, Analytics, Auth, or Database issue and documented in the relevant integration file before use.

## Public And Server-Only Provider Variables

| Category | Public browser variables | Server-only variables |
| --- | --- | --- |
| App metadata | `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_PRODUCT_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_APP_MARKET`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_MVP_STAGE` | None |
| Supabase Auth/Database | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `AUTH_PROVIDER`, `DATABASE_PROVIDER`, `SUPABASE_PROJECT_REF`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Analytics | `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_JIGUANG_APP_KEY` | None for current MVP2 analytics config |
| Payment | None | `PAYMENT_PROVIDER`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` |
| AI | None | `AI_PROVIDER`, `AI_MODEL`, `AI_PROVIDER_API_KEY`, `AI_BUDGET_LIMIT` |
| Email | None | `EMAIL_PROVIDER`, `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS` |
| Storage | None | `STORAGE_PROVIDER`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` |
| SMS | None | `SMS_PROVIDER`, `SMS_PROVIDER_API_KEY`, `SMS_PROVIDER_SECRET`, `SMS_SENDER_ID` |

Do not add `NEXT_PUBLIC_` to Payment, AI, Email, Storage, SMS, webhook, service-role, SMTP, signing, or private provider API key variables.

## Local, Preview, And Production Placement

| Key group | Local `.env.local` | Vercel Preview | Vercel Production |
| --- | --- | --- | --- |
| App metadata | Configure local values such as `NEXT_PUBLIC_APP_ENV=local`. | Configure Preview entries separately with `NEXT_PUBLIC_APP_ENV=preview`. | Configure Production entries separately with `NEXT_PUBLIC_APP_ENV=production`. |
| Provider selectors | Configure defaults from `.env.example` unless testing a specific provider branch. | Configure Preview entries separately. Values may temporarily match Production. | Configure Production entries separately. Values may temporarily match Preview while one provider environment exists. |
| Public provider keys | Local or shared staging public values only. | Preview public provider entries. Values may temporarily match Production. | Production public provider entries. |
| Server-only secrets | Local ignored values only when needed. | Preview secrets in Vercel Dashboard only. | Production secrets in Vercel Dashboard only. |

After changing any Vercel environment variable, redeploy the affected Preview or Production deployment before testing. Existing deployments do not automatically receive new env values.

## Vercel Matrix

| Area | Current rule |
| --- | --- |
| Production trigger | `main` branch automatically triggers Production deployment. |
| Preview trigger | PR/development branches do not automatically deploy Preview under the current Hobby/private-repo setup. Repo Owner may manually create Preview from a PR branch or commit SHA. |
| Production env vars | Separate Vercel Production entries. |
| Preview env vars | Separate Vercel Preview entries. Values may temporarily equal Production while only one provider environment exists. |
| Shared Preview URL | Optional. Use manual Vercel Preview URL and paste it into PR or Linear when needed. |
| Merge gate | Vercel Preview is not a required GitHub merge gate in MVP1. |

Vercel environment variables:

- Configure Production and Preview entries separately even if the current values are temporarily identical.
- Do not create empty Vercel entries for optional fallback keys; keep optional blanks in `.env.example`, not in the Vercel dashboard.
- Redeploy after any environment variable change before using that deployment as evidence.

## Supabase Matrix

| Environment | Current role | Future role | Notes |
| --- | --- | --- | --- |
| Local | Local Supabase or shared staging values in `.env.local`. | Same. | `.env.local` is ignored and may contain real local values. |
| Preview | May temporarily use the same Supabase project as Production. | Prefer staging Supabase. | Keep Preview Vercel entries separate so values can diverge. |
| Production | May temporarily use the current shared Supabase project until a true production project exists. | Production Supabase. | Production schema changes must follow `context/supabase-workflow.md`. |

Supabase public browser keys:

- Prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for newer projects when it has a real value.
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the legacy fallback.
- Do not add an empty fallback key in Vercel; an empty value can break runtime config in deployed builds.
- Never expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` through `NEXT_PUBLIC_`.

## PostHog Matrix

| Environment | Current rule | Notes |
| --- | --- | --- |
| Local | Events may be disabled or sent with `env=local` if key is configured. | Do not use local events as production evidence. |
| Preview | Use `env=preview`. | Same PostHog Project is acceptable in MVP1. |
| Production | Use `env=production`. | Production event verification must show deployed URL, not localhost. |

MVP1-MVP3 use one PostHog Project by default. Split into multiple PostHog Projects only for clear reasons such as event volume, customer isolation, permission isolation, compliance boundary, or separate legal entity.

Current production evidence is recorded in `context/deployment-status.md`: PostHog Activity has shown production Vercel URL events for `ai-web-starter-kit`, including `Pageview`, `Identify`, `login_started`, and `user_logged_in`. Final `ANALYTICS-06` closure still requires expanded event proof for the required shared properties.

Required shared event properties:

```text
app
mvp_stage
market
env
version
module
```

## Future Product Matrix

| Product line | `app` value | Stage | Notes |
| --- | --- | --- | --- |
| Starter kit | `XWLC` | MVP1 / MVP2 | Current reusable foundation and public site brand. |
| Product Validation Kit | `product-validation-kit` or agreed slug | MVP3 | Future validation workspace. |
| Overseas/china provider foundation | product-specific or shared provider mode slug | MVP4 | Real dual-mode provider rollout; see `GNE-193`. |
| Real overseas vertical product | product slug | MVP5 | Should receive its own URL and provider isolation plan. |
| Real China product | product slug | MVP6 or later | Requires MVP4 dual-mode provider decisions first. |

## AI Update Protocol

When the user changes provider environments, asks whether a variable belongs to Production or Preview, or introduces a new product/market, AI must:

1. Read `specs/deploy/engineering-spec.md`.
2. Read this file and summarize the current matrix.
3. Confirm whether the change is an interim same-value setup or a real provider split.
4. Record key names and environment roles only, not values.
5. Update `context/deployment-status.md` if the change affects deployment verification.
6. Update provider integration docs only when the rule changes, not for one-off dashboard values.
