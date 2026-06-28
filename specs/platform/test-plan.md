# Test Plan: MVP3 Platform Package Boundary

## GNE-241 Checks

GNE-241 is a minimal public-entry task. Required checks:

1. Confirm `packages/platform` and `packages/db` exist as workspace packages.
2. Confirm each package exposes a single public entry from `src/index.ts`.
3. Confirm `@starter/platform` and `@starter/db` compile without importing
   Next.js, Vercel, Hono, Cloudflare runtime objects, Supabase admin clients, or
   service-role helpers.
4. Confirm product-specific Reference Product object names stay out of
   `packages/platform` and `packages/db`.
5. Confirm the package naming strategy remains transitional: `@starter/*`
   exists in code, while `@xwlc/*` remains the MVP3 target convention.
6. Run `pnpm install --lockfile-only --ignore-scripts` if the workspace lockfile
   needs the new importers.
7. Run `pnpm typecheck`.
8. Run `git diff --check`.

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

## Later GNE-243 Machine Checks

GNE-243 should turn these checks into scripts or CI coverage:

- package internal path imports are rejected;
- product object names are rejected inside reusable platform packages;
- server-only modules are not imported by browser/client code;
- common packages do not import `next/server`, `next/headers`, `NextRequest`,
  `NextResponse`, `@vercel/*`, Hono context, or Cloudflare runtime request types;
- package build/typecheck runs for each workspace package.

## Not Run In GNE-240

- Runtime UI smoke: not required because no runtime code changes.
- Supabase migration verification: not required because no schema changes.
- Vercel deployment: not required because no deployment config changes.
