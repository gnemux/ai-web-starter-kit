# SMS Integration

## Purpose

SMS integration will support phone-based notifications or verification only if a product workflow explicitly requires it.

## Status

Reserved for future MVP2/MVP3 execution. No real SMS provider is configured in the app today.

The provider boundary and stage split are defined in `integrations/provider-matrix.md`.

## Strategy

Start with a no-op adapter. Real SMS should wait until the product needs it, because provider selection depends on target market, template registration, compliance, sender identity, and cost controls.

## MVP Boundaries

- MVP2 defines provider matrix, env naming, server-only secret rules, and no-op behavior.
- MVP3 may consume a no-op or later provider-backed SMS path only if the sample product requires it.
- MVP4 owns overseas/china real SMS rollout, including domestic provider choice, templates, signatures, compliance, and delivery monitoring.

## Environment Variables

Names will be finalized by `GNE-182`. Until then, SMS secrets are server-only placeholders and must not use `NEXT_PUBLIC_`.

## Rules

- Do not commit SMS provider keys, signing secrets, verification codes, phone lists, or raw provider payloads.
- Do not send real SMS from local tests unless the task explicitly requires it and uses safe test numbers.
- Product code should call a local SMS service/provider adapter instead of importing a provider SDK in pages or components.
