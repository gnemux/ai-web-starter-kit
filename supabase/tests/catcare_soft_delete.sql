-- GNE-288: logical cat deletion, immutable plan history, and owner isolation.
-- Run after a local reset. The transaction rolls back all local-only fixtures.

begin;

create or replace function pg_temp.assert_eq(label text, actual bigint, expected bigint)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '% expected %, got %', label, expected, actual;
  end if;
end;
$$;

create or replace function pg_temp.assert_text(label text, actual text, expected text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '% expected %, got %', label, expected, actual;
  end if;
end;
$$;

create or replace function pg_temp.expect_reject(label text, statement text)
returns void language plpgsql security invoker as $$
begin
  execute statement;
  raise exception '% unexpectedly succeeded', label;
exception
  when insufficient_privilege or with_check_option_violation
    or check_violation or foreign_key_violation then return;
end;
$$;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '18000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'gne288-owner-a@example.test',
    '$2a$10$local.only.gne288.owner.a', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
  ),
  (
    '18000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'gne288-owner-b@example.test',
    '$2a$10$local.only.gne288.owner.b', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
  );

insert into public.cats (id, owner_id, name)
values
  ('28000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', 'Archived Cat'),
  ('28000000-0000-0000-0000-000000000002', '18000000-0000-0000-0000-000000000001', 'Active Cat'),
  ('28000000-0000-0000-0000-000000000003', '18000000-0000-0000-0000-000000000002', 'Other Owner Cat');

insert into public.care_routines (id, owner_id, cat_id, title)
values ('38000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', '28000000-0000-0000-0000-000000000001', 'Archived routine');

insert into public.care_routine_items (id, routine_id, category, title)
values ('48000000-0000-0000-0000-000000000001', '38000000-0000-0000-0000-000000000001', 'meal', 'Archived breakfast');

insert into public.care_items (id, owner_id, cat_id, item_type, name)
values ('58000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', '28000000-0000-0000-0000-000000000001', 'dry_food', 'Archived food');

insert into public.care_events (id, owner_id, cat_id, event_type, title, occurred_on)
values ('68000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', '28000000-0000-0000-0000-000000000001', 'health', 'Archived event', current_date);

insert into public.care_plans (id, owner_id, cat_id, title, status, ai_input_summary)
values
  (
    '78000000-0000-0000-0000-000000000001',
    '18000000-0000-0000-0000-000000000001',
    '28000000-0000-0000-0000-000000000002',
    'Historical mixed-cat plan', 'draft',
    '{"cat_ids":["28000000-0000-0000-0000-000000000001","28000000-0000-0000-0000-000000000002"],"cat_names":["Archived Cat","Active Cat"]}'::jsonb
  ),
  (
    '78000000-0000-0000-0000-000000000002',
    '18000000-0000-0000-0000-000000000001',
    '28000000-0000-0000-0000-000000000001',
    'Blocking draft plan', 'draft', '{}'
  );

insert into public.care_plan_cats (plan_id, cat_id, cat_name_snapshot, sort_order)
values
  ('78000000-0000-0000-0000-000000000001', '28000000-0000-0000-0000-000000000001', 'Archived Cat', 0),
  ('78000000-0000-0000-0000-000000000001', '28000000-0000-0000-0000-000000000002', 'Active Cat', 1),
  ('78000000-0000-0000-0000-000000000002', '28000000-0000-0000-0000-000000000001', 'Archived Cat', 0);

select pg_temp.expect_reject(
  'participant invariant rejects another owner cat even for privileged writes',
  $$insert into public.care_plan_cats (plan_id, cat_id, cat_name_snapshot, sort_order)
    values (
      '78000000-0000-0000-0000-000000000001',
      '28000000-0000-0000-0000-000000000003',
      'Other Owner Cat',
      2
    )$$
);

update public.care_plans
set status = 'reviewed', reviewed_at = now()
where id = '78000000-0000-0000-0000-000000000001';

insert into public.care_tasks (id, plan_id, category, title)
values ('88000000-0000-0000-0000-000000000001', '78000000-0000-0000-0000-000000000001', 'meal', 'Historical task');

insert into public.care_submissions (id, owner_id, plan_id, task_id, submitted_by_label, status)
values ('98000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', '78000000-0000-0000-0000-000000000001', '88000000-0000-0000-0000-000000000001', 'Sitter', 'completed');

insert into public.share_tokens (
  id, owner_id, resource_type, resource_id, token_hash, scope, expires_at
)
values (
  'a8000000-0000-0000-0000-000000000001',
  '18000000-0000-0000-0000-000000000001',
  'care_plan',
  '78000000-0000-0000-0000-000000000002',
  'gne288-active-share-token-hash-00000000000000000000000000000000',
  'care_plan',
  now() + interval '7 days'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '18000000-0000-0000-0000-000000000001', true);

select pg_temp.expect_reject(
  'authenticated owner cannot directly create a published plan',
  $$insert into public.care_plans (owner_id, cat_id, title, status)
    values (
      '18000000-0000-0000-0000-000000000001',
      '28000000-0000-0000-0000-000000000002',
      'Invalid direct published plan',
      'published'
    )$$
);

select pg_temp.assert_text(
  'draft plan blocks logical deletion',
  (select outcome from public.soft_delete_cat_profile('28000000-0000-0000-0000-000000000001')),
  'active_plan_conflict'
);
select pg_temp.assert_eq('blocked cat remains active', (select count(*)::bigint from public.cats where id = '28000000-0000-0000-0000-000000000001'), 1);
select pg_temp.expect_reject('authenticated cannot hard delete cats', $$delete from public.cats where id = '28000000-0000-0000-0000-000000000001'$$);
select pg_temp.expect_reject('authenticated cannot bypass archive RPC', $$update public.cats set deleted_at = now() where id = '28000000-0000-0000-0000-000000000001'$$);

reset role;
update public.care_plans set status = 'reviewed', reviewed_at = now()
where id = '78000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config('request.jwt.claim.sub', '18000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_text(
  'active share link blocks logical deletion after review',
  (select outcome from public.soft_delete_cat_profile('28000000-0000-0000-0000-000000000001')),
  'active_plan_conflict'
);

reset role;
update public.share_tokens set revoked_at = now()
where id = 'a8000000-0000-0000-0000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '18000000-0000-0000-0000-000000000001', true);
select pg_temp.assert_text(
  'closed history permits logical deletion',
  (select outcome from public.soft_delete_cat_profile('28000000-0000-0000-0000-000000000001')),
  'soft_deleted'
);
select pg_temp.assert_eq('deleted cat hidden from active owner reads', (select count(*)::bigint from public.cats where id = '28000000-0000-0000-0000-000000000001'), 0);
select pg_temp.assert_eq('deleted cat routine hidden', (select count(*)::bigint from public.care_routines), 0);
select pg_temp.assert_eq('deleted cat routine items hidden', (select count(*)::bigint from public.care_routine_items), 0);
select pg_temp.assert_eq('deleted cat care item hidden', (select count(*)::bigint from public.care_items), 0);
select pg_temp.assert_eq('deleted cat events hidden', (select count(*)::bigint from public.care_events), 0);
select pg_temp.assert_eq('historical plan retained', (select count(*)::bigint from public.care_plans where id = '78000000-0000-0000-0000-000000000001'), 1);
select pg_temp.assert_eq('historical task retained', (select count(*)::bigint from public.care_tasks), 1);
select pg_temp.assert_eq('historical submission retained', (select count(*)::bigint from public.care_submissions), 1);
select pg_temp.assert_eq('deleted participant remains readable', (select count(*)::bigint from public.care_plan_cats where cat_deleted_at is not null), 2);
update public.care_plans
set title = 'Reviewed plan closes after primary cat archival',
    status = 'closed',
    closed_at = now()
where id = '78000000-0000-0000-0000-000000000002';
select pg_temp.assert_eq('historical primary reference clears and plan still closes', (select count(*)::bigint from public.care_plans where id = '78000000-0000-0000-0000-000000000002' and cat_id is null and status = 'closed'), 1);

reset role;
select pg_temp.expect_reject(
  'archived participant history cannot be republished',
  $$update public.care_plans
    set status = 'published'
    where id = '78000000-0000-0000-0000-000000000001'$$
);
select pg_temp.expect_reject(
  'new active plan cannot race onto an archived primary cat',
  $$insert into public.care_plans (owner_id, cat_id, title, status)
    values (
      '18000000-0000-0000-0000-000000000001',
      '28000000-0000-0000-0000-000000000001',
      'Invalid archived-cat draft',
      'draft'
    )$$
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '18000000-0000-0000-0000-000000000002', true);
select pg_temp.assert_text(
  'another owner cannot delete the profile',
  (select outcome from public.soft_delete_cat_profile('28000000-0000-0000-0000-000000000002')),
  'not_found'
);

reset role;
select pg_temp.assert_eq('cat row physically retained', (select count(*)::bigint from public.cats where id = '28000000-0000-0000-0000-000000000001' and deleted_at is not null), 1);
select pg_temp.assert_eq('routine row physically retained', (select count(*)::bigint from public.care_routines), 1);
select pg_temp.assert_eq('routine item physically retained', (select count(*)::bigint from public.care_routine_items), 1);
select pg_temp.assert_eq('care item physically retained', (select count(*)::bigint from public.care_items), 1);
select pg_temp.assert_eq('event row physically retained', (select count(*)::bigint from public.care_events), 1);
select pg_temp.assert_eq('cat archive audit written atomically', (select count(*)::bigint from public.audit_events where event_name = 'cat_profile_archived' and resource_id = '28000000-0000-0000-0000-000000000001'), 1);

rollback;
