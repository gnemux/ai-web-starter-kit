-- GNE-256: CatCare share token security model acceptance.
-- Run against the test Supabase database after migrations. The transaction
-- rolls back, so these fixed acceptance rows are not persisted.

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
  'share_tokens has RLS enabled',
  (
    select count(*)::bigint
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'share_tokens'
      and c.relrowsecurity
  ),
  1
);

select pg_temp.assert_eq(
  'share_tokens has no raw token column',
  (
    select count(*)::bigint
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'share_tokens'
      and column_name in ('token', 'raw_token', 'plain_token')
  ),
  0
);

select pg_temp.assert_eq(
  'share_tokens owner policies',
  (
    select count(*)::bigint
    from pg_policies
    where schemaname = 'public'
      and tablename = 'share_tokens'
      and roles = '{authenticated}'
  ),
  4
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
    '11000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-share-owner-a@example.test',
    '$2a$10$local.only.catcare.share.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'catcare-share-owner-b@example.test',
    '$2a$10$local.only.catcare.share.b',
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
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Owner A Cat', 'adult'),
  ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'Owner B Cat', 'adult');

insert into public.care_plans (id, owner_id, cat_id, title, status, start_on, end_on)
values
  ('71000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'Owner A plan', 'published', current_date, current_date + 1),
  ('71000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', 'Owner B plan', 'published', current_date, current_date + 1);

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
  ('a1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'care_plan', '71000000-0000-0000-0000-000000000001', 'owner-a-token-hash-0000000000000000', 'care_plan', now() + interval '7 days'),
  ('a1000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'care_plan', '71000000-0000-0000-0000-000000000002', 'owner-b-token-hash-0000000000000000', 'care_plan', now() + interval '7 days');

select pg_temp.expect_reject('duplicate token hash is rejected', $sql$
  insert into public.share_tokens (
    owner_id,
    resource_type,
    resource_id,
    token_hash,
    scope,
    expires_at
  )
  values (
    '11000000-0000-0000-0000-000000000001',
    'care_plan',
    '71000000-0000-0000-0000-000000000001',
    'owner-a-token-hash-0000000000000000',
    'care_plan',
    now() + interval '7 days'
  )
$sql$);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);

select pg_temp.assert_eq('owner A can read own share token', (select count(*)::bigint from public.share_tokens), 1);
select pg_temp.assert_eq('owner A cannot read owner B share token', (select count(*)::bigint from public.share_tokens where id = 'a1000000-0000-0000-0000-000000000002'), 0);

select pg_temp.expect_reject('owner A cannot insert share token for owner B plan', $sql$
  insert into public.share_tokens (
    owner_id,
    resource_type,
    resource_id,
    token_hash,
    scope,
    expires_at
  )
  values (
    '11000000-0000-0000-0000-000000000001',
    'care_plan',
    '71000000-0000-0000-0000-000000000002',
    'blocked-cross-plan-hash-000000000000',
    'care_plan',
    now() + interval '7 days'
  )
$sql$);

select pg_temp.assert_affected(
  'owner A revoke owner B token affects zero rows',
  $sql$
    update public.share_tokens
    set revoked_at = now()
    where id = 'a1000000-0000-0000-0000-000000000002'
  $sql$,
  0
);

reset role;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select pg_temp.expect_reject('anon cannot read raw share token rows', 'select count(*) from public.share_tokens');
select pg_temp.expect_reject('anon cannot write share token rows', $$insert into public.share_tokens (owner_id, resource_type, resource_id, token_hash, scope, expires_at) values ('11000000-0000-0000-0000-000000000001', 'care_plan', '71000000-0000-0000-0000-000000000001', 'blocked-anon-hash-000000000000000', 'care_plan', now() + interval '7 days')$$);

reset role;
rollback;
