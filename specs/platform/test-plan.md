# Test Plan: MVP3 Platform Package Boundary

## GNE-241 Checks

GNE-241 is a minimal public-entry task. Required checks:

1. Confirm `packages/platform` and `packages/db` exist as workspace packages.
2. Confirm each package exposes a single public entry from `src/index.ts`.
3. Confirm `@xwlc/platform` and `@xwlc/db` compile without importing
   Next.js, Vercel, Hono, Cloudflare runtime objects, Supabase admin clients, or
   service-role helpers.
4. Confirm product-specific Reference Product object names stay out of
   `packages/platform` and `packages/db`.
5. Confirm workspace package names and app imports use `@xwlc/*`, and the old
   `@starter/*` workspace namespace is not reintroduced.
6. Run `pnpm install --lockfile-only --ignore-scripts` if the workspace lockfile
   needs the new importers.
7. Run `pnpm typecheck`.
8. Run `git diff --check`.

## GNE-242 Checks

GNE-242 is the package-consumption proof. Required checks:

1. Confirm at least one existing `apps/web` MVP1/MVP2 real chain imports from a
   package public entry without deep imports.
2. Confirm the Reference Product minimum entry or module imports from package
   public entries without copying Starter Kit internals.
3. Confirm Payment/Billing, AI Credit usage, webhook, and Supabase SSR
   cookie/session adapter each have one audit result: `uses_public_contract`,
   `adapter_only_ok`, or `gap_deferred`.
4. Confirm `adapter_only_ok` runtime adapters stay in `apps/web` but expose or
   consume package-level contracts at the business boundary.
5. Confirm every `gap_deferred` names a later issue or stage.
6. Run type/build checks and record any UI smoke that was not run.

## GNE-240 Checks

GNE-240 is a boundary/spec task. Required checks:

1. Confirm the current repo still has only `packages/core` and `packages/ui`.
2. Confirm the docs state that `packages/platform` and `packages/db` were not
   silently created in GNE-240; they are created by GNE-241.
3. Confirm package responsibilities are clear enough for code review.
4. Confirm forbidden examples include product object leakage, internal package
   imports, and browser imports of server-only modules.
5. Confirm runtime-specific request/cookie/env behavior is assigned to app
   adapters, not common packages.
6. Confirm Auth is described as actor/session/auth-result contracts plus a
   runtime adapter, not as Supabase User or Next cookie objects flowing through
   product/business code.
7. Run `git diff --check`.

## GNE-243 Machine Checks

GNE-243 turns the package boundary rules into `pnpm test:package-boundaries`.
Required checks:

1. Run `pnpm test:package-boundaries`.
2. Confirm package internal path imports are rejected:
   `@xwlc/*/src/*` and `@xwlc/*/internal/*` must not appear in `apps/web`.
3. Confirm Reference Product business table names are rejected inside reusable
   packages: `cats`, `care_plans`, `care_tasks`, and `care_submissions`.
4. Confirm client components do not import `server-only` or reference Supabase
   service-role secrets.
5. Confirm `@xwlc/core` does not import provider SDKs, Supabase SDKs, Next.js,
   Vercel, Hono, or Cloudflare runtime objects.
6. Confirm `@xwlc/platform` and `@xwlc/db` do not import `next/server`,
   `next/headers`, `NextRequest`, `NextResponse`, `@vercel/*`, Hono context,
   Cloudflare runtime request types, or `@supabase/ssr`.
7. Confirm telemetry-facing files do not introduce explicit raw-token,
   raw-prompt, or private-submission-text fields.
8. Run `pnpm typecheck` so package build/typecheck still covers each workspace
   package through Turbo.

## Not Run In GNE-240

- Runtime UI smoke: not required because no runtime code changes.
- Supabase migration verification: not required because no schema changes.
- Vercel deployment: not required because no deployment config changes.
