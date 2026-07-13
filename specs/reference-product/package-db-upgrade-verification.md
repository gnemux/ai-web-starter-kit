# GNE-271 Package Patch And Database Upgrade Verification

## Decision

GNE-271 passes for the single shared reference/staging/test environment. The
repository can rebuild a disposable empty database, the cloud migration ledger
matches the repository, the reviewed forward migration was applied from
`main`, and the deployed Reference Product remains available.

This is staging evidence, not a claim that a separate production Supabase
environment was exercised.

## Package Patch Evidence

- The reusable packages moved from `0.1.0` to `0.1.1` in GNE-244.
- `@xwlc/core`, `@xwlc/db`, `@xwlc/platform`, and `@xwlc/ui` are currently
  `0.1.1`; the Web application consumes their public workspace exports.
- The patch did not require product pages to import package internals.

## Track A: Disposable Empty Database

- An isolated worktree used project ID `gne271-rehearsal`, dedicated ports,
  and a dedicated Docker volume. Application environments were not pointed at
  it.
- `supabase db reset --local --no-seed` succeeded for the original 16-file
  chain and again after the 17th forward migration was added.
- Five rollback-only SQL security suites passed, including real anon, owner A,
  owner B, cross-owner, upload, update, and delete Storage RLS behavior.
- Full typecheck, lint, test, build, and required GitHub CI passed.

Track A proves that repository migrations rebuild an empty database. It does
not by itself prove cloud history parity.

## Track B: Shared Cloud Test Database

- Before repair, runtime schema, constraints, indexes, functions, triggers,
  policies, grants, and catalog fingerprints matched the effects expected from
  the 16 repository migrations. The extra cloud-managed `rls_auto_enable()`
  helper was not executable by public application roles.
- The migration ledger was reconciled from 11 rows to the 16 repository
  timestamps. Missing rows were recorded only after their schema effects were
  verified. The orphan share-token timestamp was replaced by the repository
  timestamp after equivalence was verified.
- This ledger reconciliation does **not** claim that old migration SQL was
  replayed on the cloud database.
- PR #82 added
  `20260712122026_restrict_public_cat_photo_listing.sql`. GitHub Actions run
  `29214674101` applied it from `main` with `target=staging`; before-list,
  dry-run, push, and after-list steps passed.
- Cloud history now contains 17 repository migrations with head
  `20260712122026_restrict_public_cat_photo_listing`.

## Security And Data Postconditions

- `cat-photos` remains a public bucket so known object URLs keep working.
- The broad anonymous listing policy is absent. Authenticated owners can list,
  insert, update, and delete only rows in their own UUID folder.
- A rollback-only cloud transaction proved anon enumeration returns zero,
  owner-scoped operations succeed, and cross-owner operations fail. It left
  zero temporary users and zero temporary Storage objects.
- Supabase Security Advisor no longer reports the public-bucket listing lint.
  The remaining `payment_events` no-policy info and leaked-password-protection
  warning predate this change and are outside GNE-271.
- Key aggregates were unchanged across migration application: cats 3, plans 5,
  tasks 83, submissions 25, share tokens 18, Audit events 84, Outbox events 8,
  entitlements 20, usage rows 80, and credit-ledger rows 77.
- AI entitlement, usage, and credit-ledger unit postconditions have zero
  violations.

## Deployment Evidence

- PR #82 merged as `4c32d53bddb039959593b291a9bc3e4a918bd8ee`.
- Required PR CI passed.
- Vercel reported `Deployment has completed` for the merge commit.
- `https://ai-web-starter-kit-web.vercel.app/` returned HTTP 200 after the
  migration.

## Rollback And Forward-Fix Boundary

The migration intentionally keeps the bucket public and narrows only metadata
listing. If a regression appears, prefer a reviewed forward migration that
repairs the policy. Do not edit historical migration files, use Dashboard-only
schema changes, reset the linked database, or represent migration-ledger repair
as SQL execution.

## Reuse Value

The reusable result is the two-track upgrade proof: empty-database replay plus
cloud schema/history reconciliation, followed by an approved main-to-staging
migration and post-deploy security/data checks. Travel can reuse that release
method and the Storage RLS test shape while keeping product bucket names,
folder rules, and domain tables in its application layer.

