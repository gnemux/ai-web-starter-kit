# Acceptance: MVP3 Platform Package Boundary

## GNE-240 Acceptance

- [x] Package boundary rules are written in `specs/platform/engineering-spec.md`.
- [x] `context/architecture.md` records the current package-name transition from
  `@starter/*` to the MVP3 `@xwlc/*` target.
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

- [x] Public package entry points exist for `@starter/core`, `@starter/ui`,
  `@starter/platform`, and `@starter/db`. Completed in GNE-241.
- [x] `@starter/platform` exposes runtime-agnostic Auth/session/owner,
  email-verification, analytics-event, and outbox contracts without Next.js,
  Vercel, Hono, Cloudflare, Supabase admin, or service-role types.
- [x] `@starter/db` exposes schema-version, RLS policy, owner/token scope, and
  migration/RLS evidence contracts without app routes, provider clients, or
  runtime request/response types.
- [x] The GNE-241 package naming strategy is explicit: new entries use the
  current `@starter/*` transition names, while `@xwlc/*` remains the MVP3 target
  convention after package consumption is validated.
- [ ] Existing `apps/web` and Reference Product consume package public exports,
  with Payment/Billing, AI Credit usage, webhook, and Supabase SSR adapter
  package-contract audit results. Deferred to GNE-242.
- [ ] Boundary rules are machine checked. Deferred to GNE-243.
- [ ] Patch upgrade evidence exists. Deferred to GNE-244.

## GNE-241 Verification Snapshot

- `pnpm typecheck` passed and included `@starter/platform` plus `@starter/db`.
- `pnpm test:release-boundaries` passed.
- `git diff --check` passed.
- Runtime/provider boundary search returned no matches in `packages/platform`
  or `packages/db` for Next.js, Vercel, Hono, Cloudflare runtime objects,
  Supabase admin/service-role terms, or provider client construction.
- Product-object boundary search returned no matches in `packages/platform` or
  `packages/db` for the Reference Product business names listed in this spec.
