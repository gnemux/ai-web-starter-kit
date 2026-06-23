-- Payment webhook event boundary. Raw provider payloads are service-only:
-- customer-facing billing facts live in billing_orders, billing_subscriptions,
-- billing_entitlements, and billing_credit_ledger.

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  status text not null default 'received' check (
    status in ('received', 'processed', 'ignored', 'failed')
  ),
  owner_id uuid references auth.users(id) on delete set null,
  checkout_session_id text,
  price_id text,
  idempotency_key text not null unique,
  raw_payload jsonb not null default '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, event_id)
);

create index payment_events_owner_id_idx
  on public.payment_events (owner_id);

create index payment_events_status_idx
  on public.payment_events (status);

create trigger set_payment_events_updated_at
  before update on public.payment_events
  for each row
  execute function public.set_updated_at();

alter table public.payment_events enable row level security;

grant all on public.payment_events to service_role;
