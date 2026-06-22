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
- No real payment SDK imports are introduced.
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

## Webhook Smoke

For MVP2 sandbox, webhook checks are no-side-effect contract checks only because the local reviewer flow writes Billing facts through a protected server action. A future real provider issue must add signature verification tests before writing Billing facts from webhooks.

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

## Production / Preview Notes

- Vercel Production and Preview must set `PAYMENT_PROVIDER=sandbox` separately until a real provider is selected.
- `PAYMENT_SECRET_KEY` and `PAYMENT_WEBHOOK_SECRET` may stay blank for sandbox.
- `PAYMENT_PROVIDER_SECRET` may stay blank for sandbox.
- `PAYMENT_LIVE_ENABLED=false` must remain set until the MVP5 production-payment gate.
- Redeploy after changing provider env entries before using a deployment as evidence.
