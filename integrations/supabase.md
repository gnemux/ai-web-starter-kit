# Supabase Integration

## Purpose

Supabase is the default provider for authentication, user profiles, and MVP database storage.

## Status

M2 DATA verified locally and applied to staging. M3 API service helpers are verified locally. M4 Auth implementation is in progress with local SSR, protected route, and account UI verification complete.

## Collaboration Model

Supabase schema changes are managed through Git migrations, not remote Dashboard edits.

- Each developer uses a local Supabase database for day-to-day development.
- Shared staging is used only for team integration after migration review.
- Production is changed only by a Maintainer or CI.
- All schema, RLS, index, constraint, function, trigger, and seed changes must be represented in repository files.

Detailed workflow: `context/supabase-workflow.md`.

Deployment and environment memory:

- Deployment status writeback: `context/deployment-status.md`
- Environment separation rules: `context/environment-matrix.md`
- Production monitoring checks: `context/production-monitoring.md`

Provider matrix:

- MVP2 provider stage boundaries and public/server-only rules live in `integrations/provider-matrix.md`.

Provider adapter boundary:

- GNE-181 records Supabase as the real Auth and Database provider in `apps/web/lib/providers/catalog.ts`.
- Supabase Auth and Database are not deeply providerized in GNE-181; existing helpers and service modules remain the boundary.

## Initial Scope

- Email or OAuth sign up and sign in.
- Session handling.
- Protected routes.
- User profile table.
- Demo business table for API and RLS examples.
- Row Level Security for user-owned data.

## Environment Variables

```text
AUTH_PROVIDER=supabase
DATABASE_PROVIDER=supabase
SUPABASE_PROJECT_REF=your-supabase-project-ref
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`AUTH_PROVIDER` and `DATABASE_PROVIDER` are non-secret server-side selectors. `SUPABASE_PROJECT_REF` is not a secret, but it identifies a linked project and should use a placeholder in `.env.example`. Keep real URL, publishable/anon key, service role key, access token, and database password out of Git.

## Rules

- Do not use the service role key in browser code.
- Do not commit real keys.
- Do not commit remote database passwords or Supabase access tokens.
- Keep RLS enabled for user data.
- Add migration and rollback notes for schema changes.
- Do not create tables directly in shared staging or production Dashboard.
- Run `supabase db reset` before submitting PRs that include migrations.
- Add PR notes for destructive changes, RLS policies, and production rollout requirements.

## Remote Project Link

The local CLI can be linked to a shared remote Supabase project only after the target environment is clear.

```bash
supabase login
supabase link --project-ref nglilxhkuqzswbwitbdu
```

Rules:

- Prefer linking to staging for day-to-day integration work.
- Do not run unreviewed schema writes against production.
- Keep remote credentials in `.env.local`, the Supabase CLI auth store, or deployment platform secrets only.
- For local Next.js preview in this monorepo, keep an ignored `apps/web/.env.local` with the same public app variables or export those variables in the shell before running `pnpm dev`.
- Use remote project values for Auth only through environment variables; do not hardcode them in app code.
- `SUPABASE_SECRET_KEY` and legacy `SUPABASE_SERVICE_ROLE_KEY` are server-only and must not be exposed through `NEXT_PUBLIC_` variables.

Current staging:

- Project ref: `nglilxhkuqzswbwitbdu`
- API URL: `https://nglilxhkuqzswbwitbdu.supabase.co`
- Applied migrations:
  - `20260618070613_create_data_template`
  - `20260618070813_harden_data_template`
  - `20260618070953_revoke_public_rls_auto_enable`
- Pending migration:
  - `20260621130735_create_billing_foundation`
- Security advisors: clear after hardening.
- Performance advisors: only new-table unused-index INFO entries for `demo_items_owner_id_idx` and `demo_items_visibility_idx`, expected until staging receives representative traffic.

## GitHub Actions Staging Migrations

Staging migrations are applied by the manual workflow at `.github/workflows/supabase-staging-migrations.yml`.

Purpose:

- Apply reviewed migration files from `supabase/migrations` to the shared staging project.
- Keep Vercel application deployment separate from database schema deployment.
- Avoid direct schema edits in the Supabase Dashboard.

Trigger:

1. Merge the migration PR into `main`.
2. In GitHub Actions, run `Supabase Staging Migrations` from the `main` branch.
3. Enter `staging` in the confirmation input.
4. Review the before/after migration list and `db push` logs.

Required GitHub configuration:

- GitHub Environment: `staging`
- Secret `SUPABASE_ACCESS_TOKEN`: Supabase personal access token with access to the staging project.
- Secret `STAGING_PROJECT_ID`: staging Supabase project ref, currently `nglilxhkuqzswbwitbdu`.
- Secret `STAGING_DB_PASSWORD`: staging database password.
- Optional repository or environment variable `SUPABASE_CLI_VERSION`: pin the Supabase CLI version. If omitted, the workflow uses `latest`.

Rules:

- Do not store secret values in repository files, PR descriptions, Linear comments, or issue text.
- Do not run the workflow from a feature branch; the workflow enforces `main`.
- Do not add `--include-seed` unless the staging rollout explicitly requires seed data.
- For production, create a separate production workflow and approval path instead of reusing the staging secrets.

## M2 DATA Template

The first reusable data template is tracked by Linear `GNE-132`.

Tables:

- `public.user_profiles`: one profile row per Supabase Auth user.
- `public.demo_items`: one user-owned demo business record for API/service examples.

Access patterns:

- Owner-only rows use `auth.uid()` against the owning user id.
- Authenticated public-read rows are limited to explicit `visibility = 'public'`.
- Service-only operations must stay in server-side API/service code and must never use `NEXT_PUBLIC_` variables.

Local verification:

```bash
supabase start
supabase db reset
pnpm typecheck
pnpm build
```

Verification completed in this workspace:

- `supabase start` succeeds with local analytics disabled for Colima compatibility.
- `supabase db reset` succeeds from an empty local database.
- `public.user_profiles` and `public.demo_items` exist with RLS enabled.
- Owner-only profile and demo item policies were verified with two temporary local users inside a rollback transaction.
- Authenticated public-read behavior was verified for `demo_items.visibility = 'public'`.
- Non-owners cannot update another user's private demo item.

## M3 API Service Template

The first reusable service template is tracked by Linear `GNE-133`.

Boundaries:

- Pages and client components render service results and call server actions.
- Server actions translate framework inputs and call services.
- Services own auth checks, input validation, provider calls, and safe error mapping.
- Supabase helpers are centralized under `apps/web/lib/supabase`.
- `packages/core` owns provider-independent result types and validation.

Implemented examples:

- `listDemoItems`: authenticated read of owner rows plus explicit public rows.
- `createDemoItemFromFormData`: form input validation, authenticated insert, and safe error mapping.
- Dashboard API service demo: page calls service methods; client form calls a server action.

## M4 Auth Template

The Auth template is tracked by Linear `GNE-5`.

Implemented boundaries:

- Supabase Auth is the identity and session source of truth.
- `apps/web/proxy.ts` refreshes Auth cookies and protects `/dashboard` and `/account`.
- Protected server code validates sessions with `supabase.auth.getClaims()`.
- Auth use cases live in `apps/web/lib/services/auth.ts`.
- Login, signup, logout, confirmation exchange, current account, and profile update flows return `ServiceResult<T>`.
- `public.user_profiles` is reused from M2; no M4 schema migration is required.

Routes:

- `/login`: email/password sign in and sign up.
- `/auth/confirm`: Supabase email confirmation code exchange.
- `/dashboard`: protected product workspace.
- `/account`: protected profile settings page.

Operational notes:

- Supabase Auth dashboard settings decide whether signup creates an immediate session or requires email confirmation.
- Vercel must include `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Vercel Production and Preview entries must be configured separately. Redeploy after changing any Supabase env key before using that deployment as verification evidence.
- If Auth redirect URLs are restricted in Supabase, add local, preview, and production URLs before testing email confirmation.
- Real signup/login verification may send email to the test address and should be done by the account owner.
