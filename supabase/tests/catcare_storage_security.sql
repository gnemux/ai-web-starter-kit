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
  'cat photo bucket is private and keeps upload limits',
  (
    select count(*)
    from storage.buckets
    where id = 'cat-photos'
      and public = false
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  ),
  1
);

select pg_temp.assert_eq(
  'cat photo policies include upload plus active-only read update and delete',
  (
    select count(*)
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'Owners can upload their cat photos',
        'Owners can read active cat photos',
        'Owners can update their active cat photos',
        'Owners can delete their active cat photos'
      )
      and roles = array['authenticated']::name[]
  ),
  4
);

select pg_temp.assert_eq(
  'read update and delete policies all require an active referenced cat',
  (
    select count(*)
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'Owners can read active cat photos',
        'Owners can update their active cat photos',
        'Owners can delete their active cat photos'
      )
      and coalesce(qual, '') like '%deleted_at IS NULL%'
      and coalesce(qual, '') like '%photo_url%'
  ),
  3
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
    'gne288-storage-owner-a@example.test',
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
    'gne288-storage-owner-b@example.test',
    '$2a$10$linked.only.catcare.storage.b',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.cats (id, owner_id, name, photo_url, deleted_at)
values
  (
    '24000000-0000-0000-0000-000000000001',
    '14000000-0000-0000-0000-000000000001',
    'Owner A Active Cat',
    '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000001.webp',
    null
  ),
  (
    '24000000-0000-0000-0000-000000000002',
    '14000000-0000-0000-0000-000000000001',
    'Owner A Archived Cat',
    '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000002.webp',
    now()
  ),
  (
    '24000000-0000-0000-0000-000000000003',
    '14000000-0000-0000-0000-000000000002',
    'Owner B Active Cat',
    '14000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000003.webp',
    null
  );

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  (
    'cat-photos',
    '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000001.webp',
    '14000000-0000-0000-0000-000000000001',
    '{}'::jsonb
  ),
  (
    'cat-photos',
    '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000002.webp',
    '14000000-0000-0000-0000-000000000001',
    '{}'::jsonb
  ),
  (
    'cat-photos',
    '14000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000003.webp',
    '14000000-0000-0000-0000-000000000002',
    '{}'::jsonb
  );

set local role anon;

select pg_temp.assert_eq(
  'anonymous clients cannot enumerate private cat photos',
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
  'owner can read only the photo referenced by their active cat',
  (select count(*) from storage.objects where bucket_id = 'cat-photos'),
  1
);

select pg_temp.assert_affected(
  'owner can update their active cat photo row',
  $$update storage.objects
    set user_metadata = '{"probe":"owner-a"}'::jsonb
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000001.webp'$$,
  1
);

select pg_temp.assert_affected(
  'owner cannot update their archived cat photo row',
  $$update storage.objects
    set user_metadata = '{"probe":"archived"}'::jsonb
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000002.webp'$$,
  0
);

select pg_temp.assert_affected(
  'owner cannot update another owner photo row',
  $$update storage.objects
    set user_metadata = '{"probe":"cross-owner"}'::jsonb
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000003.webp'$$,
  0
);

insert into storage.objects (bucket_id, name, owner_id, metadata)
values (
  'cat-photos',
  '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000004.webp',
  '14000000-0000-0000-0000-000000000001',
  '{}'::jsonb
);

select pg_temp.assert_eq(
  'an uploaded but unreferenced object is not readable or listable',
  (
    select count(*)
    from storage.objects
    where name = '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000004.webp'
  ),
  0
);

select pg_temp.expect_reject(
  'owner cannot upload into another owner folder',
  $$insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'cat-photos',
      '14000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000005.webp',
      '14000000-0000-0000-0000-000000000001',
      '{}'::jsonb
    )$$
);

select pg_temp.assert_affected(
  'owner cannot delete their archived cat photo row',
  $$delete from storage.objects
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000002.webp'$$,
  0
);

select pg_temp.assert_affected(
  'owner cannot delete another owner photo row',
  $$delete from storage.objects
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000002/34000000-0000-0000-0000-000000000003.webp'$$,
  0
);

select pg_temp.assert_affected(
  'owner can delete their active cat photo row',
  $$delete from storage.objects
    where bucket_id = 'cat-photos'
      and name = '14000000-0000-0000-0000-000000000001/34000000-0000-0000-0000-000000000001.webp'$$,
  1
);

reset role;

rollback;
