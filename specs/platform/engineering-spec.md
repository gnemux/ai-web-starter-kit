# Engineering Spec: MVP3 Platform Package Boundary

## Scope

GNE-240 defines package boundaries and dependency direction for MVP3 PLATFORM.
It is an architecture/spec task, not a runtime refactor. Code movement and new
package creation begin in later child issues only after this boundary is stable.

## Current State

Current repository packages:

| Current package | Current folder | MVP3 target role |
| -- | -- | -- |
| `@starter/core` | `packages/core` | transitional name for future `@xwlc/core` |
| `@starter/ui` | `packages/ui` | transitional name for future `@xwlc/ui` |
| not present | `packages/platform` | future `@xwlc/platform` |
| not present | `packages/db` | future `@xwlc/db` |

GNE-240 does not rename `@starter/*` to `@xwlc/*`. The rename or alias strategy
belongs to GNE-241/GNE-242 after the public entry points are agreed.

## Target Package Responsibilities

| Target package | Owns | Must not own |
| -- | -- | -- |
| `@xwlc/core` | provider-free types, result contracts, errors, config shapes, version contracts | React, Supabase SDK, Next.js, provider SDKs, product domain objects, runtime request/response types |
| `@xwlc/ui` | reusable UI primitives, layout primitives, form/state display components | product business rules, provider clients, server-only code |
| `@xwlc/platform` | server-side facades for Auth, AI, Billing, Entitlement, Audit, Outbox, analytics, provider adapters | cat-care tables, product prompts, product page state, Next/Vercel-only request handling |
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

Transitional examples that are acceptable before package renaming:

```ts
import type { ServiceResult } from "@starter/core";
import { Button } from "@starter/ui";
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

The following names are product-specific during MVP3 and must not appear inside
platform packages unless a later issue explicitly revises the boundary:

```text
cat
cats
care_plan
care_plans
care_task
care_tasks
share_token
share_tokens
care_submission
care_submissions
sitter
temporary care
```

GNE-243 should convert this list into a machine-checkable boundary rule.

## Handoff To Later Child Issues

- GNE-241 creates or adjusts minimal public package entry points.
- GNE-242 proves the Reference Product consumes public package entry points.
- GNE-243 adds build/typecheck/boundary checks.
- GNE-244 records patch-upgrade evidence.

## Verification

GNE-240 verification is document/spec verification:

- `context/architecture.md`, `context/linear.md`, and this spec agree on target
  package boundaries.
- Runtime-specific request/cookie/env handling is documented as adapter work.
- No runtime code, migration, deployment config, or package rename is required.
- `git diff --check` must pass.
