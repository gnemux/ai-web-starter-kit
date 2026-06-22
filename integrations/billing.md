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

## Ledger Review Semantics

Supabase table screenshots are useful reviewer evidence, but the meaning of empty cells depends on the ledger event:

- `billing_credit_ledger.entitlement_id` is allowed to be `NULL`.
- For `event_type=consume`, `NULL` is expected when the app consumes account-level AI Credit instead of allocating the deduction to one specific entitlement row.
- For `event_type=grant` from a credit pack, `entitlement_id` should normally point to the entitlement that was granted. If a fresh credit-pack grant has `NULL`, inspect the Payment/Billing service logs and the matching `billing_entitlements` row.
- `billing_usage_ledger.related_credit_ledger_id` should link committed AI usage to the Credit ledger row when a Credit deduction is recorded. It can remain `NULL` for non-Credit usage, older demo records, or failed/reserved/released attempts.
- These tables are audit facts. Correct data by fixing the service path or migration, not by editing production rows in the dashboard.

## MVP Boundaries

- MVP2 owns the Billing model, minimal database facts, service contract, pricing config, lifecycle rules, AI credit model, and review checklist.
- MVP3 consumes Billing through sandbox/no-op Payment and AI flows.
- MVP4 owns real overseas/china provider rollout and any domestic payment-specific settlement or compliance behavior.
