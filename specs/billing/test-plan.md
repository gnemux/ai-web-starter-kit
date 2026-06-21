# Billing Test Plan

## Static Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Database Checks

Run when local Supabase is available:

```bash
supabase db reset
```

Expected result:

- Billing migration applies after the existing data template migrations.
- All Billing tables exist in `public`.
- RLS is enabled on every Billing table.
- Authenticated users can select only their own Billing rows.
- Authenticated users cannot insert, update, or delete Billing fact rows directly.

## Reviewer Checklist

- Free user: no database subscription still receives the Free plan defaults through the Billing service.
- Pro user: active/trialing subscription can produce paid entitlements.
- Free / Pro / AI credit-pack config: `packages/core/src/billing.ts` contains the provider-neutral plan, price, and allowance definitions.
- Specs: `specs/billing/*` documents the domain model, module boundaries, acceptance criteria, and test plan.
- Data model: `supabase/migrations/20260621130735_create_billing_foundation.sql` creates Billing facts and RLS boundaries.
- Service boundary: `apps/web/lib/services/billing.ts` is the app entry for current entitlement snapshots and feature checks.
- Past due: state is visible but should not silently grant new paid consumption unless a later product rule allows grace access.
- Canceled: remains usable only when the current period has not ended.
- Expired/refunded: does not grant paid entitlements.
- Duplicate event: same idempotency key must not create duplicate ledger facts.
- AI usage: failed AI calls should not consume tokens; successful calls should record usage through the ledger boundary.
- Payment success page: navigation alone must not create an entitlement.

## Manual Service Smoke

The Billing reviewer surface lives on `/account`. Reviewers can also inspect `apps/web/lib/services/billing.ts` and confirm:

- `getCurrentBillingEntitlements` reads through the service layer.
- `assertBillingEntitlement` delegates to core entitlement logic.
- Pages do not query Billing tables directly.

## Page Review Surface

Open the local app and sign in:

```text
http://localhost:3002/account
```

Expected result:

- The account page shows a `计费与权益` / `Billing and access` section.
- The current account falls back to Free when there is no trusted subscription fact.
- Free and Pro plan differences are visible on the page.
- AI credit pack is visible as a sandbox/provider-mapping reservation, not a real checkout button.
- The page does not imply that real payment or real AI provider integration is complete.
- This page review surface is tracked by `GNE-197 BILLING-08 [APP/REVIEW][MVP2]`.

## Stage Boundary

The Billing config, specs, migration, service boundary, and minimal `/account` review surface are MVP2. MVP3 should consume them in a full product journey, but it should not redefine the Billing source-of-truth model.
