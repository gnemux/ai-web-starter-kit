# Test Plan: MVP3 Platform Package Boundary

## GNE-240 Checks

GNE-240 is a boundary/spec task. Required checks:

1. Confirm the current repo still has only `packages/core` and `packages/ui`.
2. Confirm the docs state that `packages/platform` and `packages/db` are future
   GNE-241+ work, not silently created in GNE-240.
3. Confirm package responsibilities are clear enough for code review.
4. Confirm forbidden examples include product object leakage, internal package
   imports, and browser imports of server-only modules.
5. Run `git diff --check`.

## Later GNE-243 Machine Checks

GNE-243 should turn these checks into scripts or CI coverage:

- package internal path imports are rejected;
- product object names are rejected inside reusable platform packages;
- server-only modules are not imported by browser/client code;
- package build/typecheck runs for each workspace package.

## Not Run In GNE-240

- Runtime UI smoke: not required because no runtime code changes.
- Supabase migration verification: not required because no schema changes.
- Vercel deployment: not required because no deployment config changes.
