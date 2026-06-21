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

## Initial Scope

- Email or OAuth sign up and sign in.
- Session handling.
- Protected routes.
- User profile table.
- Demo business table for API and RLS examples.
- Row Level Security for user-owned data.

## Environment Variables

```text
SUPABASE_PROJECT_REF=nglilxhkuqzswbwitbdu
NEXT_PUBLIC_SUPABASE_URL=https://nglilxhkuqzswbwitbdu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_PROJECT_REF` is not a secret, but it identifies the linked remote project. Keep real URL, anon key, service role key, access token, and database password out of Git.

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
  - `create_data_template`
  - `harden_data_template`
  - `revoke_public_rls_auto_enable`
- Security advisors: clear after hardening.
- Performance advisors: only new-table unused-index INFO entries for `demo_items_owner_id_idx` and `demo_items_visibility_idx`, expected until staging receives representative traffic.

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
- If Auth redirect URLs are restricted in Supabase, add local, preview, and production URLs before testing email confirmation.
- Real signup/login verification may send email to the test address and should be done by the account owner.
