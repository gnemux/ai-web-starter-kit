# Billing Integration Notes

## Purpose

Billing is the internal commercial source of truth for plans, subscriptions, entitlements, usage, and credits. It is not a third-party provider integration, but it coordinates Payment, AI, Analytics, Supabase, and future product UI.

## Current Status

MVP2 foundation is implemented as a provider-agnostic model:

- Static pricing and entitlement config lives in `packages/core/src/billing.ts`.
- The current template config includes Free, Plus, Pro, and an AI credit pack.
- Billing fact tables live in Supabase migrations.
- App access goes through `apps/web/lib/services/billing.ts`.
- No real payment provider SDK, webhook secret, or AI provider key is introduced.

## Boundaries

- Payment emits trusted server-side payment events.
- Billing converts trusted events into orders, subscriptions, entitlements, credit ledger entries, and usage ledger entries.
- AI checks Billing before calls and records usage after successful calls.
- Analytics observes Billing and Payment events but never grants access.
- UI displays Billing results but does not derive final entitlement from route params, success pages, or client state.

## Environment Variables

Billing itself does not introduce a public environment variable.

Related provider variables remain server-side unless explicitly documented elsewhere:

```text
PAYMENT_PROVIDER=sandbox
PAYMENT_MODE=sandbox
PAYMENT_LIVE_ENABLED=false
PAYMENT_SECRET_KEY=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
AI_PROVIDER=
AI_PROVIDER_API_KEY=
AI_BUDGET_LIMIT=
```

## Supabase

Billing tables are exposed in `public`, so RLS is enabled on every table.

- Authenticated users may read only rows where `owner_id = auth.uid()`.
- Users cannot directly write Billing fact tables.
- Service-only code handles grants, consumption, subscription state changes, and provider event ingestion.

## MVP Boundaries

- MVP2 owns the Billing model, minimal database facts, service contract, pricing config, lifecycle rules, AI credit model, and review checklist.
- MVP3 consumes Billing through sandbox/no-op Payment and AI flows.
- MVP4 owns real overseas/china provider rollout and any domestic payment-specific settlement or compliance behavior.
