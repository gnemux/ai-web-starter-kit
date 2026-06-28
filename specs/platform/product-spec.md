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

## Goals

- Define the MVP3 four-package target: `@xwlc/core`, `@xwlc/ui`,
  `@xwlc/platform`, and `@xwlc/db`.
- Record the current transitional state: existing package names are still
  `@starter/core` and `@starter/ui`; `platform` and `db` are not created yet.
- Make allowed and forbidden dependency directions reviewable.
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

## Success Criteria

- A reviewer can explain what each target package owns and does not own.
- A reviewer can identify whether a proposed import path is allowed.
- GNE-241 can add minimal public entries without reopening the boundary debate.
- GNE-243 can implement machine checks using the forbidden examples in this spec.
