# Payment Product Spec

## Summary

MVP2 Payment establishes a reviewable sandbox checkout path before production payment is selected. It proves where checkout starts, how result states are surfaced, how Payment hands trusted facts to Billing, and how payment analytics and env safety are documented without letting query params or client state grant entitlement. Optional `PAYMENT-08` work may validate a real provider only in test mode through the same provider boundary.

## User

- Primary user: a developer or reviewer validating the commercial starter-kit flow.
- Secondary user: a future product team consuming the Payment boundary from MVP3.

## Problem

Billing defines Free, Plus, Pro, and credit-pack contracts, but reviewers need a visible Payment path to confirm checkout behavior, result states, and the boundary between navigation status and trusted Billing facts.

## Goals

- Provide page-level checkout review paths from Plans and AI into Payment.
- Implement a Sandbox Payment Provider that requires no real SDK, key, live payment mode, or webhook secret.
- Allow an optional Creem test-mode adapter spike after `PAYMENT-07` outputs `Go test mode`, without making Creem the product's only payment path.
- Show success, cancel, and failure result states without granting entitlement from route params.
- Keep Payment logic behind service/provider boundaries instead of scattering checkout behavior across pages.
- Document webhook signature, idempotency, event deduplication, PostHog payment events, and env/secret safety rules before a real provider is added.

## Non-goals

- Do not integrate Stripe, Paddle, Creem, Dodo Payments, Alipay, WeChat Pay, or another real provider as production payment.
- Do not enable live payment, production provider secrets, real user payments, real refunds, reconciliation, invoices, split payments, taxes, or production merchant settlement.
- Do not collect card data, tax data, invoices, refunds, reconciliation, or settlement records.
- Do not grant paid-plan entitlement or AI credits directly from the sandbox success URL.
- Do not grant paid-plan entitlement or AI credits directly from a Creem test success URL before trusted webhook processing exists.
- Do not add payment secrets to `.env.example`, Git, Linear, screenshots, or browser code.

## User Journey

```text
/account/billing or /account/usage
-> Payment review page or direct sandbox checkout
-> start sandbox checkout for Plus, Pro, or AI credit pack
-> sandbox provider page
-> success, cancel, or failure result
-> Billing status remains derived from trusted server-side facts
```

## Requirements

- The Payment review surface must be protected by Auth.
- A reviewer must be able to start checkout for `plus_monthly`, `pro_monthly`, and `ai_credit_pack_100k`.
- The sandbox provider must return a deterministic provider mode and a reviewable session URL.
- The optional Creem adapter must be selected by `PAYMENT_PROVIDER=creem`, require `PAYMENT_MODE=test`, require `PAYMENT_LIVE_ENABLED=false`, and use only server-side secrets.
- The result page must clearly state that the result URL is navigation evidence only.
- Billing status shown after checkout must still come from `apps/web/lib/services/billing.ts`.
- Webhook and idempotency rules must name event IDs, provider IDs, signature boundaries, and duplicate-event behavior.
- PostHog payment events must include shared properties such as `app`, `mvp_stage`, `market`, `env`, `module`, `plan`, and `provider`.
- Payment environment docs must default to `PAYMENT_PROVIDER=sandbox`, `PAYMENT_MODE=sandbox`, and `PAYMENT_LIVE_ENABLED=false`.
- Real provider research/test-mode work is non-blocking and must not be treated as MVP2 production payment.

## Edge States

- Empty: no payment facts exist yet; show sandbox availability and current Billing fallback.
- Loading: server-rendered pages avoid long client loading states in this pass.
- Error: invalid price, missing auth, or service error appears at the Payment service boundary.
- Permission denied: signed-out users are redirected to login before Payment pages render.
- Long content: plan names, provider IDs, and session IDs must wrap or truncate without breaking the app shell.

## Success Metrics

- Activation: reviewer can reach Payment from Account and start sandbox checkout.
- Retention: Payment contract is reusable by MVP3 Product Validation Kit.
- Conversion: future Analytics can attach `checkout_started`, `payment_succeeded`, and failure events to this service path.
- Quality: no client-only result grants entitlement; no payment secret appears in browser code or Git.

## Stage Boundary

- MVP2: Payment foundation, SandboxProvider, payment events, analytics events, env placeholders, security notes, and optional real-provider test-mode spike.
- MVP3: Product Validation Kit can validate Free/Plus/Pro SaaS flow with SandboxProvider. A real Provider adapter may be tested only in test mode with live payment disabled.
- MVP4: overseas/china adapter, env template, mock/test-mode strategy, and launch checklist planning.
- MVP5: production payment readiness for a real vertical product through `GNE-201`.
