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
3. Open `/account`.
4. In the Billing section, click the simulated AI generation action.
5. Verify the action writes committed usage through the backend and the remaining AI token allowance decreases after refresh.
6. Continue using the simulated AI generation action until the remaining allowance is below the per-use cost.
7. Verify the UI blocks the usage, explains the quota decision, and offers upgrade or credit-pack payment instead of silently opening checkout.
8. Start Pro sandbox checkout from the blocked state or the plan action.
9. On `/account/payment/sandbox`, click success.
10. Return to `/account` and verify the current account plan shows Pro because the protected server action wrote trusted sandbox Billing facts.
11. Verify the Pro checkout action is not still shown as a repeat upgrade for the current Pro plan.
12. Use the simulated AI generation action again and verify the Pro allowance is now used by the same backend Billing decision path.
13. Start the AI credit-pack sandbox checkout and click success.
14. Return to `/account` and verify the remaining AI token allowance includes the credit-pack grant.
15. Repeat checkout for cancel and failure and verify neither one upgrades the plan nor grants credits.
16. Open `/account/payment` directly and verify:
   - provider is sandbox;
   - Pro monthly and AI credit pack are visible;
   - current Billing status is still shown from Billing service.
17. On `/account/payment/result`, verify:
   - success is shown as a processed sandbox result;
   - current Billing status becomes Pro because the protected server action wrote trusted sandbox Billing facts.
18. If `NEXT_PUBLIC_POSTHOG_KEY` is configured locally, verify PostHog Activity shows `checkout_started`, `payment_succeeded`, `entitlement_granted`, and `quota_limit_reached` with `module=payment`, `provider=sandbox`, `payment_mode=sandbox`, `plan`, `price_id` when applicable, and no secret/raw payload fields.

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
  "priceId": "pro_monthly",
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
