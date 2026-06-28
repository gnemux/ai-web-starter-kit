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

## MVP3 Reference Product Architecture

MVP3 now starts from `GNE-228 / MVP3-01 PLAN` and validates the Reference
Product route through `GNE-229` to `GNE-234`. It is no longer driven by the old
Product Validation Kit CP chain; that route has been retired from current
planning and should not be treated as a fallback MVP3/MVP4-MVP6 path. Its job is
to prove that an independent product repo can consume the XWLC platform
foundation through packages without copying Starter Kit source.

The execution order is intentionally linear for 小团队 delivery: PLAN ->
PLATFORM -> DELIVERY -> PRODUCT -> ACCESS -> CAPABILITY -> VERIFY. Child-task
lines stay inside the parent issue descriptions until each parent is approved
for execution. `GNE-234 VERIFY` owns the 30-minute Reviewer Runbook that checks
page flow, Supabase data/RLS, Vercel deployment/env, PostHog events, GitHub CI,
package version, schema version, and patch-upgrade evidence.

MVP3 uses the 4-package convention:

- `@xwlc/core`: config, errors, logging, version, and result contracts;
- `@xwlc/ui`: reusable layout, forms, state display, and UI primitives;
- `@xwlc/platform`: Auth, AI, Entitlement, Outbox, Audit, PostHog, and delivery
  entry points;
- `@xwlc/db`: migrations, RLS conventions, database access contracts, and Schema
  Version.

Current code is in a transition state: the repository still exposes
`@starter/core` from `packages/core` and `@starter/ui` from `packages/ui`, while
`packages/platform` and `packages/db` have not been created yet. GNE-240 defines
the target package boundary and dependency direction only. Package renaming,
new package entry points, product consumption, boundary scripts, and patch
upgrade evidence belong to GNE-241 through GNE-244.

The GNE-240 boundary is runtime-agnostic by default. Common packages must not
directly depend on Next.js, Vercel, Cloudflare, or Hono request/response types.
Current Next.js/Vercel behavior belongs in the app adapter; a future
Hono/Cloudflare path should add a Worker adapter that consumes the same package
contracts. If common code needs headers, cookies, env, or request metadata, it
should receive them through a minimal interface rather than reading runtime
globals directly.

Auth follows the same split. Reusable packages may define actor/session/auth
result contracts, owner-check helpers, auth error types, and RLS expectations.
The current Supabase SSR integration and cookie/session refresh mechanics remain
in the Next.js/Vercel app adapter. A future Hono/Cloudflare adapter can map its
own request/cookie/env objects into the same contracts.

Reference Product cat-care objects such as cats, care plans, care tasks,
submissions, product prompts, and product events must stay outside the platform
packages.

The Linear MVP3 milestone is the primary visual execution surface for this
architecture. It now carries Mermaid diagrams for the dual-foundation
architecture, business loop, data flow, and reviewer verification flow; the
parent issues carry the detailed page, data, deployment, analytics, and CI
verification expectations. Keep durable architecture decisions synced here, but
avoid duplicating every Linear diagram in this file.

The milestone also owns the current code-directory mapping table for MVP3:
product app code stays in the Reference Product surface, pure provider-free
contracts stay in `packages/core`, reusable UI primitives stay in `packages/ui`,
provider facades stay in `packages/platform`, database delivery conventions stay
in `packages/db`, and behavior/acceptance memory stays in `specs/*` and
`context/*`. Before a child issue enters implementation, make sure it has enough
construction detail to limit blast radius: likely files/directories, concrete
outputs, non-goals, reviewer verification, documentation sync, and not_run/risk
records.

The current MVP3 child-issue rules add three implementation constraints that
must be preserved during coding:

- package boundaries must be machine-checkable: product business names stay out
  of platform packages, package consumers use public exports instead of
  internal paths, browser/client code must not import server-only modules, and
  provider SDK/service-role usage stays behind platform/server facades;
- Reference Product state language must be consistent across code, pages,
  Supabase rows, PostHog events, and reviewer notes. The baseline state model is
  `draft -> ready -> published -> shared -> active -> submitted -> reviewed ->
  closed`; if the implementation uses fewer states, it must document the mapping
  instead of inventing parallel names;
- cross-system capability work must be idempotent and degradable by default:
  Outbox, AI draft, Billing/Credit, audit, and analytics failures should be
  handled with explicit retry, no duplicate business effects, and no leakage of
  raw tokens, prompts, or private content.

MVP3 still preserves the architecture-hardening intent from the old preflight
scope:

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
- add basic abuse-prevention checks for public write paths such as private-link
  anonymous submissions and Reference Product API endpoints;
- preserve existing MVP1/MVP2 business behavior unless a spec or Linear issue
  explicitly changes the contract.
