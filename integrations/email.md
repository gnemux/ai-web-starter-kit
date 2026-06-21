# Email Integration

## Purpose

Email integration will support transactional product messages such as confirmations, notifications, receipts, and operational alerts when a product task needs them.

## Status

Reserved for future MVP2/MVP3 execution. No real email provider is configured in the app today.

The provider boundary and stage split are defined in `integrations/provider-matrix.md`.

GNE-181 defines provider-neutral Email contract types in `packages/core/src/providers.ts` and a no-op adapter landing point in `apps/web/lib/providers/server.ts`.

## Strategy

Start with a no-op adapter so product flows can be designed without requiring real email credentials. A real provider should be selected only when a product workflow needs email delivery and has a safe verification path.

## MVP Boundaries

- MVP2 defines provider matrix, env naming, server-only secret rules, and no-op behavior.
- MVP3 may consume a no-op or later provider-backed email path for Product Validation Kit workflows.
- MVP4 owns overseas/china real provider rollout, including domestic provider choice, sender/domain verification, templates, compliance, and deployment differences.

## Environment Variables

```text
EMAIL_PROVIDER=noop
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=
```

`EMAIL_PROVIDER` is a non-secret server-side selector. `EMAIL_PROVIDER_API_KEY` is a server-only placeholder and must not use `NEXT_PUBLIC_`.

## Rules

- Do not commit email provider keys, SMTP credentials, sender verification secrets, customer email lists, or raw provider payloads.
- Do not send real email from local tests unless the task explicitly requires it and uses safe test recipients.
- Product code should call a local email service/provider adapter instead of importing a provider SDK in pages or components.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing Email env keys before verifying delivery behavior.
