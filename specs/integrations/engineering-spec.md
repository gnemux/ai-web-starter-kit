# Integrations Engineering Spec

## Scope

This spec owns the MVP2 provider foundation tracked by `GNE-167`, with execution split into `GNE-180` through `GNE-183`.

`GNE-180` is documentation-only. It establishes the provider matrix and stage boundary. `GNE-181` adds provider-independent contracts and app-side adapter landing points without replacing already-working Supabase or PostHog code paths. Later child issues add env naming and reusable checks.

## Affected Areas

- `integrations/provider-matrix.md`
- Provider integration docs under `integrations/`
- `README.md`
- `context/status.md`
- `packages/core/src/providers.ts`
- `apps/web/lib/providers/*`
- Later child issues may touch `.env.example` and test/checklist docs.

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

## Boundary Rules

- Product routes and UI components should not directly scatter provider SDK calls.
- Existing Supabase usage remains behind `apps/web/lib/supabase/*` helpers and service modules.
- Existing PostHog usage remains behind local analytics helpers.
- Server-only secrets must not use `NEXT_PUBLIC_`.
- Public browser variables are allowed only for browser-required publishable, anon, project, host, or client config.
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
