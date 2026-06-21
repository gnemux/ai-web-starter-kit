-- MVP2 Billing foundation: trusted commercial facts and owner-readable,
-- service-only writable ledgers. Plans and prices are config-backed in
-- packages/core for MVP2 so the template does not need a pricing admin yet.

create table public.billing_orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'sandbox',
  provider_order_id text,
  provider_checkout_session_id text,
  idempotency_key text not null unique,
  plan_id text not null,
  price_id text not null,
  status text not null check (
    status in ('pending', 'paid', 'failed', 'refunded', 'canceled')
  ),
  currency text not null check (currency = lower(currency) and char_length(currency) = 3),
  amount_cents integer not null check (amount_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index billing_orders_owner_id_idx
  on public.billing_orders (owner_id);

create index billing_orders_status_idx
  on public.billing_orders (status);

create unique index billing_orders_provider_order_unique_idx
  on public.billing_orders (provider, provider_order_id)
  where provider_order_id is not null;

create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'sandbox',
  provider_subscription_id text,
  plan_id text not null,
  price_id text not null,
  status text not null check (
    status in ('trialing', 'active', 'past_due', 'canceled', 'expired', 'refunded')
  ),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index billing_subscriptions_owner_id_idx
  on public.billing_subscriptions (owner_id);

create index billing_subscriptions_owner_status_idx
  on public.billing_subscriptions (owner_id, status);

create unique index billing_subscriptions_provider_unique_idx
  on public.billing_subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table public.billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (
    source_type in ('plan', 'subscription', 'credit_pack', 'manual_grant', 'trial')
  ),
  source_id uuid,
  feature_key text not null,
  allowance_kind text not null check (allowance_kind in ('boolean', 'quantity')),
  quantity numeric(20, 4),
  quantity_used numeric(20, 4) not null default 0 check (quantity_used >= 0),
  unit text,
  renews_at timestamptz,
  expires_at timestamptz,
  status text not null default 'active' check (
    status in ('active', 'expired', 'revoked')
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (allowance_kind = 'boolean' and quantity is null and unit is null)
    or (allowance_kind = 'quantity' and quantity is not null and quantity >= 0 and unit is not null)
  )
);

create index billing_entitlements_owner_id_idx
  on public.billing_entitlements (owner_id);

create index billing_entitlements_owner_feature_idx
  on public.billing_entitlements (owner_id, feature_key, status);

create table public.billing_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid references public.billing_entitlements(id) on delete set null,
  event_type text not null check (
    event_type in ('grant', 'consume', 'refund', 'expire', 'adjustment')
  ),
  amount numeric(20, 4) not null check (amount <> 0),
  unit text not null,
  idempotency_key text not null unique,
  source_type text not null check (
    source_type in ('subscription', 'credit_pack', 'ai_usage', 'admin', 'refund', 'system')
  ),
  source_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index billing_credit_ledger_owner_id_idx
  on public.billing_credit_ledger (owner_id);

create index billing_credit_ledger_entitlement_id_idx
  on public.billing_credit_ledger (entitlement_id);

create table public.billing_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  feature_key text not null,
  units numeric(20, 4) not null check (units > 0),
  unit text not null,
  status text not null check (
    status in ('reserved', 'committed', 'released', 'failed')
  ),
  idempotency_key text not null unique,
  related_credit_ledger_id uuid references public.billing_credit_ledger(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index billing_usage_ledger_owner_id_idx
  on public.billing_usage_ledger (owner_id);

create index billing_usage_ledger_owner_feature_idx
  on public.billing_usage_ledger (owner_id, feature_key);

create trigger set_billing_orders_updated_at
  before update on public.billing_orders
  for each row
  execute function public.set_updated_at();

create trigger set_billing_subscriptions_updated_at
  before update on public.billing_subscriptions
  for each row
  execute function public.set_updated_at();

create trigger set_billing_entitlements_updated_at
  before update on public.billing_entitlements
  for each row
  execute function public.set_updated_at();

alter table public.billing_orders enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_entitlements enable row level security;
alter table public.billing_credit_ledger enable row level security;
alter table public.billing_usage_ledger enable row level security;

grant select on public.billing_orders to authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select on public.billing_entitlements to authenticated;
grant select on public.billing_credit_ledger to authenticated;
grant select on public.billing_usage_ledger to authenticated;

grant all on public.billing_orders to service_role;
grant all on public.billing_subscriptions to service_role;
grant all on public.billing_entitlements to service_role;
grant all on public.billing_credit_ledger to service_role;
grant all on public.billing_usage_ledger to service_role;

create policy "Users can read their own billing orders"
  on public.billing_orders
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can read their own billing subscriptions"
  on public.billing_subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can read their own billing entitlements"
  on public.billing_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can read their own billing credit ledger"
  on public.billing_credit_ledger
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can read their own billing usage ledger"
  on public.billing_usage_ledger
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);
