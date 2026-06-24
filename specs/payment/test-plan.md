# Payment Test Plan

## Static Checks

Run from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Provider boundary checks:

```bash
rg -n "@/lib/providers/server|lib/providers/server|from \"\\.\\/providers\\/server\"|from \"\\.\\.\\/providers\\/server\"" apps/web/app apps/web/components apps/web/lib
rg -n "stripe|paddle|creem|dodo|alipay|wechat" packages/core/src apps/web/lib/providers apps/web/app
rg -n "^NEXT_PUBLIC_.*(PAYMENT|WEBHOOK).*(KEY|SECRET|TOKEN)" .env.example context integrations specs apps packages
rg -n "PAYMENT_PROVIDER|PAYMENT_MODE|PAYMENT_LIVE_ENABLED|PAYMENT_PROVIDER_SECRET|PAYMENT_SECRET_KEY|PAYMENT_WEBHOOK_SECRET" .env.example integrations specs apps/web/lib/providers
```

Expected:

- Server-only provider imports appear only in server-side service or route files.
- No real payment SDK imports are introduced; optional provider spikes use server-side REST adapters.
- Payment secrets are never public browser variables.
- Payment env placeholders exist and keep sandbox/test/live mode separate from provider secrets.

## Manual Local Smoke

1. Start the local web app.
2. Sign in with a test account.
3. Open `/account/usage`.
4. Verify the AI page shows available Credit, plan Credit, credit-pack Credit, a credit-pack top-up entry, top-up records, and Credit consumption records.
5. Start the AI credit-pack sandbox checkout from `/account/usage`.
6. On `/account/payment/sandbox`, click success.
7. Return to `/account/usage` and verify the remaining Credit includes the credit-pack grant and the top-up record appears.
8. Repeat credit-pack checkout for cancel and failure and verify neither one grants credits.
9. Open `/account/billing`.
10. Start Plus or Pro sandbox checkout from the plan action.
11. On `/account/payment/sandbox`, click success.
12. Return to `/account/billing` and verify the current account plan shows the selected paid plan because the protected server action wrote trusted sandbox Billing facts.
13. Verify the selected plan checkout action is not still shown as a repeat upgrade for the current plan.
14. If a gated AI product action is available in the current build, use it until Credit is blocked and verify the product flow offers upgrade or credit-pack payment instead of silently opening checkout.
15. Open `/account/payment` directly and verify:
   - provider is sandbox;
   - Plus monthly, Pro monthly, and AI credit pack are visible;
   - current Billing status is still shown from Billing service.
16. On `/account/payment/result`, verify:
   - success is shown as a processed sandbox result;
   - current Billing status becomes the selected paid plan because the protected server action wrote trusted sandbox Billing facts.
17. If `NEXT_PUBLIC_POSTHOG_KEY` is configured locally, verify PostHog Activity shows `checkout_started`, `payment_succeeded`, `entitlement_granted`, and `quota_limit_reached` when a gated usage action triggers it, with `module=payment`, `provider=sandbox`, `payment_mode=sandbox`, `plan`, `price_id` when applicable, and no secret/raw payload fields.

## Creem Test-Mode Spike Smoke

This applies only to `GNE-100 PAYMENT-08` after `GNE-99` outputs `Go test mode`.

1. Keep Creem dashboard in test mode.
2. Set ignored local env to `PAYMENT_PROVIDER=creem`, `PAYMENT_MODE=test`, and `PAYMENT_LIVE_ENABLED=false`.
3. Put the Creem test API key only in ignored local env as `PAYMENT_PROVIDER_SECRET`; do not paste it into Git, Linear, screenshots, or chat.
4. Set the Creem test product IDs: `CREEM_PLUS_MONTHLY_PRODUCT_ID`, `CREEM_PRO_MONTHLY_PRODUCT_ID`, and `CREEM_AI_CREDIT_PACK_100K_PRODUCT_ID`.
5. Set `CREEM_CHECKOUT_SUCCESS_URL` to an HTTPS result URL.
6. Run `pnpm payment:creem:test-checkout -- pro_monthly`. Optional follow-up checks may use `plus_monthly` and `ai_credit_pack_100k`.
7. Open the returned checkout URL and complete payment with a Creem test card.
8. Verify Creem test dashboard shows the corresponding checkout/payment/subscription record.
9. Verify the app does not grant Pro entitlement or AI credits from the Creem success URL alone; trusted provider grants must come from `/api/payment/webhook`.
10. For app-created Creem checkout, verify the checkout request includes server-generated metadata (`referenceId`, `owner_id`, `price_id`, `plan_id`) so webhook processing can map the event to a Billing owner and price. Older script-only checkouts without owner metadata are dashboard evidence only and should not grant app entitlement.

Latest verified result on 2026-06-23:

- Creem test checkout completed a test payment.
- Creem test webhook delivery to `/api/payment/webhook` returned HTTP `200`.
- Supabase `payment_events` stored the Creem `checkout.completed` event with `status=processed`.
- Billing granted the AI credit pack through server-side facts.
- PostHog showed server-side `payment_succeeded` and `entitlement_granted`.
- `/account/usage` showed the Credit increase after processing.
- This verifies test mode only; production payment readiness remains outside MVP2.

## Webhook Smoke

For MVP2 sandbox, webhook checks are no-side-effect contract checks only because the local reviewer flow writes Billing facts through a protected server action. For Creem `GNE-100`, webhook checks are trusted provider checks and must verify signatures before writing Billing facts.

Example local request shape:

```json
{
  "provider": "sandbox",
  "eventId": "sandbox-event-001",
  "eventType": "checkout.completed",
  "checkoutSessionId": "sandbox-checkout-example",
  "ownerId": "review-user",
  "priceId": "plus_monthly",
  "occurredAt": "2026-06-22T00:00:00.000Z"
}
```

Expected response:

- acknowledges the sandbox event model;
- returns the derived idempotency key;
- does not write order, subscription, entitlement, credit, or usage facts.

Creem test-mode webhook setup:

1. Create a Creem test webhook in `Developers -> API and Webhooks -> Webhook`.
2. Use a public HTTPS endpoint:
   - local tunnel: `https://<your-ngrok-or-cloudflared-domain>/api/payment/webhook`;
   - controlled deployed test target: `https://<vercel-preview-or-test-domain>/api/payment/webhook`.
3. Copy the Creem webhook signing secret into ignored server env as `PAYMENT_WEBHOOK_SECRET`.
4. Keep `PAYMENT_PROVIDER=creem`, `PAYMENT_MODE=test`, and `PAYMENT_LIVE_ENABLED=false`.
5. Select at least `checkout.completed`; selecting all test events is acceptable, but only `checkout.completed` grants Billing facts in MVP2.
6. Create checkout from the app, not only from the standalone script, so metadata maps the event to `owner_id` and `price_id`.
7. Complete a test payment and verify:
   - `payment_events` has provider `creem`, event id, event type, status, raw payload, processed timestamp, and idempotency key;
   - `billing_orders` has provider `creem`, the Creem order/checkout id, and status `paid`;
   - subscription purchases update `billing_subscriptions` and active entitlements;
   - AI credit-pack purchases add `billing_entitlements` and `billing_credit_ledger` credit grants;
   - PostHog receives `payment_succeeded` and `entitlement_granted` with `provider=creem` and `payment_mode=test`.
8. Resend the same webhook event from Creem if available and verify duplicate delivery does not create duplicate orders, subscriptions, entitlements, or credit grants.
9. Remove or change the signature secret and verify the endpoint returns a signature error and does not write Billing facts.

## Production / Preview Notes

- Vercel Production and Preview must set `PAYMENT_PROVIDER=sandbox` separately until a real provider is selected.
- `PAYMENT_SECRET_KEY` and `PAYMENT_WEBHOOK_SECRET` may stay blank for sandbox.
- `PAYMENT_PROVIDER_SECRET` may stay blank for sandbox.
- `PAYMENT_PROVIDER=creem` is allowed only in controlled test-mode environments with `PAYMENT_MODE=test` and `PAYMENT_LIVE_ENABLED=false`.
- `PAYMENT_LIVE_ENABLED=false` must remain set until the MVP5 production-payment gate.
- Redeploy after changing provider env entries before using a deployment as evidence.
