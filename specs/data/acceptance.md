# Data Acceptance

## GNE-132 DATA-00

- [x] DATA SDD documents exist under `specs/data`.
- [x] A migration defines `user_profiles` and `demo_items`.
- [x] RLS is enabled for exposed tables.
- [x] Seed guidance exists and avoids real data.
- [x] `supabase db reset` succeeds locally.

## GNE-134 DATA-01

- [x] Profile and demo business table boundaries are documented.
- [x] Access model is documented for private, public, and service-only data.
- [x] Complex multi-tenant modeling is explicitly out of scope.

## GNE-135 DATA-02

- [x] Migration file exists under `supabase/migrations`.
- [x] Migration includes `user_profiles`.
- [x] Migration includes `demo_items`.
- [x] Migration avoids remote Dashboard-only schema changes.

## GNE-136 DATA-03

- [x] Owner-only profile policies are present.
- [x] Owner-only demo item policies are present.
- [x] Authenticated public-read demo item policy is present.
- [x] Service role is not exposed in browser-facing variables.

## GNE-137 DATA-04

- [x] `supabase/seed.sql` contains local-only seed guidance.
- [x] Seed file does not include real users, customers, credentials, or secrets.
- [x] Local reset has been verified with Supabase CLI and Docker.

## GNE-138 DATA-05

- [x] Anonymous, owner, non-owner, and service-only access paths have been verified against local Supabase.
- [x] Verification results are recorded after local Supabase runtime is available.

## Technical Checks

- [x] Typecheck passes.
- [x] Lint passes.
- [x] Build passes.
- [x] No secrets are committed.
- [x] Relevant docs are updated.
