-- GNE-319 MEDIA/SECURITY: private, normalized care evidence.
-- Anonymous visitors never receive Storage credentials or object URLs. The
-- application validates a scoped share token, normalizes each image, and uses
-- the service role to write at most three objects for a submission.

alter table public.care_tasks
  add column if not exists photo_required boolean not null default false;

create table if not exists public.care_submission_attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.care_plans(id) on delete cascade,
  submission_id uuid not null references public.care_submissions(id) on delete cascade,
  task_id uuid references public.care_tasks(id) on delete set null,
  position smallint not null check (position between 0 and 2),
  object_path text not null unique check (char_length(object_path) between 1 and 500),
  content_type text not null default 'image/webp' check (content_type = 'image/webp'),
  byte_size integer not null check (byte_size between 1 and 2097152),
  width integer not null check (width between 1 and 1600),
  height integer not null check (height between 1 and 1600),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (submission_id, position),
  unique (submission_id, content_sha256)
);

create index if not exists care_submission_attachments_owner_plan_idx
  on public.care_submission_attachments (owner_id, plan_id, created_at desc);

alter table public.care_submission_attachments enable row level security;

revoke all on public.care_submission_attachments from anon, authenticated;
grant select on public.care_submission_attachments to authenticated;
grant all on public.care_submission_attachments to service_role;

create policy "Owners can read their care evidence metadata"
  on public.care_submission_attachments
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'care-evidence',
  'care-evidence',
  false,
  2097152,
  array['image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated storage.objects policy is intentional. All object
-- writes and reads go through server routes after product-level authorization.
