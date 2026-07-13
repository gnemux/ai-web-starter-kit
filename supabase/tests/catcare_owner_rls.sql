-- GNE-254: CatCare owner-only RLS acceptance.
-- Run against a local Supabase database after migrations. The transaction
-- rolls back, so these fixed local-only test rows are not persisted.

begin;

create or replace function pg_temp.assert_eq(label text, actual bigint, expected bigint)
returns void
language plpgsql
as $$
begin
  if actual is distinct from expected then
    raise exception '% expected %, got %', label, expected, actual;
  end if;
end;
$$;

create or replace function pg_temp.expect_reject(label text, statement text)
returns void
language plpgsql
security invoker
as $$
begin
  execute statement;
  raise exception '% unexpectedly succeeded', label;
exception
  when insufficient_privilege or check_violation or foreign_key_violation or with_check_option_violation then
    return;
end;
$$;

create or replace function pg_temp.assert_affected(label text, statement text, expected bigint)
returns void
language plpgsql
security invoker
as $$
declare
  affected bigint;
begin
  execute statement;
  get diagnostics affected = row_count;
  if affected is distinct from expected then
    raise exception '% expected % affected rows, got %', label, expected, affected;
  end if;
end;
$$;

select pg_temp.assert_eq(
  'CatCare tables with RLS enabled',
  (
    select count(*)::bigint
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'cats',
        'care_routines',
        'care_routine_items',
        'care_items',
        'care_events',
        'care_plans',
        'care_tasks',
        'care_submissions'
      )
      and c.relrowsecurity
  ),
  8
);

select pg_temp.assert_eq(
  'CatCare owner policies',
  (
    select count(*)::bigint
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'cats',
        'care_routines',
        'care_routine_items',
        'care_items',
        'care_events',
        'care_plans',
        'care_tasks',
        'care_submissions'
      )
      and roles = '{authenticated}'
  ),
  31
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-rls-owner-a@example.test',
    '$2a$10$local.only.catcare.rls.acceptance.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-rls-owner-b@example.test',
    '$2a$10$local.only.catcare.rls.acceptance.b',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

insert into public.cats (id, owner_id, name, life_stage)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Owner A Cat', 'adult'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Owner B Cat', 'adult');

insert into public.care_routines (id, owner_id, cat_id, title)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Owner A routine'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Owner B routine');

insert into public.care_routine_items (id, routine_id, category, title)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'meal', 'Owner A breakfast'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'meal', 'Owner B breakfast');

insert into public.care_items (id, owner_id, cat_id, item_type, name)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'dry_food', 'Owner A food'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'dry_food', 'Owner B food');

insert into public.care_events (id, owner_id, cat_id, event_type, title, occurred_on)
values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'health', 'Owner A check', current_date),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'health', 'Owner B check', current_date);

insert into public.care_plans (id, owner_id, cat_id, routine_id, title, status, start_on, end_on)
values
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Owner A plan', 'draft', current_date, current_date + 1),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Owner B plan', 'draft', current_date, current_date + 1);

insert into public.care_plan_cats (plan_id, cat_id, cat_name_snapshot, sort_order)
values
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Owner A Cat', 0),
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Owner B Cat', 0);

update public.care_plans
set status = 'published', published_at = now();

insert into public.care_tasks (id, plan_id, category, title)
values
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'meal', 'Owner A task'),
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'meal', 'Owner B task');

insert into public.care_submissions (id, owner_id, plan_id, task_id, submitted_by_label, status)
values
  ('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Owner A sitter', 'completed'),
  ('90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', 'Owner B sitter', 'completed');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select pg_temp.assert_eq('owner A can read own cats', (select count(*)::bigint from public.cats), 1);
select pg_temp.assert_eq('owner A can read own routines', (select count(*)::bigint from public.care_routines), 1);
select pg_temp.assert_eq('owner A can read own routine items', (select count(*)::bigint from public.care_routine_items), 1);
select pg_temp.assert_eq('owner A can read own care items', (select count(*)::bigint from public.care_items), 1);
select pg_temp.assert_eq('owner A can read own care events', (select count(*)::bigint from public.care_events), 1);
select pg_temp.assert_eq('owner A can read own care plans', (select count(*)::bigint from public.care_plans), 1);
select pg_temp.assert_eq('owner A can read own care tasks', (select count(*)::bigint from public.care_tasks), 1);
select pg_temp.assert_eq('owner A can read own care submissions', (select count(*)::bigint from public.care_submissions), 1);

select pg_temp.assert_eq('owner A cannot read owner B cat', (select count(*)::bigint from public.cats where id = '20000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B routine', (select count(*)::bigint from public.care_routines where id = '30000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B routine item', (select count(*)::bigint from public.care_routine_items where id = '40000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B care item', (select count(*)::bigint from public.care_items where id = '50000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B event', (select count(*)::bigint from public.care_events where id = '60000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B plan', (select count(*)::bigint from public.care_plans where id = '70000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B task', (select count(*)::bigint from public.care_tasks where id = '80000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A cannot read owner B submission', (select count(*)::bigint from public.care_submissions where id = '90000000-0000-0000-0000-000000000002'), 0);

select pg_temp.expect_reject('owner A cannot insert cat for owner B', $sql$
  insert into public.cats (owner_id, name) values ('10000000-0000-0000-0000-000000000002', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert routine for owner B cat', $sql$
  insert into public.care_routines (owner_id, cat_id, title)
  values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert routine item for owner B routine', $sql$
  insert into public.care_routine_items (routine_id, category, title)
  values ('30000000-0000-0000-0000-000000000002', 'meal', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert care item for owner B cat', $sql$
  insert into public.care_items (owner_id, cat_id, item_type, name)
  values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'dry_food', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert event for owner B cat', $sql$
  insert into public.care_events (owner_id, cat_id, event_type, title, occurred_on)
  values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'health', 'blocked', current_date)
$sql$);
select pg_temp.expect_reject('owner A cannot insert plan for owner B cat', $sql$
  insert into public.care_plans (owner_id, cat_id, title)
  values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert task for owner B plan', $sql$
  insert into public.care_tasks (plan_id, category, title)
  values ('70000000-0000-0000-0000-000000000002', 'meal', 'blocked')
$sql$);
select pg_temp.expect_reject('owner A cannot insert submission for owner B plan', $sql$
  insert into public.care_submissions (owner_id, plan_id, submitted_by_label, status)
  values ('10000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'blocked', 'completed')
$sql$);

select pg_temp.assert_affected(
  'owner A update owner B cat affects zero rows',
  $sql$
    update public.cats
    set notes = 'blocked'
    where id = '20000000-0000-0000-0000-000000000002'
  $sql$,
  0
);

reset role;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select pg_temp.expect_reject('anon cannot read CatCare owner tables', 'select count(*) from public.cats');
select pg_temp.expect_reject('anon cannot write CatCare owner tables', $$insert into public.cats (owner_id, name) values ('10000000-0000-0000-0000-000000000001', 'blocked')$$);

reset role;
rollback;
