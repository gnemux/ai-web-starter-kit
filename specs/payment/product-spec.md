# Payment Product Spec

## Summary

MVP2 Payment establishes a reviewable sandbox checkout path for paid plans and credit packs before any real payment provider is selected. It proves where checkout starts, how result states are surfaced, and how Payment hands trusted facts to Billing without letting query params or client state grant entitlement.

## User

- Primary user: a developer or reviewer validating the commercial starter-kit flow.
- Secondary user: a future product team consuming the Payment boundary from MVP3.

## Problem

Billing defines Free, Pro, and credit-pack contracts, but reviewers need a visible Payment path to confirm checkout behavior, result states, and the boundary between navigation status and trusted Billing facts.

## Goals

- Provide a page-level checkout review path from Account or Billing into Payment.
- Implement a Sandbox Payment Provider that requires no real SDK, key, or webhook secret.
- Show success, cancel, and failure result states without granting entitlement from route params.
- Keep Payment logic behind service/provider boundaries instead of scattering checkout behavior across pages.
- Document webhook signature, idempotency, and event deduplication rules before a real provider is added.

## Non-goals

- Do not integrate Stripe, Paddle, Creem, Dodo Payments, Alipay, WeChat Pay, or another real provider.
- Do not collect card data, tax data, invoices, refunds, reconciliation, or settlement records.
- Do not grant Pro entitlement or AI credits directly from the sandbox success URL.
- Do not add payment secrets to `.env.example`, Git, Linear, screenshots, or browser code.

## User Journey

```text
/account Billing review
-> Payment review page
-> start sandbox checkout for Pro or AI credit pack
-> sandbox provider page
-> success, cancel, or failure result
-> Billing status remains derived from trusted server-side facts
```

## Requirements

- The Payment review surface must be protected by Auth.
- A reviewer must be able to start checkout for `pro_monthly` and `ai_credit_pack_100k`.
- The sandbox provider must return a deterministic provider mode and a reviewable session URL.
- The result page must clearly state that the result URL is navigation evidence only.
- Billing status shown after checkout must still come from `apps/web/lib/services/billing.ts`.
- Webhook and idempotency rules must name event IDs, provider IDs, signature boundaries, and duplicate-event behavior.

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
