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

- [x] Adds Free, Plus monthly, Pro monthly, and AI credit-pack examples.
- [x] Keeps provider price IDs nullable/reserved.
- [x] Avoids hard-coding provider price IDs in UI.
- [x] Makes Free / Plus / Pro / AI credit-pack values reviewable in `packages/core/src/billing.ts`.

## GNE-94 Lifecycle

- [x] Documents subscription status behavior for trialing, active, past_due, canceled, expired, and refunded.
- [x] Keeps success URL navigation separate from trusted Billing facts.
- [x] Provides pure lifecycle/entitlement helpers that can be tested without provider SDKs.

## GNE-157 AI Credit Model

- [x] Defines AI Credit as the product-facing unit and credit-pack price shape.
- [x] Includes credit and usage ledger types with idempotency keys.
- [x] Defines that AI must check Billing before calls and record usage after calls.

## GNE-95 Review/Test Boundary

- [x] Test plan covers unpaid/free, paid, past_due, canceled, expired, duplicate events, usage, and credit cases.
- [x] Local TypeScript checks can validate service contracts.
- [x] Local Supabase reset applies the Billing migration successfully.
- [x] `/account/billing` exposes a product-like Plans surface where Free/Plus/Pro plan selection carries the current plan state, included access, prices, and recent plan purchase records.
- [x] `/account/usage` groups available Credit, plan-vs-credit-pack source split, credit-pack top-up, top-up records, and Credit consumption records under the AI entry.
- [x] Checklist maps the Billing config, specs, migration, service boundary, and page surface to reviewer-facing evidence.

## GNE-197 App / Review Surface

- [x] Adds a dedicated Linear task for the account Billing reviewer surface.
- [x] Keeps the page inside the existing app shell conventions with Plans and AI exposed as first-level workspace menu items.
- [x] Reads entitlement state through the Billing service boundary.
- [x] Uses short, action-oriented copy while keeping sandbox/live-payment limits clear and restrained.
- [x] Does not implement real checkout or imply real Payment/AI providers are complete.
- [x] Lets reviewers switch from paid plans back to Free through a protected server action, and switch to paid plans through sandbox checkout.
