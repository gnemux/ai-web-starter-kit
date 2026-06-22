-- M2 DATA hardening: satisfy Supabase advisors for function search_path and
-- RLS policy init plans after applying the baseline data template.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "Users can read their own profile"
  on public.user_profiles;

drop policy if exists "Users can insert their own profile"
  on public.user_profiles;

drop policy if exists "Users can update their own profile"
  on public.user_profiles;

create policy "Users can read their own profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own demo items"
  on public.demo_items;

drop policy if exists "Authenticated users can read public demo items"
  on public.demo_items;

drop policy if exists "Users can insert their own demo items"
  on public.demo_items;

drop policy if exists "Users can update their own demo items"
  on public.demo_items;

drop policy if exists "Users can delete their own demo items"
  on public.demo_items;

create policy "Users can read allowed demo items"
  on public.demo_items
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or visibility = 'public'
  );

create policy "Users can insert their own demo items"
  on public.demo_items
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Users can update their own demo items"
  on public.demo_items
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own demo items"
  on public.demo_items
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
  end if;
end;
$$;
