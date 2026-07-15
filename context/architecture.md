# Architecture

## Monorepo Layout

```text
apps/web      -> Next.js application
packages/core -> shared domain models and pure logic
packages/ui  -> reusable UI components
packages/platform -> runtime-agnostic platform contracts and ports
packages/db  -> database boundary, RLS, and schema-version contracts
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

MVP3 started from `GNE-228 / MVP3-01 PLAN` and validated the Reference
Product route through `GNE-229` to `GNE-234`, then added `GNE-298 TEMPLATE` to
generate and verify a separate clean template candidate. It is no longer driven
by the old Product Validation Kit CP chain; that route has been retired from
current planning and should not be treated as a fallback MVP3/MVP4-MVP6 path. Its job is
to prove that a separate product consumer can use the XWLC platform foundation
through public packages without copying Starter Kit source. MVP3 proves this
inside the monorepo; GNE-274 defines how to generate a separate clean template
candidate without deleting the evidence product. `GNE-298` is a post-VERIFY
parent and must not start before `GNE-234` is Done.

The execution order is intentionally linear for 小团队 delivery: PLAN ->
PLATFORM -> DELIVERY -> PRODUCT -> ACCESS -> CAPABILITY -> VERIFY -> TEMPLATE.
Child-task lines stay inside the parent issue descriptions until each parent is approved
for execution. `GNE-234 VERIFY` owns the 30-minute Reviewer Runbook that checks
page flow, Supabase data/RLS, Vercel deployment/env, PostHog events, GitHub CI,
package version, schema version, and patch-upgrade evidence.

MVP3 uses the 4-package convention:

- `@xwlc/core`: shared data/API/Auth/provider contracts plus Billing, Payment,
  Entitlement/Credit, and AI domain contracts and pure helpers;
- `@xwlc/ui`: reusable layout, forms, state display, and UI primitives;
- `@xwlc/platform`: runtime-neutral Actor/Session/owner checks, email and
  Analytics/Outbox ports, safe capability context, and generic share-token
  state resolution;
- `@xwlc/db`: Schema Version, owner/anonymous access scopes, RLS policy kinds,
  and migration/RLS evidence contracts.

The four packages are contracts and pure behavior, not a complete runnable
mother template. They are currently private workspace packages; their patch
evidence proves monorepo compatibility, not registry or cross-repository update
delivery. Next.js/Supabase/PostHog adapters, migrations, CI, configuration
examples, and neutral app composition are required in a template candidate;
product routes, product migrations, DTOs, events, policies, copy, and assets are
not.

GNE-274 permits a separate clean template candidate containing the neutral
workspaces and app scaffold. The next product should be generated into its own
repository from that candidate. When independently maintained repositories
need shared package updates, select and verify an explicit distribution or sync
channel before claiming multi-repository package delivery.

GNE-298 implements that candidate through
`GNE-301 -> GNE-302 -> GNE-303 -> GNE-315`. The final hardening child keeps
platform routes and foundation tests protected while giving each generated
product a declared App Router subtree and product-test subtree that it can
replace without invalidating candidate provenance.
The candidate keeps `packages/*` as a local workspace snapshot stamped with the
source commit, template version, dependency and asset-license provenance. Its
foundation database uses an independent CLI-generated timestamp migration and
records the source and candidate schema versions; it does not rename or squash
the research repository history. A central package registry and automatic
cross-repository upgrades are intentionally deferred until a second real
consumer creates evidence for the correct distribution boundary.

The binding extraction architecture is under `specs/template/`: the product
contract is in `product-spec.md`, current/target trees and dependency/database
rules are in `engineering-spec.md`, and the path/migration disposition is in
`extraction-manifest.md`. GNE-302 must implement those documents rather than
re-deciding the repository boundary while moving code.

Current code now uses the MVP3 target package namespace directly:
`@xwlc/core`, `@xwlc/ui`, `@xwlc/platform`, and `@xwlc/db`. GNE-240 defined
the target package boundary and dependency direction. GNE-241 added the minimal
public entries for `platform` and `db`. GNE-242 removes the old `@starter/*`
workspace namespace and proves consumption from the app/product side. Boundary
scripts and patch upgrade evidence belong to GNE-243 and GNE-244.

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

In GNE-241, `packages/platform` and `packages/db` are contract packages, not
runtime adapters. They do not import Supabase admin clients, Next.js request
objects, Vercel helpers, Hono context, or Cloudflare Worker objects. That keeps
the current Supabase + Vercel path stable while preserving a future
Cloudflare/Hono adapter path.

In GNE-242, package consumption is proven by app-side consumers rather than by
moving pages into packages. Existing `apps/web` services may adapt provider data
into public contracts such as `PlatformActor` or `DbAccessScope`; Reference
Product entry points may consume those contracts from the app/product side.
Payment, AI Credit usage, webhooks, and Supabase SSR cookie/session code remain
runtime/app adapters unless a later issue introduces a narrower facade. This is
intentional: reusable packages stay clean, and a future Cloudflare/Hono adapter
can map its own request/cookie/env objects into the same contracts.

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
