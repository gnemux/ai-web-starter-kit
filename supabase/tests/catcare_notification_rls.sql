-- GNE-320: owner notification RLS and privilege acceptance.
-- Run after local migrations. The transaction rolls back all synthetic rows.

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

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '11000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'gne320-owner-a@example.test',
    '$2a$10$local.only.gne320.owner.a', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now()
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'gne320-owner-b@example.test',
    '$2a$10$local.only.gne320.owner.b', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now()
  );

insert into public.cats (id, owner_id, name)
values
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Owner A Cat'),
  ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'Owner B Cat');

insert into public.care_plans (id, owner_id, cat_id, title, status, start_on, end_on)
values
  ('71000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'Owner A plan', 'draft', current_date, current_date),
  ('71000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', 'Owner B plan', 'draft', current_date, current_date);

insert into public.care_plan_cats (plan_id, cat_id, cat_name_snapshot, sort_order)
values
  ('71000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'Owner A Cat', 0),
  ('71000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', 'Owner B Cat', 0);

update public.care_plans
set status = 'published', published_at = now();

insert into public.care_tasks (id, plan_id, category, title)
values
  ('81000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 'meal', 'Owner A task'),
  ('81000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000002', 'meal', 'Owner B task');

insert into public.care_submissions (id, owner_id, plan_id, task_id, submitted_by_label, status)
values
  ('91000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', 'Sitter A', 'completed'),
  ('91000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000002', 'Sitter B', 'exception');

insert into public.owner_notifications (
  id, owner_id, event_type, plan_id, task_id, submission_id, task_title,
  service_date, visit_time, submission_status, idempotency_key
)
values
  (
    'a1000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000001', 'care_submission',
    '71000000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    'Owner A task', current_date, '09:30', 'completed',
    'owner-notification:submission:91000000-0000-0000-0000-000000000001'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    '11000000-0000-0000-0000-000000000002', 'care_exception',
    '71000000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000002',
    '91000000-0000-0000-0000-000000000002',
    'Owner B task', current_date, '18:00', 'exception',
    'owner-notification:submission:91000000-0000-0000-0000-000000000002'
  );

insert into public.owner_notifications (
  owner_id, event_type, task_title, service_date, visit_time,
  submission_status, idempotency_key, read_at, last_notified_at
)
select
  '11000000-0000-0000-0000-000000000001',
  'care_submission',
  'Owner A historical task ' || item,
  current_date,
  '08:00',
  'completed',
  'owner-notification:history:' || item,
  now(),
  now() - interval '30 days' + make_interval(secs => item)
from generate_series(1, 12) as item;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);

select pg_temp.assert_eq(
  'owner A sees only own notification',
  (select count(*)::bigint from public.owner_notifications),
  13
);

select pg_temp.assert_eq(
  'latest unread notification remains visible inside the list limit',
  (
    select count(*)::bigint
    from (
      select id
      from public.owner_notifications
      order by last_notified_at desc
      limit 12
    ) as visible
    where id = 'a1000000-0000-0000-0000-000000000001'
  ),
  1
);

update public.owner_notifications
set read_at = now()
where id = 'a1000000-0000-0000-0000-000000000001';

select pg_temp.assert_eq(
  'owner A can mark own notification read',
  (
    select count(*)::bigint
    from public.owner_notifications
    where id = 'a1000000-0000-0000-0000-000000000001'
      and read_at is not null
  ),
  1
);

select pg_temp.assert_eq(
  'read timestamp does not push the notification out of delivery order',
  (
    select count(*)::bigint
    from (
      select id
      from public.owner_notifications
      order by last_notified_at desc
      limit 12
    ) as visible
    where id = 'a1000000-0000-0000-0000-000000000001'
  ),
  1
);

select pg_temp.assert_affected(
  'owner A cannot mark owner B notification read',
  $$update public.owner_notifications set read_at = now() where id = 'a1000000-0000-0000-0000-000000000002'$$,
  0
);

select pg_temp.expect_reject(
  'owner A cannot change notification content',
  $$update public.owner_notifications set task_title = 'tampered' where id = 'a1000000-0000-0000-0000-000000000001'$$
);

select pg_temp.expect_reject(
  'owner A cannot reorder a notification',
  $$update public.owner_notifications set last_notified_at = now() where id = 'a1000000-0000-0000-0000-000000000001'$$
);

select pg_temp.expect_reject(
  'owner A cannot insert a notification',
  $$insert into public.owner_notifications (owner_id, event_type, task_title, service_date, visit_time, submission_status, idempotency_key) values ('11000000-0000-0000-0000-000000000001', 'care_submission', 'blocked', current_date, '08:00', 'completed', 'blocked-owner-insert')$$
);

select pg_temp.expect_reject(
  'owner A cannot delete a notification',
  $$delete from public.owner_notifications where id = 'a1000000-0000-0000-0000-000000000001'$$
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select pg_temp.expect_reject(
  'anon cannot read owner notifications',
  'select count(*) from public.owner_notifications'
);

select pg_temp.expect_reject(
  'anon cannot update owner notifications',
  $$update public.owner_notifications set read_at = now() where id = 'a1000000-0000-0000-0000-000000000001'$$
);

reset role;
rollback;
