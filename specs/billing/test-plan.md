# Billing Test Plan

## GNE-267 Partial Failure

- Same-key reservation prevents a second Provider invocation.
- Active concurrent reservation remains untouched; only a stale lease reconciles.
- Direct reconciliation enforces the lease and usage transitions enforce reserved-state CAS.
- Provider throw/60-second timeout fails safely before lease expiry, emits safe observation, and charges zero.
- Finalize failure remains reserved and reconciliation reuses the credit row.
- Provider output remains deliverable while accounting is pending; pending usage is not effective quota consumption.
- Reservation without credit compensates to failed; DB errors stay errors.
- A completed duplicate returns zero newly consumed Credit.

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
- Plus or Pro user: active/trialing subscription can produce paid entitlements.
- Free / Plus / Pro / AI credit-pack config: `packages/core/src/billing.ts` contains the provider-neutral plan, price, and allowance definitions.
- Specs: `specs/billing/*` documents the domain model, module boundaries, acceptance criteria, and test plan.
- Data model: `supabase/migrations/20260621130735_create_billing_foundation.sql` creates Billing facts and RLS boundaries.
- Service boundary: `apps/web/lib/services/billing.ts` is the app entry for current entitlement snapshots and feature checks.
- Past due: state is visible but should not silently grant new paid consumption unless a later product rule allows grace access.
- Canceled: remains usable only when the current period has not ended.
- Expired/refunded: does not grant paid entitlements.
- Duplicate event: same idempotency key must not create duplicate ledger facts.
- AI usage: failed AI calls should not consume Credit; successful calls should record usage through the ledger boundary.
- Payment success page: navigation alone must not create an entitlement.

## Manual Service Smoke

The Billing reviewer surface lives on `/account/billing`. Reviewers can also inspect `apps/web/lib/services/billing.ts` and confirm:

- `getCurrentBillingEntitlements` reads through the service layer.
- `assertBillingEntitlement` delegates to core entitlement logic.
- `getCurrentBillingActivity` reads recent `billing_orders` and `billing_usage_ledger` rows through the service layer.
- `switchCurrentBillingPlanToFree` records a sandbox-safe Free plan switch without exposing direct table writes to the browser.
- Pages do not query Billing tables directly.

## Page Review Surface

Open the local app and sign in:

```text
http://localhost:3002/account/billing
```

Expected result:

- The account Plans page shows the `套餐` / `Plans` surface.
- The current account falls back to Free when there is no trusted subscription fact.
- Free, Plus, and Pro plan differences and prices are visible on the page.
- Non-AI template access items are shown as included/not included placeholder features, not fake usage counts.
- Plus clearly includes Free content, and Pro clearly includes Plus content.
- AI Credit remains the only plan-card item with concrete numeric allowance and usage-aware remaining values in this template pass.
- The current plan state, renewal date, and actual remaining allowance are shown inside the selected plan card rather than in a separate current-plan summary module.
- Plan-card badges such as `基础`, `推荐`, and `当前套餐` stay on one line and do not split Chinese characters or stretch the card header.
- Current plan cards do not offer a repeat checkout action.
- A paid account can switch back to Free from the Billing page through the protected action.
- Paid plan choices enter the sandbox checkout path rather than pretending to manage a live subscription provider.
- AI credit pack is not shown on the Plans page; it belongs under `/account/usage`.
- Recent plan purchase records are visible or show an empty state.
- `/account/usage` shows the `AI` surface, including available Credit, plan-vs-credit-pack source split, credit-pack top-up, top-up records, and Credit consumption records.
- The page does not show standalone explanatory sections such as purchase guides or template notes.
- The page does not imply that real payment or real AI provider integration is complete.
- This page review surface is tracked by `GNE-197 BILLING-08 [APP/REVIEW][MVP2]`.

## Stage Boundary

The Billing config, specs, migration, service boundary, and minimal `/account/billing` review surface are MVP2. MVP3 should consume them in a full product journey, but it should not redefine the Billing source-of-truth model.
