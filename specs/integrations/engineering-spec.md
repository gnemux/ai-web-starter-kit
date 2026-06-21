# Integrations Engineering Spec

## Scope

This spec owns the MVP2 provider foundation tracked by `GNE-167`, with execution split into `GNE-180` through `GNE-183`.

`GNE-180` is documentation-only. It establishes the provider matrix and stage boundary. `GNE-181` adds provider-independent contracts and app-side adapter landing points without replacing already-working Supabase or PostHog code paths. `GNE-182` standardizes environment variable naming and public/server-only layering. `GNE-183` adds the reusable provider configuration, no-op/mock/sandbox behavior, and secret leakage checklist.

## Affected Areas

- `integrations/provider-matrix.md`
- Provider integration docs under `integrations/`
- `README.md`
- `context/status.md`
- `packages/core/src/providers.ts`
- `apps/web/lib/providers/*`
- `.env.example`
- `context/environment-matrix.md`
- `integrations/provider-config-checklist.md`
- Test/checklist docs under `specs/integrations/*`

## Current Provider State

- Supabase is the current real Auth and Database/BaaS provider.
- PostHog is the current real Analytics provider with no-op behavior when public analytics env is missing.
- Vercel is the current Deploy/CDN provider.
- Payment starts with a Sandbox Provider in MVP2.
- AI, Email, Storage, and SMS are reserved as mock/no-op or planned providers until their execution issues define runtime behavior.
- MVP4 owns real overseas/china dual-mode provider rollout.

## GNE-181 Provider Contracts

Provider-neutral contracts live in `packages/core/src/providers.ts`.

Implemented contract surface:

- Provider descriptors and health/status types.
- Analytics provider facade type.
- Payment checkout session contract.
- AI text generation contract.
- Email delivery contract.
- Storage upload target contract.
- SMS delivery contract.

The app-side adapter landing point is `apps/web/lib/providers`:

- `catalog.ts` records current provider descriptors and runtime boundaries.
- `analytics-client.ts` is a client-only facade over the existing PostHog helper.
- `server.ts` contains server-only sandbox/mock/no-op adapters for Payment, AI, Email, Storage, and SMS.

GNE-181 intentionally does not:

- replace Supabase Auth or Database helpers with a generic provider layer
- move current PostHog instrumentation away from `apps/web/lib/analytics/*`
- install real Payment, AI, Email, Storage, or SMS SDKs
- introduce real provider secrets or new environment variables

## GNE-182 Environment Naming

The environment template in `.env.example` must use placeholders only for provider values. Real provider keys, webhook secrets, service-role keys, account tokens, private URLs, and customer data must stay in local ignored files or provider dashboards.

Provider selectors:

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

Public browser variables are limited to app/product metadata, analytics public config, and Supabase public client config. Server-only provider secrets must not use `NEXT_PUBLIC_`.

GNE-182 standardizes server-only placeholders for future providers:

- Payment: `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`
- AI: `AI_PROVIDER_API_KEY`, `AI_BUDGET_LIMIT`
- Email: `EMAIL_PROVIDER_API_KEY`
- Storage: `STORAGE_SECRET_ACCESS_KEY`
- SMS: `SMS_PROVIDER_API_KEY`, `SMS_PROVIDER_SECRET`

Vercel Production and Preview entries must be configured separately. Any Vercel environment variable change requires redeploying the affected Production or Preview deployment before runtime verification.

## GNE-183 Provider Configuration Checklist

The reusable review checklist lives in `integrations/provider-config-checklist.md`.

It covers:

- optional provider not configured
- required provider missing
- provider host errors
- provider disabled by selector
- server-only adapter imported by client code
- browser request blocking, especially analytics blockers
- minimum smoke/mock paths for Analytics, Payment, AI, Email, Storage, and SMS
- secret leakage review across Git diff, `.env.example`, README, `context/`, `integrations/`, `specs/`, Linear, PR text, screenshots, browser source, and client bundle/build artifacts

The checklist is intentionally provider-foundation work. It does not add real Payment, AI, Email, Storage, or SMS SDKs, and it does not deep-providerize Supabase Auth/Database or rewrite the working PostHog path.

## Boundary Rules

- Product routes and UI components should not directly scatter provider SDK calls.
- Existing Supabase usage remains behind `apps/web/lib/supabase/*` helpers and service modules.
- Existing PostHog usage remains behind local analytics helpers.
- Server-only secrets must not use `NEXT_PUBLIC_`.
- Public browser variables are allowed only for browser-required publishable, anon, project, host, or client config.
- Provider selector variables are non-secret. Keep them server-side unless browser code needs the selector; currently only `NEXT_PUBLIC_ANALYTICS_PROVIDER` is browser-visible.
- Provider docs must never contain real secrets, tokens, service-role keys, webhook secrets, raw payloads, account screenshots, or customer data.
- Server-only provider adapters must not be imported by client components.

## Stage Rules

- MVP2: provider matrix, interface conventions, env/public-secret rules, mock/no-op/sandbox behavior, and verification checklist.
- MVP3: Product Validation Kit consumes MVP2 foundations and may use sandbox/mock/no-op paths for product validation.
- MVP4: real overseas/china provider rollout, including domestic payment, AI, analytics, cloud, CDN, SMS, email, storage, and compliance/deployment differences.

## Verification

For documentation-only provider matrix changes:

- Confirm matrix coverage for Auth, Database/BaaS, Analytics, Payment, AI, Email, Storage, SMS, and Deploy/CDN.
- Confirm each row states current state, overseas default, china candidate/reservation, local/test strategy, MVP2 action, MVP4 action, server-only boundary, and `NEXT_PUBLIC_` rule.
- Confirm README or another repo entry links to the matrix.
- Run a secret keyword search before review.

For GNE-181 provider contract changes:

- Run `pnpm typecheck`.
- Run `pnpm lint`.
- Search for provider SDK imports and confirm Supabase/PostHog remain behind their existing helper boundaries.
- Search client-facing app code for server-only provider adapter imports.
- Start the local web app and smoke test `/`, `/login`, `/dashboard`, and `/account`.

For GNE-182 environment naming changes:

- Confirm `.env.example` contains only placeholders for provider values.
- Confirm server-only secrets do not use `NEXT_PUBLIC_`.
- Confirm provider selectors are documented in `.env.example`, `context/environment-matrix.md`, and related integration docs.
- Start the local web app and smoke test `/`, `/login`, `/dashboard`, and `/account`.

For GNE-183 provider configuration and leakage checklist changes:

- Run `pnpm typecheck`.
- Run `pnpm lint`.
- Run `pnpm build`.
- Run the static boundary and secret searches documented in `integrations/provider-config-checklist.md`.
- Confirm the checklist covers optional provider absence, required provider absence, host errors, disabled providers, server-only client imports, browser blocking, and client bundle leakage checks.
- Start the local web app and smoke test `/`, `/login`, `/dashboard`, and `/account`.
