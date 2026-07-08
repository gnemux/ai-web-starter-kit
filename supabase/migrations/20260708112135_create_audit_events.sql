-- GNE-262: CAP-02 durable audit events for Reference Product actions.
-- Payloads are intentionally redacted. Raw share tokens, token hashes, owner
-- email, full notes, and private handoff text must not be stored here.

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (
    event_name in (
      'care_plan_published',
      'share_link_created',
      'share_link_revoked',
      'share_page_viewed',
      'invalid_or_revoked_token_rejected',
      'care_submission_created',
      'owner_boundary_denied'
    )
  ),
  actor_type text not null check (actor_type in ('user', 'anonymous_token', 'system')),
  owner_id uuid references auth.users(id) on delete set null,
  resource_type text check (resource_type in ('care_plan')),
  resource_id uuid,
  token_record_id uuid references public.share_tokens(id) on delete set null,
  task_id uuid references public.care_tasks(id) on delete set null,
  idempotency_key text,
  correlation_id text not null check (char_length(correlation_id) between 8 and 160),
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists audit_events_owner_resource_idx
  on public.audit_events (owner_id, resource_type, resource_id, occurred_at desc);

create index if not exists audit_events_correlation_idx
  on public.audit_events (correlation_id);

create index if not exists audit_events_event_name_idx
  on public.audit_events (event_name, occurred_at desc);

alter table public.audit_events enable row level security;

grant select on public.audit_events to authenticated;
grant all on public.audit_events to service_role;

create policy "Owners can read their audit events"
  on public.audit_events
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);
