create table public.owner_notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in ('care_submission', 'care_exception')
  ),
  plan_id uuid references public.care_plans(id) on delete set null,
  task_id uuid references public.care_tasks(id) on delete set null,
  submission_id uuid references public.care_submissions(id) on delete set null,
  task_title text not null check (length(task_title) between 1 and 160),
  service_date date not null,
  visit_time time without time zone not null,
  submission_status text not null check (
    submission_status in ('completed', 'note', 'exception')
  ),
  idempotency_key text not null unique check (
    length(idempotency_key) between 8 and 240
  ),
  read_at timestamptz,
  last_notified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index owner_notifications_owner_notified_idx
  on public.owner_notifications (owner_id, last_notified_at desc);

create index owner_notifications_owner_unread_idx
  on public.owner_notifications (owner_id, last_notified_at desc)
  where read_at is null;

create index owner_notifications_plan_id_idx
  on public.owner_notifications (plan_id)
  where plan_id is not null;

create index owner_notifications_task_id_idx
  on public.owner_notifications (task_id)
  where task_id is not null;

create index owner_notifications_submission_id_idx
  on public.owner_notifications (submission_id)
  where submission_id is not null;

create trigger set_owner_notifications_updated_at
  before update on public.owner_notifications
  for each row
  execute function public.set_updated_at();

alter table public.owner_notifications enable row level security;

revoke all on table public.owner_notifications from public, anon, authenticated;
grant select on table public.owner_notifications to authenticated;
grant update (read_at) on table public.owner_notifications to authenticated;
grant all on table public.owner_notifications to service_role;

create policy "Owners can read their notifications"
  on public.owner_notifications
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can mark their notifications read"
  on public.owner_notifications
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
