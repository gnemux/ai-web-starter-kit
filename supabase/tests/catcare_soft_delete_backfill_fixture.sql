-- Reproducible pre-migration fixture for the GNE-288 ownership-safe backfill.
-- Run after:
--   supabase db reset --version 20260712122026 --no-seed
-- Then apply 20260713092452_catcare_soft_delete_plan_participants.sql and run
-- catcare_soft_delete_backfill_assert.sql.

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
    '15000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne288-backfill-owner-a@example.test',
    '$2a$10$linked.only.catcare.backfill.a',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '15000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gne288-backfill-owner-b@example.test',
    '$2a$10$linked.only.catcare.backfill.b',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.cats (id, owner_id, name)
values
  (
    '25000000-0000-0000-0000-000000000001',
    '15000000-0000-0000-0000-000000000001',
    'Owner A Cat'
  ),
  (
    '25000000-0000-0000-0000-000000000002',
    '15000000-0000-0000-0000-000000000002',
    'Owner B Secret Cat'
  );

insert into public.care_plans (
  id,
  owner_id,
  cat_id,
  title,
  status,
  ai_input_summary
)
values (
  '75000000-0000-0000-0000-000000000001',
  '15000000-0000-0000-0000-000000000001',
  '25000000-0000-0000-0000-000000000001',
  'Cross-owner legacy JSON fixture',
  'reviewed',
  '{"cat_ids":["25000000-0000-0000-0000-000000000001","25000000-0000-0000-0000-000000000002"],"cat_names":["Owner A Cat"]}'::jsonb
);
