alter table public.care_submissions
  add column revision bigint not null default 1
  check (revision > 0);

alter table public.owner_notifications
  add column submission_revision bigint not null default 1
  check (submission_revision > 0);

create or replace function public.upsert_owner_submission_notification(
  p_event_type text,
  p_idempotency_key text,
  p_owner_id uuid,
  p_plan_id uuid,
  p_service_date date,
  p_submission_id uuid,
  p_submission_revision bigint,
  p_submission_status text,
  p_task_id uuid,
  p_task_title text,
  p_visit_time time without time zone
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  notification_id uuid;
begin
  insert into public.owner_notifications as current_notification (
    event_type,
    idempotency_key,
    owner_id,
    plan_id,
    service_date,
    submission_id,
    submission_revision,
    submission_status,
    task_id,
    task_title,
    visit_time
  ) values (
    p_event_type,
    p_idempotency_key,
    p_owner_id,
    p_plan_id,
    p_service_date,
    p_submission_id,
    p_submission_revision,
    p_submission_status,
    p_task_id,
    p_task_title,
    p_visit_time
  )
  on conflict (idempotency_key) do update
  set event_type = excluded.event_type,
      owner_id = excluded.owner_id,
      plan_id = excluded.plan_id,
      service_date = excluded.service_date,
      submission_id = excluded.submission_id,
      submission_revision = excluded.submission_revision,
      submission_status = excluded.submission_status,
      task_id = excluded.task_id,
      task_title = excluded.task_title,
      visit_time = excluded.visit_time,
      read_at = case
        when excluded.submission_revision > current_notification.submission_revision
          then null
        else current_notification.read_at
      end,
      last_notified_at = case
        when excluded.submission_revision > current_notification.submission_revision
          then now()
        else current_notification.last_notified_at
      end
  where excluded.submission_revision >= current_notification.submission_revision
  returning current_notification.id into notification_id;

  if notification_id is null then
    select id
      into notification_id
      from public.owner_notifications
      where idempotency_key = p_idempotency_key;
  end if;

  return notification_id;
end;
$$;

revoke all on function public.upsert_owner_submission_notification(
  text,
  text,
  uuid,
  uuid,
  date,
  uuid,
  bigint,
  text,
  uuid,
  text,
  time without time zone
) from public, anon, authenticated;

grant execute on function public.upsert_owner_submission_notification(
  text,
  text,
  uuid,
  uuid,
  date,
  uuid,
  bigint,
  text,
  uuid,
  text,
  time without time zone
) to service_role;
