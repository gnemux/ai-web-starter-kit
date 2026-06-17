# Supabase Integration

## Purpose

Supabase is the default provider for authentication, user profiles, and MVP database storage.

## Status

Planned.

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
- Row Level Security for user-owned data.

## Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Rules

- Do not use the service role key in browser code.
- Do not commit real keys.
- Keep RLS enabled for user data.
- Add migration and rollback notes for schema changes.
- Do not create tables directly in shared staging or production Dashboard.
- Run `supabase db reset` before submitting PRs that include migrations.
- Add PR notes for destructive changes, RLS policies, and production rollout requirements.
