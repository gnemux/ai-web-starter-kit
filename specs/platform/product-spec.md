# Product Spec: MVP3 Platform Package Boundary

## Summary

MVP3 PLATFORM turns the current starter kit foundation into a package-consumed
platform baseline. The immediate GNE-240 goal is to make package boundaries,
dependency direction, and forbidden imports explicit before code moves or new
packages are created.

## Users

- Reference Product implementers who need to know where product code belongs.
- Platform maintainers who need reusable Auth, Billing, AI, Audit, Outbox,
  analytics, and DB conventions.
- Reviewers who need to tell whether package work is real separation or only a
  directory rename.

## Problem

The current repo already has `packages/core` and `packages/ui`, while most
provider and database behavior still lives in `apps/web`. Without an explicit
boundary, MVP3 could accidentally:

- put cat-care product objects into reusable platform packages;
- let product code import internal package files instead of public exports;
- move provider SDK and service-role code into browser-reachable code;
- call the work "package化" without proving consumer boundaries.
- bind reusable packages directly to the current Next.js/Vercel runtime, making
  future Hono/Cloudflare adapters require a rewrite instead of a new adapter.

## Goals

- Define the MVP3 four-package target: `@xwlc/core`, `@xwlc/ui`,
  `@xwlc/platform`, and `@xwlc/db`.
- Record the current transitional state: existing package names are still
  `@starter/core` and `@starter/ui`; `platform` and `db` are not created yet.
- Make allowed and forbidden dependency directions reviewable.
- Define the runtime-agnostic boundary so common packages do not expose
  Next.js, Vercel, Cloudflare, or Hono request/response types.
- Define the Auth contract boundary so actor/session/auth-result concepts are
  reusable while current Supabase SSR cookie behavior stays in the app adapter.
- Give GNE-241, GNE-242, GNE-243, and GNE-244 a shared boundary contract.

## Non-goals

- Do not rename packages in GNE-240.
- Do not create `packages/platform` or `packages/db` in GNE-240.
- Do not move provider services out of `apps/web` in GNE-240.
- Do not implement Reference Product pages.
- Do not add live AI, live payment, or production Supabase requirements.

## Boundary Rules

The Reference Product may consume platform capability only through public package
exports or app-level product services. It must not copy starter kit internals as
its product implementation.

Reusable package code must not know about cat-care product objects. Names such
as `cat`, `cats`, `care_plan`, `care_plans`, `care_task`,
`care_tasks`, `share_token`, and `care_submission` belong to the Reference
Product layer unless a later approved issue explicitly defines a generic,
provider-free abstraction.

Reusable packages also must not require `NextRequest`, `NextResponse`,
`next/headers`, Vercel request objects, Hono context, or Cloudflare
request/response types in public APIs. Runtime-specific request, cookie, header,
and env handling belongs in app adapters. Shared Auth code should work with
actor/session/auth-result contracts rather than Supabase User objects or
runtime cookie stores.

## Success Criteria

- A reviewer can explain what each target package owns and does not own.
- A reviewer can identify whether a proposed import path is allowed.
- A reviewer can identify whether a proposed API is portable across runtime
  adapters.
- GNE-241 can add minimal public entries without reopening the boundary debate.
- GNE-243 can implement machine checks using the forbidden examples in this spec.
