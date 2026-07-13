-- GNE-288 PRODUCT-04R: keep mutable cat profiles out of immutable plan history.
-- Owner-facing delete is a tombstone. Physical purge is a separate, gated
-- lifecycle operation and is intentionally not implemented here.

alter table public.cats
  add column if not exists deleted_at timestamptz;

create index if not exists cats_owner_active_created_idx
  on public.cats (owner_id, created_at desc)
  where deleted_at is null;

alter table public.care_plans
  drop constraint if exists care_plans_cat_id_fkey;

alter table public.care_plans
  alter column cat_id drop not null;

alter table public.care_plans
  add constraint care_plans_cat_id_fkey
  foreign key (cat_id)
  references public.cats(id)
  on delete set null;

alter table public.audit_events
  drop constraint if exists audit_events_event_name_check,
  add constraint audit_events_event_name_check check (
    event_name in (
      'care_plan_published',
      'share_link_created',
      'share_link_revoked',
      'share_page_viewed',
      'invalid_or_revoked_token_rejected',
      'care_submission_created',
      'owner_boundary_denied',
      'cat_profile_archived'
    )
  ),
  drop constraint if exists audit_events_resource_type_check,
  add constraint audit_events_resource_type_check check (
    resource_type in ('care_plan', 'cat_profile')
  );

create table if not exists public.care_plan_cats (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.care_plans(id) on delete cascade,
  cat_id uuid references public.cats(id) on delete set null,
  cat_name_snapshot text not null
    check (char_length(cat_name_snapshot) between 1 and 80),
  cat_deleted_at timestamptz,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (plan_id, sort_order)
);

create unique index if not exists care_plan_cats_plan_cat_idx
  on public.care_plan_cats (plan_id, cat_id)
  where cat_id is not null;

create index if not exists care_plan_cats_cat_id_idx
  on public.care_plan_cats (cat_id, plan_id);

with plan_participant_source as (
  select
    care_plans.id as plan_id,
    care_plans.owner_id,
    care_plans.cat_id as fallback_cat_id,
    care_plans.created_at,
    case
      when jsonb_typeof(care_plans.ai_input_summary -> 'cat_ids') = 'array'
        and jsonb_array_length(care_plans.ai_input_summary -> 'cat_ids') > 0
        then care_plans.ai_input_summary -> 'cat_ids'
      else jsonb_build_array(care_plans.cat_id::text)
    end as cat_ids,
    case
      when jsonb_typeof(care_plans.ai_input_summary -> 'cat_names') = 'array'
        then care_plans.ai_input_summary -> 'cat_names'
      else '[]'::jsonb
    end as cat_names
  from public.care_plans
),
expanded_participants as (
  select
    source.plan_id,
    source.owner_id,
    ids.cat_id_text,
    names.cat_name,
    ids.ordinality - 1 as sort_order,
    source.created_at
  from plan_participant_source as source
  cross join lateral jsonb_array_elements_text(source.cat_ids)
    with ordinality as ids(cat_id_text, ordinality)
  left join lateral (
    select named.cat_name
    from jsonb_array_elements_text(source.cat_names)
      with ordinality as named(cat_name, ordinality)
    where named.ordinality = ids.ordinality
  ) as names on true
)
insert into public.care_plan_cats (
  plan_id,
  cat_id,
  cat_name_snapshot,
  cat_deleted_at,
  sort_order
)
select
  participant.plan_id,
  cats.id,
  coalesce(nullif(btrim(participant.cat_name), ''), cats.name, '已删除猫咪'),
  case
    when cats.id is null then statement_timestamp()
    else cats.deleted_at
  end,
  participant.sort_order
from expanded_participants as participant
left join public.cats
  on cats.id::text = participant.cat_id_text
 and cats.owner_id = participant.owner_id
on conflict (plan_id, sort_order) do nothing;

-- Existing public URLs stop being bearer-style permanent access. Active cat
-- photos are served through an authenticated application route instead.
update storage.buckets
set public = false
where id = 'cat-photos';

drop policy if exists "Owners can read their cat photos" on storage.objects;
create policy "Owners can read active cat photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.cats
      where cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
        and (
          cats.photo_url = storage.objects.name
          or right(
            cats.photo_url,
            char_length('/cat-photos/' || storage.objects.name)
          ) = '/cat-photos/' || storage.objects.name
        )
    )
  );

drop policy if exists "Owners can update their cat photos" on storage.objects;
create policy "Owners can update their active cat photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.cats
      where cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
        and (
          cats.photo_url = storage.objects.name
          or right(
            cats.photo_url,
            char_length('/cat-photos/' || storage.objects.name)
          ) = '/cat-photos/' || storage.objects.name
        )
    )
  )
  with check (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.cats
      where cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
        and (
          cats.photo_url = storage.objects.name
          or right(
            cats.photo_url,
            char_length('/cat-photos/' || storage.objects.name)
          ) = '/cat-photos/' || storage.objects.name
        )
    )
  );

drop policy if exists "Owners can delete their cat photos" on storage.objects;
create policy "Owners can delete their active cat photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.cats
      where cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
        and (
          cats.photo_url = storage.objects.name
          or right(
            cats.photo_url,
            char_length('/cat-photos/' || storage.objects.name)
          ) = '/cat-photos/' || storage.objects.name
        )
    )
  );

alter table public.care_plan_cats enable row level security;

revoke all on public.care_plan_cats from anon, authenticated;
grant select, insert on public.care_plan_cats to authenticated;
grant all on public.care_plan_cats to service_role;

create policy "Owners can read their care plan cats"
  on public.care_plan_cats
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_plan_cats.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can insert active care plan cats"
  on public.care_plan_cats
  for insert
  to authenticated
  with check (
    cat_id is not null
    and cat_deleted_at is null
    and exists (
      select 1
      from public.care_plans
      where care_plans.id = care_plan_cats.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.cats
      where cats.id = care_plan_cats.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
        and cats.name = care_plan_cats.cat_name_snapshot
    )
  );

-- Plan creation/publishing and cat archival must serialize on the same cat
-- rows. RLS alone checks a statement snapshot but does not close the race with
-- a concurrent archival transaction.
create or replace function public.lock_active_care_plan_cats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_cat_count integer;
  participant_count integer;
begin
  if tg_op = 'INSERT' and new.status <> 'draft' then
    raise check_violation using message = 'A care plan must be created as a draft.';
  end if;

  if new.status not in ('draft', 'published') then
    return new;
  end if;

  if new.cat_id is null then
    raise check_violation using message = 'An active care plan requires an active primary cat.';
  end if;

  perform 1
  from public.cats
  where cats.id = new.cat_id
    and cats.owner_id = new.owner_id
    and cats.deleted_at is null
  for key share;

  if not found then
    raise check_violation using message = 'The primary cat is no longer active.';
  end if;

  if tg_op = 'UPDATE' and new.status = 'published' then
    select count(*)
    into participant_count
    from public.care_plan_cats
    where care_plan_cats.plan_id = new.id;

    select count(*)
    into locked_cat_count
    from (
      select cats.id
      from public.care_plan_cats
      join public.cats on cats.id = care_plan_cats.cat_id
      where care_plan_cats.plan_id = new.id
        and care_plan_cats.cat_deleted_at is null
        and cats.owner_id = new.owner_id
        and cats.deleted_at is null
      for key share of cats
    ) as locked_cats;

    if participant_count = 0 or locked_cat_count <> participant_count then
      raise check_violation using message = 'Every published plan participant must still be active.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.lock_active_care_plan_cats() from public;

drop trigger if exists lock_active_care_plan_cats on public.care_plans;
create trigger lock_active_care_plan_cats
  before insert or update of cat_id, status on public.care_plans
  for each row
  execute function public.lock_active_care_plan_cats();

create or replace function public.lock_active_care_plan_participant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  plan_owner_id uuid;
  locked_cat_name text;
begin
  select care_plans.owner_id
  into plan_owner_id
  from public.care_plans
  where care_plans.id = new.plan_id;

  if not found then
    raise foreign_key_violation using message = 'Care plan not found.';
  end if;

  select cats.name
  into locked_cat_name
  from public.cats
  where cats.id = new.cat_id
    and cats.owner_id = plan_owner_id
    and cats.deleted_at is null
  for key share;

  if not found or locked_cat_name <> new.cat_name_snapshot then
    raise check_violation using message = 'Plan participant must reference an active same-owner cat snapshot.';
  end if;

  return new;
end;
$$;

revoke all on function public.lock_active_care_plan_participant() from public;

drop trigger if exists lock_active_care_plan_participant on public.care_plan_cats;
create trigger lock_active_care_plan_participant
  before insert or update of plan_id, cat_id, cat_name_snapshot
  on public.care_plan_cats
  for each row
  execute function public.lock_active_care_plan_participant();

create or replace function public.mark_deleted_cat_plan_participants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.deleted_at is null and new.deleted_at is not null then
    update public.care_plan_cats
    set cat_deleted_at = new.deleted_at
    where cat_id = new.id
      and cat_deleted_at is null;

    -- The relational participant snapshot is the durable history boundary.
    -- Clear mutable single-cat references so a reviewed plan can still be
    -- closed after its former primary cat has been archived.
    update public.care_plans
    set cat_id = null,
        routine_id = null
    where cat_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function public.mark_deleted_cat_plan_participants() from public;

drop trigger if exists mark_deleted_cat_plan_participants on public.cats;
create trigger mark_deleted_cat_plan_participants
  after update of deleted_at on public.cats
  for each row
  execute function public.mark_deleted_cat_plan_participants();

create or replace function public.soft_delete_cat_profile(target_cat_id uuid)
returns table (
  outcome text,
  deleted_at timestamptz,
  blocking_plan_id uuid,
  blocking_reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  current_deleted_at timestamptz;
  tombstone_at timestamptz := statement_timestamp();
  blocked_plan_id uuid;
  blocked_reason text;
begin
  if caller_id is null then
    raise insufficient_privilege using message = 'Authentication required.';
  end if;

  select cats.deleted_at
  into current_deleted_at
  from public.cats
  where cats.id = target_cat_id
    and cats.owner_id = caller_id
  for update;

  if not found then
    return query select 'not_found'::text, null::timestamptz, null::uuid, null::text;
    return;
  end if;

  if current_deleted_at is not null then
    return query select 'already_deleted'::text, current_deleted_at, null::uuid, null::text;
    return;
  end if;

  select
    care_plans.id,
    case
      when care_plans.status = 'published' then 'published_plan'
      when care_plans.status = 'draft' then 'draft_plan'
      else 'active_share_link'
    end
  into blocked_plan_id, blocked_reason
  from public.care_plans
  where care_plans.owner_id = caller_id
    and (
      care_plans.cat_id = target_cat_id
      or exists (
        select 1
        from public.care_plan_cats
        where care_plan_cats.plan_id = care_plans.id
          and care_plan_cats.cat_id = target_cat_id
          and care_plan_cats.cat_deleted_at is null
      )
    )
    and (
      care_plans.status in ('draft', 'published')
      or exists (
        select 1
        from public.share_tokens
        where share_tokens.resource_type = 'care_plan'
          and share_tokens.resource_id = care_plans.id
          and share_tokens.owner_id = caller_id
          and share_tokens.revoked_at is null
          and share_tokens.expires_at > statement_timestamp()
      )
    )
  order by
    case care_plans.status
      when 'published' then 0
      when 'draft' then 1
      else 2
    end,
    care_plans.created_at asc
  limit 1;

  if blocked_plan_id is not null then
    return query
      select 'active_plan_conflict'::text, null::timestamptz, blocked_plan_id, blocked_reason;
    return;
  end if;

  update public.cats
  set deleted_at = tombstone_at
  where cats.id = target_cat_id
    and cats.owner_id = caller_id
    and cats.deleted_at is null;

  insert into public.audit_events (
    actor_type,
    correlation_id,
    event_data,
    event_name,
    idempotency_key,
    owner_id,
    resource_id,
    resource_type
  )
  values (
    'user',
    gen_random_uuid()::text,
    jsonb_build_object('deletion_mode', 'soft'),
    'cat_profile_archived',
    'cat-profile-archive:' || target_cat_id::text,
    caller_id,
    target_cat_id,
    'cat_profile'
  );

  return query select 'soft_deleted'::text, tombstone_at, null::uuid, null::text;
end;
$$;

revoke all on function public.soft_delete_cat_profile(uuid) from public, anon;
grant execute on function public.soft_delete_cat_profile(uuid) to authenticated;

-- Deleted cats and their mutable aggregate children are invisible through the
-- authenticated Data API. Immutable plan/task/submission history is governed
-- by plan ownership instead and remains readable.

drop policy if exists "Owners can read their cats" on public.cats;
create policy "Owners can read their active cats"
  on public.cats
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and deleted_at is null
  );

drop policy if exists "Owners can insert their cats" on public.cats;
create policy "Owners can insert active cats"
  on public.cats
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and deleted_at is null
  );

drop policy if exists "Owners can update their cats" on public.cats;
create policy "Owners can update their active cats"
  on public.cats
  for update
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and deleted_at is null
  )
  with check (
    (select auth.uid()) = owner_id
    and deleted_at is null
  );

drop policy if exists "Owners can delete their cats" on public.cats;
revoke delete on public.cats from authenticated;

drop policy if exists "Owners can insert their care plans" on public.care_plans;
create policy "Owners can insert active-cat care plans"
  on public.care_plans
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and status = 'draft'
    and cat_id is not null
    and exists (
      select 1
      from public.cats
      where cats.id = care_plans.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
    and (
      care_plans.routine_id is null
      or exists (
        select 1
        from public.care_routines
        where care_routines.id = care_plans.routine_id
          and care_routines.cat_id = care_plans.cat_id
          and care_routines.owner_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Owners can update their care plans" on public.care_plans;
create policy "Owners can update their current or historical care plans"
  on public.care_plans
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (
      cat_id is null
      or exists (
        select 1
        from public.cats
        where cats.id = care_plans.cat_id
          and cats.owner_id = (select auth.uid())
          and cats.deleted_at is null
      )
    )
    and (
      care_plans.routine_id is null
      or exists (
        select 1
        from public.care_routines
        where care_routines.id = care_plans.routine_id
          and care_routines.cat_id = care_plans.cat_id
          and care_routines.owner_id = (select auth.uid())
      )
    )
  );

drop policy if exists "Owners can read their care routines" on public.care_routines;
drop policy if exists "Owners can insert their care routines" on public.care_routines;
drop policy if exists "Owners can update their care routines" on public.care_routines;
drop policy if exists "Owners can delete their care routines" on public.care_routines;

create policy "Owners can read active-cat care routines"
  on public.care_routines for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can insert active-cat care routines"
  on public.care_routines for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can update active-cat care routines"
  on public.care_routines for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  )
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can delete active-cat care routines"
  on public.care_routines for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

drop policy if exists "Owners can read their care routine items" on public.care_routine_items;
drop policy if exists "Owners can insert their care routine items" on public.care_routine_items;
drop policy if exists "Owners can update their care routine items" on public.care_routine_items;
drop policy if exists "Owners can delete their care routine items" on public.care_routine_items;

create policy "Owners can read active-cat routine items"
  on public.care_routine_items for select to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      join public.cats on cats.id = care_routines.cat_id
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can insert active-cat routine items"
  on public.care_routine_items for insert to authenticated
  with check (
    exists (
      select 1
      from public.care_routines
      join public.cats on cats.id = care_routines.cat_id
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can update active-cat routine items"
  on public.care_routine_items for update to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      join public.cats on cats.id = care_routines.cat_id
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  )
  with check (
    exists (
      select 1
      from public.care_routines
      join public.cats on cats.id = care_routines.cat_id
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can delete active-cat routine items"
  on public.care_routine_items for delete to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      join public.cats on cats.id = care_routines.cat_id
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

drop policy if exists "Owners can read their care items" on public.care_items;
drop policy if exists "Owners can insert their care items" on public.care_items;
drop policy if exists "Owners can update their care items" on public.care_items;
drop policy if exists "Owners can delete their care items" on public.care_items;

create policy "Owners can read active-cat care items"
  on public.care_items for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can insert active-cat care items"
  on public.care_items for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can update active-cat care items"
  on public.care_items for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  )
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can delete active-cat care items"
  on public.care_items for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

drop policy if exists "Owners can read their care events" on public.care_events;
drop policy if exists "Owners can insert their care events" on public.care_events;
drop policy if exists "Owners can update their care events" on public.care_events;
drop policy if exists "Owners can delete their care events" on public.care_events;

create policy "Owners can read active-cat care events"
  on public.care_events for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can insert active-cat care events"
  on public.care_events for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can update active-cat care events"
  on public.care_events for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  )
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can delete active-cat care events"
  on public.care_events for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

drop policy if exists "Owners can read their cat item assignments" on public.cat_item_assignments;
drop policy if exists "Owners can insert their cat item assignments" on public.cat_item_assignments;
drop policy if exists "Owners can update their cat item assignments" on public.cat_item_assignments;
drop policy if exists "Owners can delete their cat item assignments" on public.cat_item_assignments;

create policy "Owners can read active-cat item assignments"
  on public.cat_item_assignments for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );

create policy "Owners can insert active-cat item assignments"
  on public.cat_item_assignments for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
    and exists (
      select 1 from public.owner_item_library
      where owner_item_library.id = cat_item_assignments.owner_item_id
        and owner_item_library.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update active-cat item assignments"
  on public.cat_item_assignments for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  )
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
    and exists (
      select 1 from public.owner_item_library
      where owner_item_library.id = cat_item_assignments.owner_item_id
        and owner_item_library.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete active-cat item assignments"
  on public.cat_item_assignments for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
        and cats.deleted_at is null
    )
  );
