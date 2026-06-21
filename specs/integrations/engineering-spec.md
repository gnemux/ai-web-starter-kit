# Integrations Engineering Spec

## Scope

This spec owns the MVP2 provider foundation tracked by `GNE-167`, with execution split into `GNE-180` through `GNE-183`.

`GNE-180` is documentation-only. It establishes the provider matrix and stage boundary. Later child issues add provider interfaces, env naming, and reusable checks.

## Affected Areas

- `integrations/provider-matrix.md`
- Provider integration docs under `integrations/`
- `README.md`
- `context/status.md`
- Later child issues may touch `packages/core`, `apps/web/lib/providers`, `.env.example`, and test/checklist docs.

## Current Provider State

- Supabase is the current real Auth and Database/BaaS provider.
- PostHog is the current real Analytics provider with no-op behavior when public analytics env is missing.
- Vercel is the current Deploy/CDN provider.
- Payment starts with a Sandbox Provider in MVP2.
- AI, Email, Storage, and SMS are reserved as mock/no-op or planned providers until their execution issues define runtime behavior.
- MVP4 owns real overseas/china dual-mode provider rollout.

## Boundary Rules

- Product routes and UI components should not directly scatter provider SDK calls.
- Existing Supabase usage remains behind `apps/web/lib/supabase/*` helpers and service modules.
- Existing PostHog usage remains behind local analytics helpers.
- Server-only secrets must not use `NEXT_PUBLIC_`.
- Public browser variables are allowed only for browser-required publishable, anon, project, host, or client config.
- Provider docs must never contain real secrets, tokens, service-role keys, webhook secrets, raw payloads, account screenshots, or customer data.

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
