-- GNE-256: ACCESS share token security model.
-- Raw tokens are never stored; anonymous routes validate a hash through the
-- server-side token gate before loading minimum scoped data.

create table if not exists public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('care_plan')),
  resource_id uuid not null references public.care_plans(id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) between 32 and 160),
  scope text not null check (scope in ('care_plan')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (revoked_at is null or revoked_at >= created_at),
  check (expires_at > created_at)
);

create trigger set_share_tokens_updated_at
  before update on public.share_tokens
  for each row
  execute function public.set_updated_at();

create index if not exists share_tokens_owner_id_idx
  on public.share_tokens (owner_id);

create index if not exists share_tokens_resource_idx
  on public.share_tokens (resource_type, resource_id);

create index if not exists share_tokens_active_hash_idx
  on public.share_tokens (token_hash)
  where revoked_at is null;

alter table public.share_tokens enable row level security;

grant select, insert, update, delete
  on public.share_tokens
  to authenticated;

grant all
  on public.share_tokens
  to service_role;

create policy "Owners can read their share tokens"
  on public.share_tokens
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their share tokens"
  on public.share_tokens
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and resource_type = 'care_plan'
    and scope = 'care_plan'
    and exists (
      select 1
      from public.care_plans
      where care_plans.id = share_tokens.resource_id
        and care_plans.owner_id = (select auth.uid())
        and care_plans.status = 'published'
    )
  );

create policy "Owners can update their share tokens"
  on public.share_tokens
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and resource_type = 'care_plan'
    and scope = 'care_plan'
    and exists (
      select 1
      from public.care_plans
      where care_plans.id = share_tokens.resource_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their share tokens"
  on public.share_tokens
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
