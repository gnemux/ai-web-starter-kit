# Data Engineering Spec

## Scope

Implement the M2 DATA foundation for Linear issues `GNE-132` through `GNE-138`.

This pass adds:

- DATA SDD documents.
- A Supabase migration for `user_profiles` and `demo_items`.
- RLS policies for owner-only and authenticated public-read examples.
- Safe local seed guidance.
- Shared TypeScript types for the DATA model.
- Status and integration documentation updates.

## Affected Areas

- `specs/data`
- `supabase/migrations`
- `supabase/seed.sql`
- `supabase/README.md`
- `packages/core`
- `integrations/supabase.md`
- `context/linear.md`
- `context/status.md`

## Architecture

```text
Supabase Auth user
-> public.user_profiles
-> public.demo_items
-> M3 API service layer
-> apps/web pages
```

M2 owns schema and permission templates. M3 API will own the service layer that calls the database, normalizes errors, validates input, and prevents pages from scattering direct database access.

## Data Model

### `public.user_profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Rules:

- One row per Auth user.
- Users may read, insert, and update only their own row.
- Users may not delete profiles through the client in the template.

### `public.demo_items`

- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null references auth.users(id) on delete cascade`
- `title text not null`
- `notes text`
- `visibility text not null default 'private'`
- `status text not null default 'active'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Checks:

- `visibility in ('private', 'public')`
- `status in ('active', 'archived')`
- `length(title) between 1 and 120`
- `notes is null or length(notes) <= 2000`

Rules:

- Owners can read, insert, update, and delete their own records.
- Authenticated users can read `visibility = 'public'` records.
- Non-owners cannot update or delete records.

## UI States

M2 does not add UI. M3/M4 pages should represent:

- Default: profile and demo item data available.
- Empty: no demo items exist for the signed-in user.
- Loading: service call pending.
- Error: service or database failure.
- Success: create/update/delete completed.

## External Providers

Provider: Supabase.

Environment variables are documented in `.env.example` and `integrations/supabase.md`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Local development requires Supabase CLI and Docker. This workspace has verified `supabase start` and `supabase db reset` through Colima, with local analytics disabled for Colima Docker socket compatibility.

## Security

- Secrets: no real Supabase keys or service role keys are committed.
- Permissions: RLS is enabled on every exposed table.
- User data: profile and demo item rows are scoped by `auth.uid()`.
- Abuse cases: clients cannot write another user's profile or demo item; service-only operations must be introduced in M3 API or later server-only code.

## Rollout

- Local: run `supabase start` and `supabase db reset`.
- Preview: apply reviewed migrations through CI or a maintainer-controlled staging flow.
- Production: apply only after backup, rollback review, and maintainer approval.

## Open Questions

- Whether the demo business table should later evolve into a product-specific example such as projects, documents, credits, or feedback.
- Whether generated Supabase TypeScript database types should be committed in a later API/Auth task.
