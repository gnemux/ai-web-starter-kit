# Provider Adapter Boundary

This directory is the GNE-181 landing point for app-side provider adapters.

## Files

- `catalog.ts`: provider descriptors and current runtime boundaries. Safe to read from server code and tooling.
- `analytics-client.ts`: client-only facade over the existing PostHog analytics helper. It does not rewrite the current Auth analytics flow.
- `server.ts`: server-only sandbox/mock/no-op adapters for Payment, AI, Email, Storage, and SMS.

## Current Boundaries

- Supabase Auth and Database stay behind `apps/web/lib/services/*` and `apps/web/lib/supabase/*`; GNE-181 does not deep-providerize them.
- PostHog stays behind `apps/web/lib/analytics/*`; GNE-181 only gives future code a stable provider facade location.
- Payment uses a sandbox adapter contract only. No real payment SDK, webhook verification, or secret is introduced here.
- AI uses a mock adapter contract only. No model provider SDK, prompt logging, budget enforcement, or provider key is introduced here.
- Email, Storage, and SMS use no-op adapters only.

Server-only provider adapters must not be imported by client components. Client code may use `analytics-client.ts` for browser-safe analytics calls.

## Environment Selectors

GNE-182 provider selector names are documented in `.env.example` and `context/environment-matrix.md`.

- Server-side selectors: `AUTH_PROVIDER`, `DATABASE_PROVIDER`, `PAYMENT_PROVIDER`, `AI_PROVIDER`, `EMAIL_PROVIDER`, `STORAGE_PROVIDER`, `SMS_PROVIDER`
- Browser-visible selector: `NEXT_PUBLIC_ANALYTICS_PROVIDER`

Server-only provider secrets must not use `NEXT_PUBLIC_`.
