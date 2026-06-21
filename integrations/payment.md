# Payment Integration

## Purpose

Payment integration supports checkout, orders, subscriptions, entitlement, and conversion measurement.

## Status

Planned for MVP2. The Linear execution source is `GNE-72 MVP2 PAYMENT-00 [PAYMENT] 支付 Provider 与结账闭环`.

Provider matrix and stage boundaries live in `integrations/provider-matrix.md`.

## Strategy

Start with a Sandbox Payment Provider to validate the internal business model before integrating a real provider. Payment does not own entitlement truth; it produces trusted server-side payment events that Billing consumes.

```text
Checkout
-> Payment event
-> Order
-> Subscription
-> Entitlement
```

## MVP Boundaries

- MVP2 defines the Payment provider contract, Sandbox Provider, checkout demo flow, webhook verification, idempotency, first real provider decision, and test-mode real provider validation.
- MVP3 Product Validation Kit uses the Sandbox Provider first for the Free/Pro entitlement loop. Real provider product acceptance is a conditional follow-up under `MVP3-CP-07`, not a blocker for MVP3 core validation.
- MVP4 owns overseas/china real dual-mode provider rollout, including China payment providers, settlement/account readiness, callback domains, refunds, reconciliation, and compliance/deployment differences.

## Candidate Real Providers

- Creem
- Dodo Payments
- Paddle
- Stripe

## Environment Variables

```text
PAYMENT_PROVIDER=sandbox
PAYMENT_WEBHOOK_SECRET=
```

## Rules

- Webhook events must be verified and idempotent.
- Entitlements should be derived from trusted payment events.
- Analytics events are not a payment source of truth.
- Payment tests must include success, failure, duplicate event, and stale event cases.
- Success or cancel pages record user navigation only. They must not directly grant entitlement.
- Real provider secrets and webhook secrets must remain server-only and never use `NEXT_PUBLIC_`.

## Linear Execution Order

```text
GNE-72 MVP2 PAYMENT-00
├── GNE-192 PAYMENT-01 [DOC][MVP2] Define Payment provider boundary and Sandbox contract
├── GNE-96 PAYMENT-02 [DEV][MVP2] Implement Sandbox Payment Provider
├── GNE-97 PAYMENT-03 [DEV][MVP2] Build checkout demo flow
├── GNE-98 PAYMENT-04 [DEV][MVP2] Define webhook signature, idempotency, and event deduplication
├── GNE-99 PAYMENT-05 [DECISION][MVP2] Select the first real payment provider
├── GNE-100 PAYMENT-06 [TEST][MVP2] Verify the real provider test loop
└── GNE-158 PAYMENT-07 [AI][MVP2] Token package, credit top-up, and subscription allowance checkout flow
```
