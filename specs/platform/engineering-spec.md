# Engineering Spec: MVP3 Platform Package Boundary

## GNE-267 Durable Capability Modules

`@xwlc/platform` keeps its existing root exports while capability-context validation and the runtime-neutral share-token gate live in separate internal modules. A second product imports only the package root and supplies its own resource type/scope; Node crypto, Supabase, Next.js, and product DTOs remain app adapters.

## Scope

GNE-240 defines package boundaries and dependency direction for MVP3 PLATFORM.
It is an architecture/spec task, not a runtime refactor. Code movement and new
package creation begin in later child issues only after this boundary is stable.

## Current State

Current repository packages:

| Current package | Current folder | MVP3 role |
| -- | -- | -- |
| `@xwlc/core` | `packages/core` | provider-free contracts and pure logic |
| `@xwlc/ui` | `packages/ui` | reusable UI primitives |
| `@xwlc/platform` | `packages/platform` | runtime-agnostic platform contracts and ports |
| `@xwlc/db` | `packages/db` | database boundary and RLS contracts |

GNE-241 created the new package public entry points. GNE-242 removes the old
`@starter/*` workspace namespace and uses the MVP3 target `@xwlc/*` namespace
directly while proving app/product consumption. Runtime/provider adapters remain
outside reusable package public entries.

## GNE-241 Public Entries

GNE-241 keeps the public entries intentionally small:

| Package | Public entry | Owns in GNE-241 |
| -- | -- | -- |
| `@xwlc/core` | `packages/core/src/index.ts` | existing provider-free service contracts, auth inputs, billing, payment, AI, provider descriptors |
| `@xwlc/ui` | `packages/ui/src/index.tsx` | existing reusable UI primitives |
| `@xwlc/platform` | `packages/platform/src/index.ts` | runtime-agnostic actor/session/auth-result contracts, owner/email checks, safe capability context, generic share-credential authorization states, email verification port, analytics event port, outbox port |
| `@xwlc/db` | `packages/db/src/index.ts` | schema version contracts, RLS policy names, owner/token scope helpers, migration/RLS evidence shapes |

The new packages expose contracts and pure helpers only. Supabase SSR clients,
service-role access, webhook verification, PostHog SDK calls, provider SDKs,
Next.js routes, Vercel deployment behavior, and future Hono/Cloudflare Worker
objects remain adapter concerns outside these public entries.

## Target Package Responsibilities

| Target package | Owns | Must not own |
| -- | -- | -- |
| `@xwlc/core` | provider-free types, result contracts, errors, config shapes, version contracts | React, Supabase SDK, Next.js, provider SDKs, product domain objects, runtime request/response types |
| `@xwlc/ui` | reusable UI primitives, layout primitives, form/state display components | product business rules, provider clients, server-only code |
| `@xwlc/platform` | runtime-agnostic contracts and pure helpers for Auth, safe capability context, generic share-credential authorization states, AI, Billing, Entitlement, Audit, Outbox, analytics, and provider ports | cat-care tables, share-token persistence rows, product prompts, product page state, credential generation/hashing, Next/Vercel-only request handling |
| `@xwlc/db` | migration conventions, RLS conventions, schema version contracts, DB verification helpers | app routes, React UI, product-specific business tables as reusable platform objects, runtime request/response types |
| Reference Product | cat profiles, care plans, care tasks, share links, submissions, product copy, page flows | platform internals, service-role wrappers, reusable provider contracts |

## Dependency Direction

Allowed direction:

```text
Reference Product -> core
Reference Product -> ui
Reference Product -> platform
Reference Product -> db
platform -> core
platform -> db
ui -> core
db -> core
```

Forbidden direction:

```text
core -> ui/platform/db/app
ui -> platform/db/app
db -> platform/ui/app
platform -> app/product pages
packages/* -> Reference Product product domain
browser/client code -> server-only platform internals
Reference Product -> package internal paths
```

## Runtime-Agnostic Boundary

Allowed:

- app adapters can depend on Next.js and Vercel;
- future Worker adapters can depend on Hono and Cloudflare;
- provider adapters can depend on concrete SDKs inside server-only boundaries;
- common packages can receive headers, cookies, env, or request metadata through
  minimal interfaces.

Forbidden:

- `@xwlc/core`, common `@xwlc/platform`, and `@xwlc/db` code directly depending
  on Next.js, Vercel, Cloudflare, or Hono request/response types;
- common packages importing `next/headers`, `next/server`, `NextRequest`,
  `NextResponse`, `@vercel/*`, Hono context, or Cloudflare request/response
  objects;
- moving current Next.js cookie/session behavior into reusable packages as the
  only implementation path.

Future Hono + Cloudflare support should be an additional adapter that consumes
the same package contracts, not a rewrite of the reusable packages.

## Auth Contract Boundary

Common packages may define runtime-agnostic contracts such as:

- `Actor`;
- `SessionSummary`;
- `AuthResult`;
- owner checks;
- auth error and session-state types;
- RLS expectations.

The current app remains responsible for the Next.js/Vercel Supabase SSR adapter,
including cookie/session refresh and Auth confirmation handling. A future
Hono/Cloudflare adapter should map Worker request/cookie/env details into the
same contracts.

## Import Rules

Allowed examples:

```ts
import type { ServiceResult } from "@xwlc/core";
import { Button } from "@xwlc/ui";
import { getCurrentEntitlement } from "@xwlc/platform";
import { schemaVersion } from "@xwlc/db";
```

Forbidden examples:

```ts
import { internalAuthClient } from "@xwlc/platform/src/internal/auth";
import { createCarePlan } from "@xwlc/platform";
import { createClient } from "@supabase/supabase-js"; // inside browser product UI
import { NextRequest } from "next/server"; // inside common packages
```

## Server-Only Boundary

Provider SDKs, service-role keys, webhook verification, and admin database
access must stay behind server-only facades. Public exports can expose types and
safe functions, but browser/client components must not import server-only
modules.

## Product Object Boundary

`@xwlc/platform` owns the exact four-key safe capability context contract:
`correlation_id`, `resource_id`, `resource_type`, and `request_source`. Its pure
validator rejects unknown keys, URLs, whitespace/private text, oversized
values, and bearer-like resource identifiers before cross-capability use.
Identifiers are allowlisted to UUIDs or `namespace:suffix`, where the suffix is
another UUID or a bounded lowercase low-entropy business slug. Client-provided
opaque ids and dangerous `private`, `secret`, `token`, credential, auth, or API
key semantics are not valid capability context.

It also owns the provider-free authorization result contract for a generic
anonymous share credential: anonymous actor shape plus `valid`, `expired`,
`revoked`, `invalid`, and `unavailable` resolution. Node `crypto` generation,
hashing, and constant-time verification remain in the app server adapter. The
package does not own product persistence rows or raw credentials.

The following names are product-specific during MVP3 and must not appear inside
platform packages unless a later issue explicitly revises the boundary:

```text
cat
cats
care_plan
care_plans
care_task
care_tasks
product share-token persistence rows
care_submission
care_submissions
sitter
temporary care
```

Generic share-credential authorization contracts are explicitly allowed in
`@xwlc/platform`; CatCare share-token rows, DTOs, queries, and page state are
not. GNE-243 should keep the product table/object list machine-checkable without
blocking provider-free credential contracts.

## Handoff To Later Child Issues

- GNE-241 creates or adjusts minimal public package entry points.
- GNE-242 proves public package consumption from existing `apps/web` and the
  Reference Product. It must audit Payment/Billing, AI Credit usage, webhooks,
  and Supabase SSR cookie/session adapter as `uses_public_contract`,
  `adapter_only_ok`, or `gap_deferred` instead of treating high-risk chains as
  out of sight.
- GNE-243 adds build/typecheck/boundary checks.
- GNE-244 records patch-upgrade evidence.

## Verification

GNE-240 verification is document/spec verification:

- `context/architecture.md`, `context/linear.md`, and this spec agree on target
  package boundaries.
- Runtime-specific request/cookie/env handling is documented as adapter work.
- No runtime code, migration, deployment config, or package rename is required.
- `git diff --check` must pass.
