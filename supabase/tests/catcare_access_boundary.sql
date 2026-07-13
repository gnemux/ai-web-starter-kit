-- GNE-259: CatCare owner and anonymous access boundary acceptance.
-- Run against the linked test Supabase database after migrations. The
-- transaction rolls back, so these fixed acceptance rows are not persisted.

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
  when insufficient_privilege or check_violation or foreign_key_violation or unique_violation or with_check_option_violation then
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
  'CatCare owner tables have RLS enabled',
  (
    select count(*)::bigint
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'cats',
        'care_plans',
        'care_tasks',
        'care_submissions',
        'share_tokens'
      )
      and c.relrowsecurity
  ),
  5
);

select pg_temp.assert_eq(
  'share_tokens stores only token hash',
  (
    select count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'share_tokens'
      and column_name in ('token', 'raw_token', 'plain_token')
  ),
  0
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
    '13000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne259-owner-a@example.test',
    '$2a$10$linked.only.catcare.access.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '13000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne259-owner-b@example.test',
    '$2a$10$linked.only.catcare.access.b',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

insert into public.cats (id, owner_id, name, life_stage, notes, safety_notes)
values
  (
    '23000000-0000-0000-0000-000000000001',
    '13000000-0000-0000-0000-000000000001',
    'GNE259 Owner A Cat',
    'adult',
    'Owner A private note',
    'Owner A private safety note'
  ),
  (
    '23000000-0000-0000-0000-000000000002',
    '13000000-0000-0000-0000-000000000002',
    'GNE259 Owner B Cat',
    'adult',
    'Owner B private note',
    'Owner B private safety note'
  );

insert into public.care_plans (id, owner_id, cat_id, title, status, start_on, end_on)
values
  (
    '73000000-0000-0000-0000-000000000001',
    '13000000-0000-0000-0000-000000000001',
    '23000000-0000-0000-0000-000000000001',
    'GNE259 Owner A plan',
    'draft',
    current_date,
    current_date + 1
  ),
  (
    '73000000-0000-0000-0000-000000000002',
    '13000000-0000-0000-0000-000000000002',
    '23000000-0000-0000-0000-000000000002',
    'GNE259 Owner B plan',
    'draft',
    current_date,
    current_date + 1
  );

insert into public.care_plan_cats (plan_id, cat_id, cat_name_snapshot, sort_order)
values
  ('73000000-0000-0000-0000-000000000001', '23000000-0000-0000-0000-000000000001', 'GNE259 Owner A Cat', 0),
  ('73000000-0000-0000-0000-000000000002', '23000000-0000-0000-0000-000000000002', 'GNE259 Owner B Cat', 0);

update public.care_plans
set status = 'published', published_at = now();

insert into public.care_tasks (id, plan_id, category, title, instructions, required, enabled)
values
  (
    '83000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000001',
    'meal',
    'Owner A minimal task',
    'Owner A sitter instruction',
    true,
    true
  ),
  (
    '83000000-0000-0000-0000-000000000002',
    '73000000-0000-0000-0000-000000000002',
    'meal',
    'Owner B minimal task',
    'Owner B sitter instruction',
    true,
    true
  );

insert into public.care_submissions (
  id,
  owner_id,
  plan_id,
  task_id,
  submitted_by_label,
  status,
  note,
  abnormal,
  idempotency_key
)
values
  (
    '93000000-0000-0000-0000-000000000001',
    '13000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000001',
    '83000000-0000-0000-0000-000000000001',
    '照看者',
    'completed',
    'Owner A anonymous note',
    false,
    'anonymous:plan:2026-07-08:0830:gne259-owner-a'
  ),
  (
    '93000000-0000-0000-0000-000000000002',
    '13000000-0000-0000-0000-000000000002',
    '73000000-0000-0000-0000-000000000002',
    '83000000-0000-0000-0000-000000000002',
    '照看者',
    'completed',
    'Owner B anonymous note',
    false,
    'anonymous:plan:2026-07-08:0830:gne259-owner-b'
  );

insert into public.share_tokens (
  id,
  owner_id,
  resource_type,
  resource_id,
  token_hash,
  scope,
  expires_at
)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    '13000000-0000-0000-0000-000000000001',
    'care_plan',
    '73000000-0000-0000-0000-000000000001',
    'gne259-owner-a-token-hash-000000000',
    'care_plan',
    now() + interval '7 days'
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    '13000000-0000-0000-0000-000000000002',
    'care_plan',
    '73000000-0000-0000-0000-000000000002',
    'gne259-owner-b-token-hash-000000000',
    'care_plan',
    now() + interval '7 days'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '13000000-0000-0000-0000-000000000001', true);

select pg_temp.assert_eq('owner A can read own cat private row', (select count(*)::bigint from public.cats where notes = 'Owner A private note'), 1);
select pg_temp.assert_eq('owner A cannot read owner B cat private row', (select count(*)::bigint from public.cats where notes = 'Owner B private note'), 0);
select pg_temp.assert_eq('owner A can read own plan', (select count(*)::bigint from public.care_plans where id = '73000000-0000-0000-0000-000000000001'), 1);
select pg_temp.assert_eq('owner A cannot read owner B plan', (select count(*)::bigint from public.care_plans where id = '73000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A can read own task', (select count(*)::bigint from public.care_tasks where id = '83000000-0000-0000-0000-000000000001'), 1);
select pg_temp.assert_eq('owner A cannot read owner B task', (select count(*)::bigint from public.care_tasks where id = '83000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A can read own submission', (select count(*)::bigint from public.care_submissions where id = '93000000-0000-0000-0000-000000000001'), 1);
select pg_temp.assert_eq('owner A cannot read owner B submission', (select count(*)::bigint from public.care_submissions where id = '93000000-0000-0000-0000-000000000002'), 0);
select pg_temp.assert_eq('owner A can read own share token row', (select count(*)::bigint from public.share_tokens where id = 'c1000000-0000-0000-0000-000000000001'), 1);
select pg_temp.assert_eq('owner A cannot read owner B share token row', (select count(*)::bigint from public.share_tokens where id = 'c1000000-0000-0000-0000-000000000002'), 0);

select pg_temp.assert_affected(
  'owner A update owner B submission affects zero rows',
  $sql$
    update public.care_submissions
    set note = 'blocked'
    where id = '93000000-0000-0000-0000-000000000002'
  $sql$,
  0
);

select pg_temp.expect_reject('owner A cannot insert submission for owner B plan', $sql$
  insert into public.care_submissions (owner_id, plan_id, task_id, submitted_by_label, status)
  values (
    '13000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000002',
    '83000000-0000-0000-0000-000000000002',
    'blocked',
    'completed'
  )
$sql$);

reset role;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select pg_temp.expect_reject('anon cannot read cat private rows directly', 'select name, notes, safety_notes from public.cats');
select pg_temp.expect_reject('anon cannot read care plans directly', 'select id, title, handoff_notes from public.care_plans');
select pg_temp.expect_reject('anon cannot read care tasks directly', 'select id, title, instructions from public.care_tasks');
select pg_temp.expect_reject('anon cannot read care submissions directly', 'select id, note from public.care_submissions');
select pg_temp.expect_reject('anon cannot read share token rows directly', 'select id, token_hash from public.share_tokens');
select pg_temp.expect_reject('anon cannot write share token rows directly', $sql$
  insert into public.share_tokens (owner_id, resource_type, resource_id, token_hash, scope, expires_at)
  values (
    '13000000-0000-0000-0000-000000000001',
    'care_plan',
    '73000000-0000-0000-0000-000000000001',
    'blocked-anon-token-hash-0000000000',
    'care_plan',
    now() + interval '7 days'
  )
$sql$);
select pg_temp.expect_reject('anon cannot write care submissions directly', $sql$
  insert into public.care_submissions (owner_id, plan_id, task_id, submitted_by_label, status, note)
  values (
    '13000000-0000-0000-0000-000000000001',
    '73000000-0000-0000-0000-000000000001',
    '83000000-0000-0000-0000-000000000001',
    'blocked',
    'completed',
    'blocked direct anonymous write'
  )
$sql$);

reset role;
rollback;
