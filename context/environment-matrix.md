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
| `NEXT_PUBLIC_APP_NAME` / `app` | Product or starter instance identifier. | `ai-web-starter-kit` | `product-validation-kit`, real vertical product slug |
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

## Vercel Matrix

| Area | Current rule |
| --- | --- |
| Production trigger | `main` branch automatically triggers Production deployment. |
| Preview trigger | PR/development branches do not automatically deploy Preview under the current Hobby/private-repo setup. Repo Owner may manually create Preview from a PR branch or commit SHA. |
| Production env vars | Separate Vercel Production entries. |
| Preview env vars | Separate Vercel Preview entries. Values may temporarily equal Production while only one provider environment exists. |
| Shared Preview URL | Optional. Use manual Vercel Preview URL and paste it into PR or Linear when needed. |
| Merge gate | Vercel Preview is not a required GitHub merge gate in MVP1. |

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
| Starter kit | `ai-web-starter-kit` | MVP1 / MVP2 | Current reusable foundation. |
| Product Validation Kit | `product-validation-kit` or agreed slug | MVP3 | Future validation workspace. |
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
