# Payment Acceptance

## GNE-192 Payment Provider Boundary

- [ ] Payment boundaries are documented in `specs/payment/*` and `integrations/payment.md`.
- [ ] Payment remains provider-neutral and names sandbox, real provider, and MVP4 dual-mode boundaries.
- [ ] Payment does not own final entitlement truth; Billing remains the source for subscription and entitlement status.

## GNE-98 Payment Data Model And Idempotency Boundary

- [ ] Payment data model aligns with Billing plans, prices, orders, subscriptions, and entitlements without making Payment the entitlement source of truth.
- [ ] `payment_events` can represent provider, event ID, event type, raw payload boundary, processed timestamp, and status.
- [ ] Duplicate webhook or event processing cannot create duplicate orders, duplicate entitlements, or duplicate credit grants.
- [ ] Signature failure, parse failure, replay, stale event, and out-of-order event behavior is documented before any real provider adapter is enabled.

## GNE-96 Sandbox Payment Provider

- [ ] The sandbox provider creates a checkout session without a real SDK or secret.
- [ ] The provider descriptor reports `capability=payment`, `provider=sandbox`, and `mode=sandbox`.
- [ ] The sandbox provider returns a route-local review URL rather than a real hosted checkout URL.
- [ ] Invalid prices and free prices fail at the service boundary.
- [ ] Sandbox success is processed by a server action before Billing facts change.

## GNE-97 Checkout Demo Flow

- [ ] A signed-in reviewer can open `/account/payment`.
- [ ] A signed-in reviewer can start sandbox checkout for Plus monthly and Pro monthly.
- [ ] A signed-in reviewer can start sandbox checkout for the AI credit pack.
- [ ] The sandbox page can route to success, cancel, and failure result states.

## GNE-198 Page-Level Reviewer Surface

- [ ] `/account/usage` exposes a product-like AI Credit surface: a reviewer can see available Credit, the plan-vs-credit-pack source split, top-up entry, top-up records, and Credit consumption records.
- [ ] When AI usage exceeds the current Credit allowance, the product flow blocks the action and offers the correct next step: upgrade to the next paid plan when one exists, or top up an AI credit pack when plan upgrade is no longer the right path.
- [ ] `/account/billing` and `/account/usage` link to the Payment review surface without making the review page the only way to discover payment.
- [ ] `/account/payment` shows provider mode, sellable prices, and current Billing status.
- [ ] `/account/payment/sandbox` clearly shows this is a sandbox provider surface.
- [ ] `/account/payment/result` shows success, cancel, and failure status while current Billing facts reflect only server-side processing.
- [ ] Paid-plan sandbox success updates the current Billing plan on `/account/billing` after refresh.
- [ ] Cancel returns to the page that started checkout, records a canceled sandbox payment through the backend path, and does not upgrade the current Billing plan.
- [ ] Failure does not upgrade the current Billing plan.
- [ ] Once the current account is already on a plan, that same plan is no longer presented as a repeat checkout action.
- [ ] The page copy is available in both Chinese and English.

## GNE-104 PostHog Payment Events

- [ ] `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, and `entitlement_granted` are emitted at the trusted Payment service boundary.
- [ ] `quota_limit_reached` is emitted from a server-side Billing entitlement decision triggered by the usage gate, not faked from a checkout button alone.
- [ ] Payment events include `app`, `mvp_stage`, `market`, `env`, `module`, `plan`, and `provider`.
- [ ] Payment success/failure events come from trusted server-side state or webhook processing, not only from frontend clicks.
- [ ] Analytics is not used as a payment, order, subscription, entitlement, or quota source of truth.
- [ ] No card data, provider secret, raw webhook payload, or sensitive payment account data is sent to PostHog.

## GNE-202 Payment Environment And Secret Safety

- [ ] `.env.example` or project docs include payment placeholders without real keys.
- [ ] `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false` are the default MVP2/MVP3 posture.
- [ ] `PAYMENT_PROVIDER_SECRET`, `PAYMENT_SECRET_KEY`, and `PAYMENT_WEBHOOK_SECRET` are server-only and never use `NEXT_PUBLIC_`.
- [ ] Real provider test mode uses test keys only.
- [ ] Live payment is documented as an MVP5/real-vertical-product production gate, not MVP2 work.

## Security Acceptance

- [ ] No `NEXT_PUBLIC_` payment secret is added.
- [ ] No real payment SDK is installed.
- [ ] No real provider key, webhook secret, card data, raw webhook payload, or customer account data is committed.
- [ ] Client code does not import `apps/web/lib/providers/server.ts`.
- [ ] No live payment, production merchant account, real refund, reconciliation, invoice, split-payment, tax, or settlement behavior is introduced by MVP2.
