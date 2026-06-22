# Payment Engineering Spec

## Ownership

- Linear milestone: `MVP2 扩展底座`
- Parent issue: `GNE-72`
- Mainline child issues: `GNE-192`, `GNE-98`, `GNE-96`, `GNE-97`, `GNE-198`, `GNE-104`, `GNE-202`
- Optional research/spike issues: `GNE-99`, `GNE-100`

`GNE-99 PAYMENT-07` is a human research checklist, not a code task: verify whether a real Provider such as Creem can support the team's account, product, test mode, webhook, payout, and risk requirements. `GNE-100 PAYMENT-08` is a test-mode-only technical spike after `GNE-99` outputs `Go test mode`. Neither issue permits live payment, production keys, or real user charges. Use `GNE-194` only when MVP3 needs productized test-mode validation, and use `GNE-201` for production payment readiness. AI credit-pack commercialization moved to `GNE-158 MVP3-CP-09` and must use SandboxProvider unless a later production-payment gate is satisfied.

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
-> sandbox server action or future webhook writes trusted Billing facts
```

Pages must call the service boundary. Pages and components must not import a real payment SDK, write Billing tables directly, or infer entitlement from URL state.

MVP2 must not introduce live payment, production provider secrets, real user payments, real refunds, reconciliation, invoices, split payments, taxes, or production merchant settlement. Production payment readiness belongs to `GNE-201 MVP5 PAYMENT-00`.

## Sandbox Provider Contract

The sandbox provider:

- uses `PAYMENT_PROVIDER=sandbox`;
- uses `PAYMENT_MODE=sandbox`;
- keeps `PAYMENT_LIVE_ENABLED=false`;
- requires no `PAYMENT_SECRET_KEY` and no `PAYMENT_WEBHOOK_SECRET`;
- creates a reviewable checkout session URL under the local app;
- supports success, cancel, and failure result navigation;
- never collects payment data;
- never grants entitlements from URL state or client-only state.

`PaymentCheckoutSession.status=created` means the checkout session route exists. It does not mean payment succeeded.

## Checkout Flow

```text
POST server action from /account/payment
-> validate signed-in user and Billing price ID
-> create sandbox checkout session
-> redirect to /account/payment/sandbox
-> reviewer submits success, cancel, or failure
-> server action records sandbox Billing facts
-> /account/payment/result shows result status and current Billing facts
```

The service validates sellable prices using `packages/core/src/billing.ts`. Free prices cannot create checkout sessions.

Checkout entry points must follow the project return context contract in
`context/codex-rules.md`. In practice:

- a plain `/account/billing` plan upgrade returns to `/account/billing` on cancel or failure;
- an AI credit-pack entry from `/account/usage` returns to `/account/usage` on cancel or failure;
- a quota/paywall-blocked `/account/usage` entry returns to the same blocked AI context on cancel or failure;
- cancel and failure must not grant entitlement, must not clear the relevant pre-checkout state, and must not create a blocked state when the user did not enter from one;
- success may return to Account or a result page after the protected server action writes trusted Billing facts.

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

The sandbox UI result action may write Billing facts through a server-only admin client so reviewers can verify paid-plan changes and AI credit-pack grants locally. The sandbox webhook route remains no-side-effect and only acknowledges the event model. Real provider webhook writes require a later issue, real signature verification, provider-specific tests, and deployment-secret review.

## Data And Billing Boundary

Payment owns checkout sessions and payment events. Billing owns order, subscription, entitlement, credit ledger, and usage ledger facts. A success URL can show a successful navigation state only; Billing changes require trusted server-side processing. In MVP2 sandbox, the trusted processing path is the protected sandbox server action, not the result URL.

## Security

- No real payment SDK is installed in this pass.
- No real payment key, webhook secret, account identifier, card data, raw webhook payload, or customer data is committed.
- Payment secrets remain server-only and never use `NEXT_PUBLIC_`.
- Sandbox session IDs and result URLs are not authentication or entitlement proofs.
- `.env.example` may contain payment placeholders only; real provider keys, webhook secrets, service-role keys, and screenshots containing secrets must not enter Git, Linear, README, PR text, or browser-visible code.
- Real provider adapters before MVP5 are test-mode only and must keep live payment disabled.
- `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false` are the default MVP2/MVP3 posture.
- `PAYMENT_PROVIDER_SECRET`, `PAYMENT_SECRET_KEY`, and `PAYMENT_WEBHOOK_SECRET` are server-only placeholders. They must never use `NEXT_PUBLIC_`.

## Analytics Events

Payment event implementation is tracked by `GNE-104 PAYMENT-05`.

Minimum events:

- `checkout_started`: emitted after the Payment service successfully creates a sandbox checkout session.
- `payment_succeeded`: emitted after the protected sandbox server action writes trusted Billing facts for a success result.
- `payment_failed`: emitted after the protected sandbox server action writes trusted Billing facts for a failure result.
- `payment_canceled`: emitted after the protected sandbox server action writes trusted Billing facts for a cancel result.
- `entitlement_granted`: emitted after the protected sandbox server action processes a success result for a subscription or credit-pack entitlement.
- `quota_limit_reached`: emitted from the Payment review quota gate after a server-side Billing entitlement decision blocks a placeholder access item. Do not emit it from a checkout button alone.

Minimum shared properties:

- `app`
- `mvp_stage`
- `market`
- `env`
- `module`
- `plan`
- `provider`

Analytics events observe the funnel only. They are not order, subscription, entitlement, quota, or payment-status facts.

Server-side analytics uses the public PostHog project key and safe product/payment properties only. Capture failures must not block checkout, Billing updates, or entitlement processing.

## UI Requirements

- The reviewer surface lives inside the authenticated app shell.
- The UI should be compact, operational, and consistent with Account/Billing surfaces.
- It must show provider mode, selected price, result state, and current Billing status.
- It must show success, cancel, and failure as separate human-verifiable paths.

## Verification

- Run `pnpm typecheck`.
- Run `pnpm lint`.
- Run `pnpm build`.
- Smoke test `/account`, `/account/billing`, `/account/usage`, `/account/payment`, `/account/payment/sandbox`, and `/account/payment/result`.
- Run provider boundary searches from `integrations/provider-config-checklist.md`.
- Confirm the result URL does not grant paid-plan entitlement or AI credits by itself.
