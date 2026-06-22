# Payment Acceptance

## GNE-192 Payment Provider Boundary

- [ ] Payment boundaries are documented in `specs/payment/*` and `integrations/payment.md`.
- [ ] Payment remains provider-neutral and names sandbox, real provider, and MVP4 dual-mode boundaries.
- [ ] Payment does not own final entitlement truth; Billing remains the source for subscription and entitlement status.

## GNE-96 Sandbox Payment Provider

- [ ] The sandbox provider creates a checkout session without a real SDK or secret.
- [ ] The provider descriptor reports `capability=payment`, `provider=sandbox`, and `mode=sandbox`.
- [ ] The sandbox provider returns a route-local review URL rather than a real hosted checkout URL.
- [ ] Invalid prices and free prices fail at the service boundary.

## GNE-97 Checkout Demo Flow

- [ ] A signed-in reviewer can open `/account/payment`.
- [ ] A signed-in reviewer can start sandbox checkout for Pro monthly.
- [ ] A signed-in reviewer can start sandbox checkout for the AI credit pack.
- [ ] The sandbox page can route to success, cancel, and failure result states.

## GNE-98 Webhook, Signature, And Idempotency

- [ ] Event identity and idempotency key rules are documented.
- [ ] Sandbox webhook behavior is no-side-effect and cannot grant Billing facts.
- [ ] Real provider webhook writes are explicitly reserved for later signature-verified work.
- [ ] Duplicate and stale event behavior is described before real provider implementation.

## GNE-198 Page-Level Reviewer Surface

- [ ] `/account` links to the Payment review surface.
- [ ] `/account/payment` shows provider mode, sellable prices, and current Billing status.
- [ ] `/account/payment/sandbox` clearly shows this is a sandbox provider surface.
- [ ] `/account/payment/result` shows success, cancel, and failure status without granting entitlement.
- [ ] The page copy is available in both Chinese and English.

## Security Acceptance

- [ ] No `NEXT_PUBLIC_` payment secret is added.
- [ ] No real payment SDK is installed.
- [ ] No real provider key, webhook secret, card data, raw webhook payload, or customer account data is committed.
- [ ] Client code does not import `apps/web/lib/providers/server.ts`.
