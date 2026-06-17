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
