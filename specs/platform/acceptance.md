# Acceptance: MVP3 Platform Package Boundary

## GNE-240 Acceptance

- [x] Package boundary rules are written in `specs/platform/engineering-spec.md`.
- [x] `context/architecture.md` records the MVP3 package namespace
  `@xwlc/*` and the removal of the old `@starter/*` workspace namespace.
- [x] `context/linear.md` records that `GNE-240` owns detailed dependency rules.
- [x] Product-specific cat-care objects are explicitly forbidden from reusable
  platform packages.
- [x] The handoff to GNE-241, GNE-242, GNE-243, and GNE-244 is clear.
- [x] Runtime-agnostic package rules are documented: common packages do not bind
  to Next.js, Vercel, Cloudflare, or Hono request/response types.
- [x] Auth contract vs runtime adapter separation is documented for current
  Supabase/Vercel and future Hono/Cloudflare paths.
- [x] `git diff --check` passes.

## Deferred Acceptance

- [x] Public package entry points exist for `@xwlc/core`, `@xwlc/ui`,
  `@xwlc/platform`, and `@xwlc/db`. Completed in GNE-241.
- [x] `@xwlc/platform` exposes runtime-agnostic Auth/session/owner,
  email-verification, analytics-event, and outbox contracts without Next.js,
  Vercel, Hono, Cloudflare, Supabase admin, or service-role types.
- [x] `@xwlc/db` exposes schema-version, RLS policy, owner/token scope, and
  migration/RLS evidence contracts without app routes, provider clients, or
  runtime request/response types.
- [x] The GNE-242 package naming strategy is explicit: workspace packages and
  app imports use the MVP3 target `@xwlc/*` namespace directly.
- [x] Existing `apps/web` and Reference Product consume package public exports,
  with Payment/Billing, AI Credit usage, webhook, and Supabase SSR adapter
  package-contract audit results. Completed in GNE-242.
- [x] Boundary rules are machine checked by `pnpm test:package-boundaries`.
  Completed in GNE-243.
- [ ] Patch upgrade evidence exists. Deferred to GNE-244.

## GNE-241 Verification Snapshot

- `pnpm typecheck` passed and included `@xwlc/platform` plus `@xwlc/db`.
- `pnpm test:release-boundaries` passed.
- `git diff --check` passed.
- Runtime/provider boundary search returned no matches in `packages/platform`
  or `packages/db` for Next.js, Vercel, Hono, Cloudflare runtime objects,
  Supabase admin/service-role terms, or provider client construction.
- Product-object boundary search returned no matches in `packages/platform` or
  `packages/db` for the Reference Product business names listed in this spec.

## GNE-242 Package Consumption Audit

| Chain | Result | Evidence | Later owner |
| --- | --- | --- | --- |
| Existing app demo data owner scope | `uses_public_contract` | `apps/web/lib/services/demo-items.ts` maps the current Supabase-authenticated user through `@xwlc/db` `createOwnerScope` before querying or inserting owner-scoped rows. | None. |
| Existing app Auth email verification gate | `uses_public_contract` | `apps/web/lib/services/auth.ts` maps Supabase user data into a runtime-agnostic `PlatformActor` and calls `@xwlc/platform` `requireVerifiedEmail` before creating the app user payload. | None. |
| Reference Product minimum entry | `uses_public_contract` | `apps/web/lib/reference-product/package-consumption.ts` and `apps/web/app/reference-product/page.tsx` consume `@xwlc/platform`, `@xwlc/db`, and `@xwlc/ui` public exports without product objects entering reusable packages. | PRODUCT issues own the full cat-care business loop. |
| Payment / Billing facts | `uses_public_contract` | Current Payment/Billing services continue using `@xwlc/core` payment, billing, entitlement, ledger, and service-result contracts. Provider checkout, webhook processing, and billing facts remain app-owned service code in MVP3. | `GNE-233` for capability integration; `GNE-201` for live payment, proration, invoices, refunds, reconciliation. |
| AI Credit usage | `uses_public_contract` | `apps/web/lib/services/ai.ts` uses `@xwlc/core` AI model, generation, usage, and Credit gate contracts while provider mode remains mock/no-op/sandbox for MVP3. | `GNE-233`; real-provider reservation/commit/release is not part of GNE-242. |
| Payment webhook route | `adapter_only_ok` | `apps/web/app/api/payment/webhook/route.ts` remains the Next.js route adapter; behavior stays in app payment services and core contracts instead of moving runtime request/response types into reusable packages. | `GNE-243` should machine-check runtime boundaries; `GNE-201` owns live payment hardening. |
| Supabase SSR cookie/session adapter | `adapter_only_ok` | `apps/web/lib/supabase/server.ts` remains the Next/Vercel/Supabase SSR adapter. GNE-242 proves business-facing Auth checks can consume `@xwlc/platform` contracts without moving cookies/session refresh into common packages. | Future Hono/Cloudflare adapter can map Worker request/cookie/env objects into the same package contracts. |

## GNE-242 Verification Snapshot

- Existing app consumption paths use package public exports only:
  `@xwlc/db`, `@xwlc/platform`, `@xwlc/core`, and `@xwlc/ui`.
- Reference Product minimum entry is available at `/reference-product` for
  package-consumption review; it does not implement the cat-care business loop.
- No migrations were added in GNE-242.
- `packages/platform` and `packages/db` remain runtime-agnostic contract
  packages and contain no Reference Product business objects.
- `pnpm typecheck` passed.
- `pnpm build` passed and included `/reference-product` in the Next.js route
  table.
- `pnpm test:release-boundaries` passed after the sign-in boundary check was
  updated to recognize the `@xwlc/platform` `requireVerifiedEmail` contract.
- `pnpm test:ai-safety` passed.
- `git diff --check` passed.
- Local HTTP smoke passed: `/reference-product` returned `200`, `/login`
  returned `200`, and unauthenticated `/dashboard` returned `307` to
  `/login?next=/dashboard`.

## GNE-243 Package Boundary Checks

`scripts/verify-package-boundaries.mjs` is the machine gate for the MVP3 package
boundary. It checks:

- `@xwlc/core` does not import provider SDKs, Supabase SDKs, Next.js, Vercel,
  Hono, Cloudflare runtime objects, or request/response runtime types.
- `@xwlc/platform` and `@xwlc/db` do not import Next/Vercel/Hono/Cloudflare
  runtime request/response APIs or `@supabase/ssr`.
- reusable packages do not contain Reference Product business table names:
  `cats`, `care_plans`, `care_tasks`, or `care_submissions`.
- `apps/web` does not deep import package internals through
  `@xwlc/*/src/*` or `@xwlc/*/internal/*`.
- client components do not reference server-only modules or Supabase
  service-role secrets.
- telemetry-facing files do not contain explicit raw-token, raw-prompt, or
  private-submission-text fields.

## GNE-243 Verification Snapshot

- `pnpm test:package-boundaries` passes locally.
- The root `pnpm test` chain includes `pnpm test:package-boundaries`, so the
  existing GitHub PR CI `Test` step runs the package boundary gate without a
  separate workflow change.
- `pnpm typecheck` passes and includes `@xwlc/core`, `@xwlc/db`,
  `@xwlc/platform`, `@xwlc/ui`, and `@xwlc/web`.
- `pnpm test` passes and runs AI safety, release-boundary, package-boundary,
  and package test tasks.
- `pnpm build` passes and includes the package builds plus the Next.js app
  build.
- `git diff --check` passes.
