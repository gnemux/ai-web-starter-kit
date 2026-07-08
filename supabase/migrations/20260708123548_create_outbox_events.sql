create table if not exists public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'owner_notification',
      'share_notification',
      'submission_notification'
    )
  ),
  aggregate_type text not null check (
    aggregate_type in (
      'care_plan',
      'care_submission',
      'share_token'
    )
  ),
  aggregate_id uuid not null,
  owner_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (
    status in (
      'pending',
      'processing',
      'sent',
      'failed',
      'dead_letter'
    )
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz,
  idempotency_key text,
  correlation_id text not null check (length(correlation_id) between 8 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outbox_events_status_next_attempt_idx
  on public.outbox_events (status, next_attempt_at, created_at);

create index if not exists outbox_events_owner_created_idx
  on public.outbox_events (owner_id, created_at desc);

create index if not exists outbox_events_correlation_idx
  on public.outbox_events (correlation_id);

alter table public.outbox_events enable row level security;

grant select on public.outbox_events to authenticated;
grant all on public.outbox_events to service_role;

create policy "Owners can read their outbox events"
  on public.outbox_events
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);
