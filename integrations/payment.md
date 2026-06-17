# Payment Integration

## Purpose

Payment integration supports checkout, orders, subscriptions, entitlement, and conversion measurement.

## Status

Planned.

## Strategy

Start with a Sandbox Payment Provider to validate the internal business model before integrating a real provider.

```text
Checkout
-> Payment event
-> Order
-> Subscription
-> Entitlement
```

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
