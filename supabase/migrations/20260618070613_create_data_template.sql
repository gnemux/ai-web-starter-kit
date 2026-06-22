-- M2 DATA: minimum reusable data model and RLS template.
-- Keep all schema changes in Git migrations. Do not mirror this manually in
-- shared staging or production dashboards.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

grant select, insert, update
  on public.user_profiles
  to authenticated;

grant all
  on public.user_profiles
  to service_role;

create policy "Users can read their own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.demo_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  notes text check (notes is null or char_length(notes) <= 2000),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.set_updated_at();

create trigger set_demo_items_updated_at
  before update on public.demo_items
  for each row
  execute function public.set_updated_at();

create index if not exists demo_items_owner_id_idx
  on public.demo_items (owner_id);

create index if not exists demo_items_visibility_idx
  on public.demo_items (visibility);

alter table public.demo_items enable row level security;

grant select, insert, update, delete
  on public.demo_items
  to authenticated;

grant all
  on public.demo_items
  to service_role;

create policy "Users can read their own demo items"
  on public.demo_items
  for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "Authenticated users can read public demo items"
  on public.demo_items
  for select
  to authenticated
  using (visibility = 'public');

create policy "Users can insert their own demo items"
  on public.demo_items
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Users can update their own demo items"
  on public.demo_items
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own demo items"
  on public.demo_items
  for delete
  to authenticated
  using (auth.uid() = owner_id);
