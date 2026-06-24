# Architecture

## Monorepo Layout

```text
apps/web      -> Next.js application
packages/ui  -> reusable UI components
packages/core -> shared domain models and pure logic
```

## Layering

```text
Route / Page
-> Feature module
-> Provider adapter
-> Core domain model
-> External service
```

Business rules should not depend directly on a provider SDK. Put provider-specific code behind small adapters.

## Commercial Product Modules

- Auth: session, user profile, protected routes.
- Billing: orders, subscriptions, entitlements, payment events.
- Analytics: page views, signups, feature usage, checkout events.
- Operations: deployment status, environment checks, error monitoring.
- Growth: SEO, landing pages, campaign attribution, feedback capture.

## Provider Strategy

Use a stable internal interface for each external capability:

- `AuthProvider`
- `PaymentProvider`
- `AnalyticsProvider`
- `EmailProvider`
- `StorageProvider`

Start with one implementation, but keep the app code provider-agnostic where it matters.

## MVP3 Architecture Preflight

`GNE-210 / MVP3-CP-00` runs before new Product Validation Kit runtime work. Its
job is to protect MVP1/MVP2 foundations while preparing the kit for MVP3:

- split large Payment/Billing review surfaces only when it improves
  reviewability or reduces security risk;
- keep service-role usage behind server-only, narrow-purpose boundaries;
- define a transaction or compensation strategy for multi-table commercial
  facts such as orders, subscriptions, entitlements, credit, usage, and
  payment events;
- add regression guards for Auth confirmation, Payment result trust,
  owner-only project access, and sandbox upgrade interpretation;
- review runtime security headers such as CSP, `frame-ancestors`,
  Referrer-Policy, and X-Content-Type-Options before public validation pages
  are exposed;
- add basic abuse-prevention checks for public write paths such as anonymous
  lead submission and Product Kit API endpoints;
- preserve existing MVP1/MVP2 business behavior unless a spec or Linear issue
  explicitly changes the contract.
