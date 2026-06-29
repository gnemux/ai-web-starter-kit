# Data Test Plan

## Unit Tests

- Type-check the DATA TypeScript model exports in `packages/core`.
- Validate that `DemoItemVisibility` and `DemoItemStatus` values match migration checks.

## Integration Tests

When Supabase CLI and Docker are available:

1. Run `supabase init` if `supabase/config.toml` is absent.
2. Run `supabase start`.
3. Run `supabase db reset`.
4. Confirm `public.user_profiles` exists.
5. Confirm `public.demo_items` exists.
6. Confirm RLS is enabled on both tables.

## Permission Checks

Use local Supabase users or SQL helpers to verify:

- Anonymous users cannot read private demo items.
- Authenticated users can read their own profile.
- Authenticated users can insert their own profile.
- Authenticated users can update their own profile.
- Authenticated users cannot update another user's profile.
- Owners can create, update, and delete their own demo items.
- Authenticated users can read public demo items.
- Non-owners cannot update or delete public demo items.

## Browser / E2E Checks

M2 does not expose a page. Browser checks belong to M3 API and M4 Auth once service and UI paths exist.

## Manual Verification

- Run `pnpm typecheck`.
- Run `pnpm lint`.
- Run `pnpm build`.
- Check `git diff` to ensure no secret values are present.

## Current Verification Record

- `supabase start` succeeded locally with Colima.
- `supabase db reset` succeeded after applying `20260618021000_create_data_template.sql`.
- `public.user_profiles` and `public.demo_items` were verified with RLS enabled.
- `authenticated` grants were verified for the required table operations.
- A rollback-only SQL check verified owner-only profile reads, owner demo item reads, authenticated public-read demo item reads, and blocked non-owner updates.
- Staging project `<staging-project-ref>` received `create_data_template`, `harden_data_template`, and `revoke_public_rls_auto_enable` migrations.
- Staging security advisors returned no lints after hardening.
- Staging performance advisors only reported expected unused-index INFO entries for new `demo_items` indexes.

## Regression Risks

- RLS policies that allow public reads too broadly.
- Profile insert policies that let users create rows for another user.
- Demo item update policies that miss the matching SELECT policy requirement.
- Seed data accidentally containing real user or customer data.
