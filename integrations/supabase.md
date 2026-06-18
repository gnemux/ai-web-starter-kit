# Supabase Integration

## Purpose

Supabase is the default provider for authentication, user profiles, and MVP database storage.

## Status

M2 DATA verified locally and applied to staging.

## Collaboration Model

Supabase schema changes are managed through Git migrations, not remote Dashboard edits.

- Each developer uses a local Supabase database for day-to-day development.
- Shared staging is used only for team integration after migration review.
- Production is changed only by a Maintainer or CI.
- All schema, RLS, index, constraint, function, trigger, and seed changes must be represented in repository files.

Detailed workflow: `context/supabase-workflow.md`.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
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
- Use remote project values for Auth only through environment variables; do not hardcode them in app code.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must not be exposed through `NEXT_PUBLIC_` variables.

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
