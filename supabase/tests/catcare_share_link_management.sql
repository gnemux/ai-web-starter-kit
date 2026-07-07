-- GNE-279: owner-side share link management acceptance.
-- Run against the test Supabase database. The transaction rolls back, so these
-- fixed acceptance rows are not persisted.

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
    '12000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-share-management-owner-a@example.test',
    '$2a$10$local.only.catcare.management.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '12000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-share-management-owner-b@example.test',
    '$2a$10$local.only.catcare.management.b',
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
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Owner A Cat', 'adult'),
  ('22000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000002', 'Owner B Cat', 'adult');

insert into public.care_plans (id, owner_id, cat_id, title, status, start_on, end_on)
values
  ('72000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Owner A published plan', 'published', current_date, current_date + 1),
  ('72000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Owner A draft plan', 'draft', current_date, current_date + 1),
  ('72000000-0000-0000-0000-000000000003', '12000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000002', 'Owner B published plan', 'published', current_date, current_date + 1);

insert into public.share_tokens (
  id,
  owner_id,
  resource_type,
  resource_id,
  token_hash,
  scope,
  expires_at
)
values (
  'b1000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000001',
  'care_plan',
  '72000000-0000-0000-0000-000000000001',
  'management-owner-a-first-hash-000000000',
  'care_plan',
  now() + interval '14 days'
);

update public.share_tokens
set revoked_at = now()
where owner_id = '12000000-0000-0000-0000-000000000001'
  and resource_type = 'care_plan'
  and resource_id = '72000000-0000-0000-0000-000000000001'
  and scope = 'care_plan'
  and revoked_at is null;

insert into public.share_tokens (
  id,
  owner_id,
  resource_type,
  resource_id,
  token_hash,
  scope,
  expires_at
)
values (
  'b1000000-0000-0000-0000-000000000002',
  '12000000-0000-0000-0000-000000000001',
  'care_plan',
  '72000000-0000-0000-0000-000000000001',
  'management-owner-a-second-hash-00000000',
  'care_plan',
  now() + interval '14 days'
);

select pg_temp.assert_eq(
  'regenerate leaves one active owner token',
  (
    select count(*)::bigint
    from public.share_tokens
    where owner_id = '12000000-0000-0000-0000-000000000001'
      and resource_type = 'care_plan'
      and resource_id = '72000000-0000-0000-0000-000000000001'
      and scope = 'care_plan'
      and revoked_at is null
  ),
  1
);

select pg_temp.assert_eq(
  'raw token columns are absent',
  (
    select count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'share_tokens'
      and column_name in ('token', 'raw_token', 'plain_token')
  ),
  0
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000002', true);

select pg_temp.assert_eq(
  'owner B cannot read owner A share tokens',
  (
    select count(*)::bigint
    from public.share_tokens
    where resource_id = '72000000-0000-0000-0000-000000000001'
  ),
  0
);

select pg_temp.assert_affected(
  'owner B revoke owner A token affects zero rows',
  $sql$
    update public.share_tokens
    set revoked_at = now()
    where resource_id = '72000000-0000-0000-0000-000000000001'
  $sql$,
  0
);

select pg_temp.expect_reject('owner B cannot insert token for owner A plan', $sql$
  insert into public.share_tokens (
    owner_id,
    resource_type,
    resource_id,
    token_hash,
    scope,
    expires_at
  )
  values (
    '12000000-0000-0000-0000-000000000002',
    'care_plan',
    '72000000-0000-0000-0000-000000000001',
    'management-cross-owner-hash-000000000',
    'care_plan',
    now() + interval '14 days'
  )
$sql$);

select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);

select pg_temp.expect_reject('owner A cannot insert token for draft plan', $sql$
  insert into public.share_tokens (
    owner_id,
    resource_type,
    resource_id,
    token_hash,
    scope,
    expires_at
  )
  values (
    '12000000-0000-0000-0000-000000000001',
    'care_plan',
    '72000000-0000-0000-0000-000000000002',
    'management-draft-plan-hash-0000000000',
    'care_plan',
    now() + interval '14 days'
  )
$sql$);

select pg_temp.assert_affected(
  'owner A can revoke current active token',
  $sql$
    update public.share_tokens
    set revoked_at = now()
    where resource_id = '72000000-0000-0000-0000-000000000001'
      and revoked_at is null
  $sql$,
  1
);

reset role;
rollback;
