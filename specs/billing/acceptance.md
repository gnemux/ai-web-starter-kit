# Billing Acceptance

## GNE-91 Domain Model

- [x] Defines plan, price, order, subscription, entitlement, usage, credit, and quota.
- [x] Separates Billing from Payment, AI, and Analytics.
- [x] States that UI must use Billing service/API boundaries instead of page-local subscription rules.
- [x] States that MVP2 owns the Billing source-of-truth model and MVP3 only consumes it through product flows.

## GNE-191 Data Model

- [x] Includes a migration for orders, subscriptions, entitlements, credit ledger, and usage ledger.
- [x] Explains that plans/prices are config-backed for MVP2.
- [x] Includes owner/user association, provider external IDs, status fields, time windows, idempotency keys, and audit timestamps.
- [x] Enables RLS on all exposed Billing tables.
- [x] Keeps writes service-only and user reads owner-only.

## GNE-92 Service Boundary

- [x] Adds a Billing service entry point for current entitlements.
- [x] Adds a reusable entitlement assertion entry point.
- [x] Keeps provider-specific payment details out of the service contract.

## GNE-93 Pricing Config

- [x] Adds Free, Pro monthly, and AI credit-pack examples.
- [x] Keeps provider price IDs nullable/reserved.
- [x] Avoids hard-coding provider price IDs in UI.
- [x] Makes Free / Pro / AI credit-pack values reviewable in `packages/core/src/billing.ts`.

## GNE-94 Lifecycle

- [x] Documents subscription status behavior for trialing, active, past_due, canceled, expired, and refunded.
- [x] Keeps success URL navigation separate from trusted Billing facts.
- [x] Provides pure lifecycle/entitlement helpers that can be tested without provider SDKs.

## GNE-157 AI Credit Model

- [x] Defines AI token feature and credit-pack price shape.
- [x] Includes credit and usage ledger types with idempotency keys.
- [x] Defines that AI must check Billing before calls and record usage after calls.

## GNE-95 Review/Test Boundary

- [x] Test plan covers unpaid/free, paid, past_due, canceled, expired, duplicate events, usage, and credit cases.
- [x] Local TypeScript checks can validate service contracts.
- [x] Local Supabase reset applies the Billing migration successfully.
- [x] `/account` exposes a human-readable Billing review surface showing the current Free fallback, Free/Pro plan differences, and the AI credit-pack reservation.
- [x] Checklist maps the Billing config, specs, migration, service boundary, and page surface to reviewer-facing evidence.

## GNE-197 App / Review Surface

- [x] Adds a dedicated Linear task for the `/account` Billing reviewer surface.
- [x] Keeps the page inside the existing app/account UI conventions.
- [x] Reads entitlement state through the Billing service boundary.
- [x] Does not implement real checkout or imply real Payment/AI providers are complete.
