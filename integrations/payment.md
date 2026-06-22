# Payment Integration

## Purpose

Payment integration supports checkout, orders, subscriptions, entitlement, and conversion measurement.

## Status

MVP2 sandbox foundation is implemented for `GNE-192`, `GNE-96`, `GNE-97`, `GNE-98`, and `GNE-198`. The Linear execution source is `GNE-72 MVP2 PAYMENT-00 [PAYMENT] 支付 Provider 与结账闭环`.

Provider matrix and stage boundaries live in `integrations/provider-matrix.md`.

Provider adapter boundary:

- GNE-181 defines provider-neutral Payment contract types in `packages/core/src/providers.ts`.
- The MVP2 sandbox adapter landing point is `apps/web/lib/providers/server.ts`.
- The MVP2 payment service is `apps/web/lib/services/payment.ts`.
- The human reviewer surface is `/account/payment`, with sandbox checkout and result routes below it.
- No real payment SDK, webhook secret, or checkout provider credential is introduced by MVP2 sandbox work.

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

## Reviewer Surface

Payment work must expose a page-level path that a teammate can test without reading implementation details:

```text
pricing or billing entry
-> checkout started
-> success / cancel / failure result
-> order / subscription / entitlement status
```

The result page is a status surface only. It must not grant entitlement directly from query params, route state, or client-only state. Entitlement changes must come from trusted server-side Payment/Billing facts, and the UI should show pending, failed, or already-processed states clearly.

The dedicated Linear task for this surface is `GNE-198 PAYMENT-08 [APP/REVIEW][MVP2]`. Run it after Sandbox Provider, checkout flow, and webhook/status facts are usable, and before real provider test closure.

UI must follow the app-shell conventions instead of a marketing landing-page style. Frontend pages call service/API boundaries and never import payment SDKs, write Billing facts directly, or infer entitlement from route params.

Current MVP2 routes:

| Route | Purpose | Entitlement behavior |
| --- | --- | --- |
| `/account` | Billing entry point with link to Payment review. | Reads current Billing facts only. |
| `/account/payment` | Protected Payment review page with sellable sandbox prices. | Starts checkout through `apps/web/lib/services/payment.ts`. |
| `/account/payment/sandbox` | In-app Sandbox Provider surface. | Lets reviewers choose success, cancel, or failure. |
| `/account/payment/result` | Result status page. | Shows navigation status only; never grants entitlement directly. |
| `/api/payment/webhook` | Sandbox webhook event-shape acknowledgement. | Returns idempotency key and writes no Billing facts. |

## Candidate Real Providers

- Creem
- Dodo Payments
- Paddle
- Stripe

## Environment Variables

```text
PAYMENT_PROVIDER=sandbox
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

`PAYMENT_PROVIDER` is a non-secret server-side selector. `PAYMENT_SECRET_KEY` and `PAYMENT_WEBHOOK_SECRET` are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Webhook events must be verified and idempotent.
- Entitlements should be derived from trusted payment events.
- Analytics events are not a payment source of truth.
- Payment tests must include success, failure, duplicate event, and stale event cases.
- Success or cancel pages record user navigation only. They must not directly grant entitlement.
- The sandbox webhook route is no-side-effect and only acknowledges the MVP2 event model.
- Real provider secrets and webhook secrets must remain server-only and never use `NEXT_PUBLIC_`.
- Product code should call a local Payment service/provider adapter instead of importing a real provider SDK in pages or components.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing Payment env keys before verifying checkout or webhook behavior.

## Linear Execution Order

```text
GNE-72 MVP2 PAYMENT-00
├── GNE-192 PAYMENT-01 [DOC][MVP2] Define Payment provider boundary and Sandbox contract (Done in repo)
├── GNE-96 PAYMENT-02 [DEV][MVP2] Implement Sandbox Payment Provider (Done in repo)
├── GNE-97 PAYMENT-03 [DEV][MVP2] Build checkout demo flow (Done in repo)
├── GNE-98 PAYMENT-04 [DEV][MVP2] Define webhook signature, idempotency, and event deduplication (Done in repo)
├── GNE-198 PAYMENT-08 [APP/REVIEW][MVP2] Build checkout and payment result review pages (Done in repo)
├── GNE-99 PAYMENT-05 [DECISION][MVP2] Select the first real payment provider
├── GNE-100 PAYMENT-06 [TEST][MVP2] Verify the real provider test loop
└── GNE-158 PAYMENT-07 [AI][MVP2] Token package, credit top-up, and subscription allowance checkout flow
```
