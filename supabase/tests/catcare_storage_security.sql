begin;

create or replace function pg_temp.assert_eq(
  label text,
  actual bigint,
  expected bigint
)
returns void
language plpgsql
as $$
begin
  if actual <> expected then
    raise exception '%: expected %, got %', label, expected, actual;
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
    raise exception '%: expected % affected rows, got %', label, expected, affected;
  end if;
end;
$$;

select pg_temp.assert_eq(
  'cat photo bucket remains public for known object URLs',
  (
    select count(*)
    from storage.buckets
    where id = 'cat-photos'
      and public = true
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  ),
  1
);

select pg_temp.assert_eq(
  'public bucket has no broad listing policy',
  (
    select count(*)
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Cat photos are publicly readable'
  ),
  0
);

select pg_temp.assert_eq(
  'owner write policies remain present',
  (
    select count(*)
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'Owners can upload their cat photos',
        'Owners can update their cat photos',
        'Owners can delete their cat photos'
      )
      and roles = array['authenticated']::name[]
  ),
  3
);

select pg_temp.assert_eq(
  'authenticated owners have a folder-scoped read policy',
  (
    select count(*)
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Owners can read their cat photos'
      and roles = array['authenticated']::name[]
      and cmd = 'SELECT'
      and qual like '%foldername%'
      and qual like '%auth.uid%'
  ),
  1
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
    '14000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne271-storage-owner-a@example.test',
    '$2a$10$linked.only.catcare.storage.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '14000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne271-storage-owner-b@example.test',
    '$2a$10$linked.only.catcare.storage.b',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  (
    'cat-photos',
    '14000000-0000-0000-0000-000000000001/owner-a.webp',
    '14000000-0000-0000-0000-000000000001',
    '{}'::jsonb
  ),
  (
    'cat-photos',
    '14000000-0000-0000-0000-000000000002/owner-b.webp',
    '14000000-0000-0000-0000-000000000002',
    '{}'::jsonb
  );

set local role anon;

select pg_temp.assert_eq(
  'anonymous clients cannot enumerate public cat photos',
  (select count(*) from storage.objects where bucket_id = 'cat-photos'),
  0
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '14000000-0000-0000-0000-000000000001', true);
-- Supabase Storage API enables this transaction-local guard before deleting
-- object metadata. Direct SQL deletion is otherwise intentionally rejected.
select set_config('storage.allow_delete_query', 'true', true);

select pg_temp.assert_eq(
  'owner can read only their own photo rows',
  (select count(*) from storage.objects where bucket_id = 'cat-photos'),
  1
);

select pg_temp.assert_affected(
  'owner can update their own photo row',
  $$update storage.objects
    set user_metadata = '{"probe":"owner-a"}'::jsonb
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/owner-a.webp'$$,
  1
);

select pg_temp.assert_affected(
  'owner cannot update another owner photo row',
  $$update storage.objects
    set user_metadata = '{"probe":"cross-owner"}'::jsonb
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000002/owner-b.webp'$$,
  0
);

select pg_temp.assert_affected(
  'owner cannot delete another owner photo row',
  $$delete from storage.objects
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000002/owner-b.webp'$$,
  0
);

insert into storage.objects (bucket_id, name, owner_id, metadata)
values (
  'cat-photos',
  '14000000-0000-0000-0000-000000000001/new-owner-a.webp',
  '14000000-0000-0000-0000-000000000001',
  '{}'::jsonb
);

select pg_temp.expect_reject(
  'owner cannot upload into another owner folder',
  $$insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'cat-photos',
      '14000000-0000-0000-0000-000000000002/cross-owner.webp',
      '14000000-0000-0000-0000-000000000001',
      '{}'::jsonb
    )$$
);

select pg_temp.assert_affected(
  'owner can delete their own photo row',
  $$delete from storage.objects
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/owner-a.webp'$$,
  1
);

reset role;

rollback;
