# Billing Engineering Spec

## Ownership

- Linear milestone: `MVP2 扩展底座`
- Parent issue: `GNE-71`
- Child issues: `GNE-91`, `GNE-191`, `GNE-92`, `GNE-93`, `GNE-94`, `GNE-157`, `GNE-95`

## Affected Areas

- `specs/billing`
- `integrations/billing.md`
- `supabase/migrations`
- `apps/web/lib/supabase/database.types.ts`
- `packages/core/src/billing.ts`
- `apps/web/lib/services/billing.ts`
- `context/status.md`
- `context/linear.md`

## Architecture

```text
Billing config in packages/core
-> trusted Payment/Admin/AI inputs
-> Billing tables and ledgers
-> apps/web Billing service
-> UI, Payment, AI, Analytics callers
```

The first MVP2 pass keeps Billing provider-agnostic. Payment provider names and external IDs may be stored as data, but provider SDKs and webhook details stay outside Billing.

## Data Model

### Config-backed models

- `plans`: stable template plan definitions.
- `prices`: sellable plan or add-on prices.
- `features`: named capabilities and quotas.

These live in `packages/core/src/billing.ts` so pricing UI, checkout, and entitlement checks can share a contract without requiring a database read for static template defaults.

### Database-backed facts

- `billing_orders`: trusted purchase facts from payment events or sandbox flows.
- `billing_subscriptions`: recurring commercial state.
- `billing_entitlements`: active or historical feature grants.
- `billing_credit_ledger`: credit/allowance grants, consumption, refunds, expirations, and adjustments.
- `billing_usage_ledger`: usage measurement records with idempotency keys.

### Ledger Null Semantics

`billing_credit_ledger.entitlement_id` is nullable by design. A reviewer should interpret it by event type and source:

- `grant` rows from a credit pack or explicit entitlement grant should normally reference `billing_entitlements.id`.
- `consume` rows may have `entitlement_id = null` when Credit is consumed from the account-level allowance or aggregated balance rather than from one specific entitlement row.
- Historical rows may also become `null` if their referenced entitlement was deleted, because the foreign key uses `on delete set null`.
- `billing_usage_ledger.related_credit_ledger_id` should be present when committed AI usage writes a matching Credit ledger row, but it may be `null` for older demo rows, reserved/released/failed attempts, or usage records that are not Credit-backed.
- Reviewers should not manually edit these rows in Supabase. The trusted path is service code writing through Payment, Billing, or AI boundaries.

## RLS And Permissions

- All Billing tables in `public` must enable RLS.
- Authenticated users may read only rows where `owner_id = auth.uid()`.
- Authenticated users must not insert, update, or delete Billing fact rows directly.
- `service_role` or server-only admin clients own writes from Payment, AI, and internal jobs.
- Idempotency keys are required on ledger-like event tables to avoid duplicate grants or consumption.

## Service Boundary

`apps/web/lib/services/billing.ts` owns app-side service calls:

- `getCurrentBillingEntitlements`
- `assertBillingEntitlement`
- `getCurrentBillingActivity`
- `switchCurrentBillingPlanToFree`

Pages and components should consume this service rather than querying Billing tables directly.

## UI Requirements

- `/account/billing` should read like a user-facing plan surface, not a provider or database inspection page.
- The primary order is Free/Plus/Pro plan selection with the current plan state folded into the selected card, then recent plan purchase records.
- AI Credit balance, plan-vs-credit-pack source split, credit-pack top-up, top-up records, and Credit consumption records belong under `/account/usage`.
- Non-AI plan-card entitlements may be template placeholder access items when no real product module exists yet. They should be shown as included/not included access, not as fake consumption counts.
- Higher-tier plans should visibly include lower-tier plan content: Plus includes Free, and Pro includes Plus.
- Main path copy should be short and action-oriented; avoid standalone explanatory sections such as upgrade guides or template notes.
- Sandbox/local-payment limits may appear as restrained badges or payment-page copy, but they should not dominate the Billing page.
- Do not add buttons for unsupported production actions such as invoice download, payment method management, refunds, tax, or live subscription cancellation until the corresponding provider work exists.
- The page may support sandbox-safe plan switching: Free through a protected account action, and paid plans through sandbox checkout. Existing active sandbox plan facts should be canceled when a different plan becomes current.
- Recent plan records should read from `billing_orders`; recent AI usage records should read from `billing_usage_ledger` on the AI page. These records are reviewer-facing facts, not a full invoice or reconciliation system.
- Plan-card badges such as `基础`, `推荐`, `当前套餐`, and their English equivalents are compact status tokens. They must stay on one line; if a future label is too long, shorten the badge and move detail into nearby copy.

## Lifecycle Rules

- `trialing` and `active` subscriptions can grant normal entitlements.
- `past_due` may keep read/grace access but should block new paid-only consumption unless explicitly allowed.
- `canceled` remains active only until `current_period_end` if that timestamp is in the future.
- `expired` and `refunded` should not grant active paid entitlements.
- Success URLs are navigation only. They do not grant entitlement.

## Security

- No real payment, AI, or webhook secret is introduced.
- No `NEXT_PUBLIC_` Billing secret is allowed.
- Provider price IDs are treated as server/config data unless later explicitly approved.
- Billing ledgers are audit facts and should be append-oriented.

## Rollout

- Local: apply migrations with `supabase db reset` and run TypeScript checks.
- Staging: apply reviewed migrations only after PR merge.
- Production: maintainer-controlled migration with backup/rollback awareness.

## Open Questions

- Whether a future product wants database-managed dynamic pricing instead of config-backed template pricing.
- Which real payment provider will own the first provider price IDs.
- Whether tax/invoice/reconciliation models are needed after MVP3 validation.
