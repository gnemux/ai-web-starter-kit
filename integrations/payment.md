# Payment Integration

## Purpose

Payment integration supports checkout, orders, subscriptions, entitlement, and conversion measurement.

## Status

MVP2 sandbox foundation is implemented for `GNE-192`, `GNE-98`, `GNE-96`, `GNE-97`, and `GNE-198`. The Linear execution source is `GNE-72 MVP2 PAYMENT-00 [PAYMENT] 支付底座与真实 Provider 验证边界`.

Current Payment issue tree:

```text
GNE-72 MVP2 PAYMENT-00
├── GNE-192 PAYMENT-01 [DOC][MVP2] 支付模块范围、订单模型和 Provider 架构
├── GNE-98 PAYMENT-02 [DATA][MVP2] 建立支付数据模型与 payment_events 幂等边界
├── GNE-96 PAYMENT-03 [DEV][MVP2] 实现 PaymentProvider interface 和 SandboxProvider
├── GNE-97 PAYMENT-04 [DEV][MVP2] 实现 checkout / webhook / entitlement 最小闭环
├── GNE-198 PAYMENT-04R [APP/REVIEW][MVP2] Sandbox checkout 与支付结果人工验收页
├── GNE-104 PAYMENT-05 [ANALYTICS][MVP2] 接入 PostHog 支付事件
├── GNE-202 PAYMENT-06 [DOC][MVP2] 补充 .env.example 和支付安全说明
├── GNE-99 PAYMENT-07 [RESEARCH][MVP2 可选] 真实支付 Provider 人工验证清单（Done）
└── GNE-100 PAYMENT-08 [SPIKE][MVP2] Creem test checkout 与 webhook 技术打样（In Progress）
```

`PAYMENT-01..06` plus `PAYMENT-04R` are the MVP2 Payment mainline. `PAYMENT-07/08` are optional research/spike work and must not be treated as live payment implementation. Creem has produced `Go test mode` under `GNE-99`, so `GNE-100` now proceeds as a Creem test-mode-only technical spike. Its MVP2 scope includes test checkout, test dashboard evidence, test webhook delivery, signature/idempotency/event-field verification, env boundary checks, and safe PostHog observability. Use `GNE-194` later for MVP3 productized test-mode validation and `GNE-201` for production payment readiness.

For Creem manual verification under `GNE-99`, use `integrations/payment-creem-research.md` as the Chinese research record. Creem is currently approved only for `Go test mode`: test API key, test checkout, and test webhook mapping are allowed; production KYC/live payment remains blocked until a real vertical product, policy pages, support/refund terms, and production-payment readiness are defined. Never paste secrets, identity documents, bank details, or full sensitive dashboard screenshots into Linear, Git, README, or browser-visible code.

For the `GNE-100` Creem test-mode spike, set local ignored env to `PAYMENT_PROVIDER=creem`, `PAYMENT_MODE=test`, and `PAYMENT_LIVE_ENABLED=false`. Creem is integrated as a replaceable PaymentProvider adapter, not as a replacement for Billing or trusted entitlement facts. Use `pnpm payment:creem:test-checkout -- pro_monthly` or the app checkout entry to create a Creem test checkout; optional follow-up checks can use `plus_monthly` and `ai_credit_pack_100k`. The adapter requires a server-only Creem test key, Creem product IDs for the selected test price, and an HTTPS `CREEM_CHECKOUT_SUCCESS_URL`, and prints only a redacted checkout summary. The acceptance target is not just an API response: the returned checkout URL must open, a test card payment must complete, and Creem test mode dashboard must show the corresponding test payment / checkout / subscription record. Webhook test scenes are also in scope for `GNE-100`: configure a public HTTPS test endpoint or controlled preview/ngrok endpoint, validate signature and event id/idempotency, record safe event fields, and confirm duplicate/failed events do not grant entitlement.

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

- MVP2 defines the Payment provider contract, SandboxProvider, checkout demo flow, webhook/event idempotency, PostHog payment events, env placeholders, and payment security notes. MVP2 does **not** do live payment, production secrets, real user payments, real refunds, reconciliation, invoices, split payments, taxes, or production merchant settlement.
- MVP3 Product Validation Kit uses the SandboxProvider first for the Free/Plus/Pro entitlement loop. `GNE-194` can validate a real Provider adapter in test mode only, with live payment disabled.
- MVP4 owns overseas/china adapter, env template, mock/test-mode strategy, and launch checklist planning. MVP4 is not the production payment go-live stage.
- MVP5 or a real vertical product owns production payment readiness through `GNE-201 MVP5 PAYMENT-00 [PAYMENT] 真实垂直产品生产支付准入`.

## Reviewer Surface

Payment work must expose a page-level path that a teammate can test without reading implementation details:

```text
account usage entry
-> use a gated product action
-> quota decision
-> plan switch or credit-pack prompt
-> checkout started
-> success / cancel / failure result
-> order / subscription / entitlement status
```

The reviewer should not have to discover payment through a standalone manual checkout page. `/account/billing` exposes the product-like plan path: choose Free/Plus/Pro, review the current plan state, and inspect recent plan purchase records. `/account/usage` groups AI-related payment paths: show available Credit, show how much remaining Credit comes from the plan versus credit packs, top up an AI credit pack, and inspect top-up and Credit consumption records. The Payment review page remains available for inspecting provider mode and sellable sandbox prices, but it is not the primary product logic.

The result page is a status surface only. It must not grant entitlement directly from query params, route state, or client-only state. Entitlement changes must come from trusted server-side Payment/Billing facts. In the MVP2 sandbox flow, the trusted write happens in a protected server action before redirecting to the result page.

The dedicated Linear task for this surface is `GNE-198 PAYMENT-04R [APP/REVIEW][MVP2]`. Run it after SandboxProvider, checkout flow, and webhook/status facts are usable.

UI must follow the app-shell conventions instead of a marketing landing-page style. Frontend pages call service/API boundaries and never import payment SDKs, write Billing facts directly, or infer entitlement from route params.

Current MVP2 routes:

| Route | Purpose | Entitlement behavior |
| --- | --- | --- |
| `/account` | Profile settings entry point. | Shows and updates the signed-in user's account profile; it does not grant Billing entitlement. |
| `/account/billing` | Product-like Plans entry point. | Reads current Billing facts, switches to Free through a protected action, starts paid-plan checkout through the Payment service, and shows recent plan records. |
| `/account/usage` | Product-like AI usage and credit entry point. | Reads current Billing facts, writes usage through a protected server action, offers AI credit-pack checkout, and prompts payment only after quota is blocked. |
| `/account/payment` | Protected Payment review page with sellable sandbox prices. | Starts checkout through `apps/web/lib/services/payment.ts`. |
| `/account/payment/sandbox` | In-app Sandbox Provider surface. | Lets reviewers submit success, cancel, or failure through a server action. |
| `/account/payment/result` | Result status page. | Shows result status and current Billing facts; URL state never grants entitlement directly. |
| `/api/payment/webhook` | Payment webhook endpoint for sandbox event-shape acknowledgement and Creem test-mode callbacks. | Sandbox payloads return an idempotency key and write no Billing facts. Creem test-mode payloads must pass `creem-signature` HMAC verification; `checkout.completed` can write trusted order/subscription/entitlement facts, while subscription/refund/dispute lifecycle events are recorded and ignored in MVP2. |

## Candidate Real Providers

- Creem
- Dodo Payments
- Paddle
- Alipay
- WeChat Pay

These are candidates for research/test-mode validation only until `GNE-201` production-payment readiness is satisfied.

## Environment Variables

```text
PAYMENT_PROVIDER=sandbox
PAYMENT_MODE=sandbox
PAYMENT_LIVE_ENABLED=false
PAYMENT_SECRET_KEY=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

`PAYMENT_PROVIDER` and `PAYMENT_MODE` are non-secret server-side selectors. `PAYMENT_LIVE_ENABLED=false` is the default for MVP2 and MVP3. `PAYMENT_SECRET_KEY`, `PAYMENT_PROVIDER_SECRET`, and `PAYMENT_WEBHOOK_SECRET` are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Webhook events must be verified and idempotent.
- Entitlements should be derived from trusted payment events.
- Analytics events are not a payment source of truth.
- Payment tests must include success, failure, duplicate event, and stale event cases.
- Success or cancel pages record user navigation only. They must not directly grant entitlement.
- Sandbox success must update Billing through the protected server action so reviewers can verify paid-plan changes locally.
- The sandbox webhook branch is no-side-effect and only acknowledges the MVP2 event model.
- Creem test-mode webhook processing is allowed only when `PAYMENT_PROVIDER=creem`, `PAYMENT_MODE=test`, `PAYMENT_LIVE_ENABLED=false`, and `PAYMENT_WEBHOOK_SECRET` are configured. It verifies the raw request body against `creem-signature` before parsing trusted facts.
- Creem `checkout.completed` is the only MVP2 provider webhook event that grants Billing facts. `subscription.*`, `refund.created`, and `dispute.created` events are recorded in `payment_events` and ignored until their lifecycle handling is explicitly modeled.
- PostHog payment events must include shared properties such as `app`, `mvp_stage`, `market`, `env`, `module`, `plan`, and `provider`; analytics is not a payment source of truth.
- `checkout_started`, `payment_succeeded`, `payment_failed`, `payment_canceled`, `entitlement_granted`, and `quota_limit_reached` are emitted from server-side Payment service boundaries in MVP2. The quota event must come from the Billing entitlement decision path behind a gated usage action, not from a generic checkout button.
- Real provider secrets and webhook secrets must remain server-only and never use `NEXT_PUBLIC_`.
- Real Provider work in MVP2/MVP3 is research/test-mode only; production payment belongs to `GNE-201` or later.
- Product code should call a local Payment service/provider adapter instead of importing a real provider SDK in pages or components.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing Payment env keys before verifying checkout or webhook behavior.

## Linear Execution Order

```text
GNE-72 MVP2 PAYMENT-00
├── GNE-192 PAYMENT-01 [DOC][MVP2] Payment module scope, order model, and Provider architecture (Done in repo)
├── GNE-98 PAYMENT-02 [DATA][MVP2] Payment data model and payment_events idempotency boundary (Done in repo)
├── GNE-96 PAYMENT-03 [DEV][MVP2] PaymentProvider interface and SandboxProvider (Done in repo)
├── GNE-97 PAYMENT-04 [DEV][MVP2] checkout / webhook / entitlement minimum loop (Done in repo)
├── GNE-198 PAYMENT-04R [APP/REVIEW][MVP2] Sandbox checkout and payment result review surface (Done in repo)
├── GNE-104 PAYMENT-05 [ANALYTICS][MVP2] PostHog payment events
├── GNE-202 PAYMENT-06 [DOC][MVP2] .env.example and payment security notes
├── GNE-99 PAYMENT-07 [RESEARCH][MVP2 optional] real Provider manual verification
└── GNE-100 PAYMENT-08 [SPIKE][MVP2] Creem test checkout and webhook technical spike
```

MVP3 follow-ups:

```text
GNE-194 MVP3-CP-07 [PAYMENT][TEST MODE] real Provider test-mode adapter validation
GNE-158 MVP3-CP-09 [PAYMENT/AI] AI credit pack sandbox validation
```

Do not merge `GNE-100` and `GNE-194`. `GNE-100` is the MVP2 technical spike for Creem checkout/webhook feasibility. `GNE-194` is the later MVP3 productized validation that consumes the technical evidence inside Product Validation Kit. Missing low-level adapter/webhook evidence belongs back in `GNE-100`.

MVP5 production gate:

```text
GNE-201 MVP5 PAYMENT-00 [PAYMENT] 真实垂直产品生产支付准入
```
