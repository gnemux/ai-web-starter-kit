# Payment Engineering Spec

## Ownership

- Linear milestone: `MVP2 扩展底座`
- Parent issue: `GNE-72`
- Child issues: `GNE-192`, `GNE-96`, `GNE-97`, `GNE-98`, `GNE-198`

Real provider decision and validation remain later Payment issues: `GNE-99` and `GNE-100`. AI token package commercialization continues through `GNE-158` after the generic sandbox checkout path exists.

## Affected Areas

- `specs/payment`
- `integrations/payment.md`
- `packages/core/src/providers.ts`
- `packages/core/src/payment.ts`
- `apps/web/lib/providers/server.ts`
- `apps/web/lib/services/payment.ts`
- `apps/web/app/account/payment/*`
- `apps/web/app/api/payment/webhook/route.ts`
- `apps/web/lib/i18n.ts`
- `context/status.md`
- `context/linear.md`

## Architecture

```text
Billing price config in packages/core
-> Payment service in apps/web/lib/services/payment.ts
-> Sandbox Payment Provider in apps/web/lib/providers/server.ts
-> protected review pages under /account/payment
-> result/status surface
-> future trusted webhook/payment facts consumed by Billing
```

Pages must call the service boundary. Pages and components must not import a real payment SDK, write Billing tables directly, or infer entitlement from URL state.

## Sandbox Provider Contract

The sandbox provider:

- uses `PAYMENT_PROVIDER=sandbox`;
- requires no `PAYMENT_SECRET_KEY` and no `PAYMENT_WEBHOOK_SECRET`;
- creates a reviewable checkout session URL under the local app;
- supports success, cancel, and failure result navigation;
- never collects payment data;
- never grants entitlements directly.

`PaymentCheckoutSession.status=created` means the checkout session route exists. It does not mean payment succeeded.

## Checkout Flow

```text
POST server action from /account/payment
-> validate signed-in user and Billing price ID
-> create sandbox checkout session
-> redirect to /account/payment/sandbox
-> reviewer selects success, cancel, or failure
-> /account/payment/result shows navigation status and current Billing facts
```

The service validates sellable prices using `packages/core/src/billing.ts`. Free prices cannot create checkout sessions.

## Webhook And Idempotency Rules

Future real providers must verify raw payload signatures before parsing business facts. MVP2 records the reusable event model and a no-side-effect sandbox webhook route.

Minimum event fields:

- `provider`
- `eventId`
- `eventType`
- `checkoutSessionId`
- `ownerId`
- `priceId`
- `occurredAt`

Idempotency key format:

```text
payment:<provider>:<eventId>
```

Duplicate events must return an already-processed or ignored result and must not grant duplicate subscriptions, orders, entitlements, or credits. Stale events must not overwrite newer trusted subscription facts.

The sandbox webhook route may acknowledge well-formed sandbox events, but it must not write Billing facts. Real provider webhook writes require a later issue, service-role review, signature verification, and tests.

## Data And Billing Boundary

Payment owns checkout sessions and payment events. Billing owns order, subscription, entitlement, credit ledger, and usage ledger facts. A success URL can show a successful navigation state only; Billing changes require trusted server-side processing.

## Security

- No real payment SDK is installed in this pass.
- No real payment key, webhook secret, account identifier, card data, raw webhook payload, or customer data is committed.
- Payment secrets remain server-only and never use `NEXT_PUBLIC_`.
- Sandbox session IDs and result URLs are not authentication or entitlement proofs.

## UI Requirements

- The reviewer surface lives inside the authenticated app shell.
- The UI should be compact, operational, and consistent with Account/Billing surfaces.
- It must show provider mode, selected price, result state, and current Billing status.
- It must show success, cancel, and failure as separate human-verifiable paths.

## Verification

- Run `pnpm typecheck`.
- Run `pnpm lint`.
- Run `pnpm build`.
- Smoke test `/account`, `/account/payment`, `/account/payment/sandbox`, and `/account/payment/result`.
- Run provider boundary searches from `integrations/provider-config-checklist.md`.
- Confirm the result URL does not grant Pro entitlement or AI credits by itself.
