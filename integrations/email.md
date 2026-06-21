# Email Integration

## Purpose

Email integration will support transactional product messages such as confirmations, notifications, receipts, and operational alerts when a product task needs them.

## Status

Reserved for future MVP2/MVP3 execution. No real email provider is configured in the app today.

The provider boundary and stage split are defined in `integrations/provider-matrix.md`.

## Strategy

Start with a no-op adapter so product flows can be designed without requiring real email credentials. A real provider should be selected only when a product workflow needs email delivery and has a safe verification path.

## MVP Boundaries

- MVP2 defines provider matrix, env naming, server-only secret rules, and no-op behavior.
- MVP3 may consume a no-op or later provider-backed email path for Product Validation Kit workflows.
- MVP4 owns overseas/china real provider rollout, including domestic provider choice, sender/domain verification, templates, compliance, and deployment differences.

## Environment Variables

Names will be finalized by `GNE-182`. Until then, email secrets are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Do not commit email provider keys, SMTP credentials, sender verification secrets, customer email lists, or raw provider payloads.
- Do not send real email from local tests unless the task explicitly requires it and uses safe test recipients.
- Product code should call a local email service/provider adapter instead of importing a provider SDK in pages or components.
