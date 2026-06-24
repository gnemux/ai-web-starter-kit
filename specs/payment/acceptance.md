# Payment Acceptance

## Verification Snapshot

Last local verification for the MVP2 Payment release boundary:

- `pnpm test` passed, including `test:ai-safety` and `test:release-boundaries`.
- `pnpm lint` passed.
- `pnpm build` passed.
- Local browser/API smoke passed for login, Payment test-mode copy, forged
  result rejection, forged sandbox rejection, unauthenticated API guards,
  webhook safe errors, and protected Payment deep-link `next` preservation.
- Creem remains a real external adapter in **test mode only**:
  `PAYMENT_PROVIDER=creem`, `PAYMENT_MODE=test`, and
  `PAYMENT_LIVE_ENABLED=false`.
- Live payment, production KYC, real refunds, reconciliation, invoices, taxes,
  disputes, settlement, and real-customer charges remain outside MVP2 and stay
  under `GNE-201`.

## GNE-192 Payment Provider Boundary

- [x] Payment boundaries are documented in `specs/payment/*` and `integrations/payment.md`.
- [x] Payment remains provider-neutral and names sandbox, real provider, and MVP4 dual-mode boundaries.
- [x] Payment does not own final entitlement truth; Billing remains the source for subscription and entitlement status.

## GNE-98 Payment Data Model And Idempotency Boundary

- [x] Payment data model aligns with Billing plans, prices, orders, subscriptions, and entitlements without making Payment the entitlement source of truth.
- [x] `payment_events` can represent provider, event ID, event type, raw payload boundary, processed timestamp, and status.
- [x] Duplicate webhook or event processing cannot create duplicate orders, duplicate entitlements, or duplicate credit grants.
- [x] Signature failure, parse failure, replay, stale event, and out-of-order event behavior is documented before any real provider adapter is enabled.

## GNE-96 Sandbox Payment Provider

- [x] The sandbox provider creates a checkout session without a real SDK or secret.
- [x] The provider descriptor reports `capability=payment`, `provider=sandbox`, and `mode=sandbox`.
- [x] The sandbox provider returns a route-local review URL rather than a real hosted checkout URL.
- [x] Invalid prices and free prices fail at the service boundary.
- [x] Sandbox success is processed by a server action before Billing facts change.

## GNE-97 Checkout Demo Flow

- [x] A signed-in reviewer can open `/account/payment`.
- [x] A signed-in reviewer can start sandbox checkout for Plus monthly and Pro monthly.
- [x] A signed-in reviewer can start sandbox checkout for the AI credit pack.
- [x] The sandbox page can route to success, cancel, and failure result states.

## GNE-198 Page-Level Reviewer Surface

- [x] `/account/usage` exposes a product-like AI Credit surface: a reviewer can see available Credit, the plan-vs-credit-pack source split, top-up entry, top-up records, and Credit consumption records.
- [x] When AI usage exceeds the current Credit allowance, the product flow blocks the action and offers the correct next step: upgrade to the next paid plan when one exists, or top up an AI credit pack when plan upgrade is no longer the right path.
- [x] `/account/billing` and `/account/usage` link to the Payment review surface without making the review page the only way to discover payment.
- [x] `/account/payment` shows provider mode, sellable prices, and current Billing status.
- [x] `/account/payment/sandbox` clearly shows this is a sandbox provider surface.
- [x] `/account/payment/result` shows success, cancel, and failure status while current Billing facts reflect only server-side processing.
- [x] Paid-plan sandbox success updates the current Billing plan on `/account/billing` after refresh.
- [x] Cancel returns to the page that started checkout, records a canceled sandbox payment through the backend path, and does not upgrade the current Billing plan.
- [x] Failure does not upgrade the current Billing plan.
- [x] Once the current account is already on a plan, that same plan is no longer presented as a repeat checkout action.
- [x] The page copy is available in both Chinese and English.

## GNE-104 PostHog Payment Events

- [x] `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, and `entitlement_granted` are emitted at the trusted Payment service boundary.
- [x] `quota_limit_reached` is emitted from a server-side Billing entitlement decision triggered by the usage gate, not faked from a checkout button alone.
- [x] Payment events include `app`, `mvp_stage`, `market`, `env`, `module`, `plan`, and `provider`.
- [x] Payment success/failure events come from trusted server-side state or webhook processing, not only from frontend clicks.
- [x] Analytics is not used as a payment, order, subscription, entitlement, or quota source of truth.
- [x] No card data, provider secret, raw webhook payload, or sensitive payment account data is sent to PostHog.

## GNE-202 Payment Environment And Secret Safety

- [x] `.env.example` or project docs include payment placeholders without real keys.
- [x] `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false` are the default MVP2/MVP3 posture.
- [x] `PAYMENT_PROVIDER_SECRET`, `PAYMENT_SECRET_KEY`, and `PAYMENT_WEBHOOK_SECRET` are server-only and never use `NEXT_PUBLIC_`.
- [x] Real provider test mode uses test keys only.
- [x] Live payment is documented as an MVP5/real-vertical-product production gate, not MVP2 work.

## GNE-100 Creem Test-Mode Spike

- [x] Creem test mode can create hosted checkout sessions for the configured test products.
- [x] A Creem test payment can reach the project webhook endpoint over HTTPS.
- [x] The webhook endpoint verifies Creem test-mode callbacks before writing trusted facts.
- [x] Supabase `payment_events` records provider, event ID, event type, status, and processed state for the Creem callback.
- [x] The AI credit-pack test payment grants Credit through server-side Billing facts, not from a success URL alone.
- [x] PostHog receives server-side `payment_succeeded` and `entitlement_granted` events after trusted processing.
- [x] `/account/usage` reflects the Credit increase after webhook processing.
- [x] The spike remains test-mode only: no live payment, production KYC, real refund, reconciliation, invoice, tax, settlement, dispute, or real-customer payment is approved by MVP2.

## Security Acceptance

- [x] No `NEXT_PUBLIC_` payment secret is added.
- [x] No real payment SDK is installed.
- [x] No real provider key, webhook secret, card data, raw webhook payload, or customer account data is committed.
- [x] Client code does not import `apps/web/lib/providers/server.ts`.
- [x] No live payment, production merchant account, real refund, reconciliation, invoice, split-payment, tax, or settlement behavior is introduced by MVP2.
