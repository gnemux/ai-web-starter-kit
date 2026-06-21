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

Pages and components should consume this service rather than querying Billing tables directly.

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
