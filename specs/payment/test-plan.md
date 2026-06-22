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
```

Expected:

- Server-only provider imports appear only in server-side service or route files.
- No real payment SDK imports are introduced.
- Payment secrets are never public browser variables.

## Manual Local Smoke

1. Start the local web app.
2. Sign in with a test account.
3. Open `/account`.
4. Click the Payment review action.
5. On `/account/payment`, verify:
   - provider is sandbox;
   - Pro monthly and AI credit pack are visible;
   - current Billing status is still shown from Billing service.
6. Start Pro sandbox checkout.
7. On `/account/payment/sandbox`, click success.
8. On `/account/payment/result`, verify:
   - success is shown as navigation status only;
   - current Billing status does not become Pro merely because the URL says success.
9. Repeat for cancel and failure.

## Webhook Smoke

For MVP2 sandbox, webhook checks are no-side-effect contract checks only. A future real provider issue must add signature verification tests before writing Billing facts.

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
- Redeploy after changing provider env entries before using a deployment as evidence.
