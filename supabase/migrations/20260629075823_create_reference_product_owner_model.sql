-- MVP3 PRODUCT: owner-side Reference Product model.
-- Product tables stay in the app/product schema surface, not in @xwlc/* packages.

create table if not exists public.cats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  life_stage text check (life_stage is null or life_stage in ('kitten', 'adult', 'senior', 'unknown')),
  breed text check (breed is null or char_length(breed) <= 80),
  safety_notes text check (safety_notes is null or char_length(safety_notes) <= 2000),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_routines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  title text not null default 'Daily care routine' check (char_length(title) between 1 and 120),
  source text not null default 'manual' check (source in ('manual', 'template', 'ai_assisted')),
  is_default boolean not null default true,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_routine_items (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.care_routines(id) on delete cascade,
  category text not null check (
    category in ('meal', 'water', 'litter', 'medicine', 'treat', 'play', 'environment', 'other')
  ),
  title text not null check (char_length(title) between 1 and 120),
  frequency text not null default 'daily' check (char_length(frequency) between 1 and 80),
  time_hint text check (time_hint is null or char_length(time_hint) <= 80),
  instructions text check (instructions is null or char_length(instructions) <= 2000),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  item_type text not null check (
    item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'litter', 'supply', 'other')
  ),
  name text not null check (char_length(name) between 1 and 120),
  default_amount text check (default_amount is null or char_length(default_amount) <= 120),
  default_frequency text check (default_frequency is null or char_length(default_frequency) <= 120),
  instructions text check (instructions is null or char_length(instructions) <= 2000),
  visible_to_sitter boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  event_type text not null check (
    event_type in ('feeding', 'treat', 'health', 'medicine', 'vet', 'travel', 'behavior', 'environment', 'other')
  ),
  title text not null check (char_length(title) between 1 and 120),
  note text check (note is null or char_length(note) <= 2000),
  related_item_name text check (related_item_name is null or char_length(related_item_name) <= 120),
  severity text not null default 'normal' check (severity in ('normal', 'watch', 'urgent')),
  occurred_on date,
  started_on date,
  ended_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or started_on is null or ended_on >= started_on),
  check (occurred_on is not null or started_on is not null)
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  routine_id uuid references public.care_routines(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  status text not null default 'draft' check (status in ('draft', 'published', 'reviewed', 'closed')),
  scenario text not null default 'other' check (
    scenario in ('business_trip', 'weekend_away', 'friend_visit', 'other')
  ),
  generation_source text not null default 'manual' check (generation_source in ('manual', 'template', 'ai_mock')),
  ai_input_summary jsonb not null default '{}'::jsonb,
  start_on date,
  end_on date,
  handoff_notes text check (handoff_notes is null or char_length(handoff_notes) <= 2000),
  generated_at timestamptz,
  published_at timestamptz,
  reviewed_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_on is null or start_on is null or end_on >= start_on)
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.care_plans(id) on delete cascade,
  category text not null default 'other' check (
    category in ('meal', 'water', 'litter', 'medicine', 'treat', 'play', 'environment', 'observe', 'other')
  ),
  title text not null check (char_length(title) between 1 and 120),
  instructions text check (instructions is null or char_length(instructions) <= 2000),
  time_hint text check (time_hint is null or char_length(time_hint) <= 80),
  frequency text check (frequency is null or char_length(frequency) <= 80),
  source text not null default 'owner' check (source in ('routine', 'care_item', 'event', 'owner', 'ai_suggestion')),
  source_ref text check (source_ref is null or char_length(source_ref) <= 120),
  sort_order integer not null default 0,
  required boolean not null default true,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.care_plans(id) on delete cascade,
  task_id uuid references public.care_tasks(id) on delete set null,
  submitted_by_label text not null check (char_length(submitted_by_label) between 1 and 80),
  status text not null check (status in ('completed', 'note', 'exception')),
  note text check (note is null or char_length(note) <= 2000),
  abnormal boolean not null default false,
  idempotency_key text check (idempotency_key is null or char_length(idempotency_key) <= 160),
  created_at timestamptz not null default now()
);

create trigger set_cats_updated_at
  before update on public.cats
  for each row
  execute function public.set_updated_at();

create trigger set_care_routines_updated_at
  before update on public.care_routines
  for each row
  execute function public.set_updated_at();

create trigger set_care_routine_items_updated_at
  before update on public.care_routine_items
  for each row
  execute function public.set_updated_at();

create trigger set_care_items_updated_at
  before update on public.care_items
  for each row
  execute function public.set_updated_at();

create trigger set_care_events_updated_at
  before update on public.care_events
  for each row
  execute function public.set_updated_at();

create trigger set_care_plans_updated_at
  before update on public.care_plans
  for each row
  execute function public.set_updated_at();

create trigger set_care_tasks_updated_at
  before update on public.care_tasks
  for each row
  execute function public.set_updated_at();

create index if not exists cats_owner_id_idx
  on public.cats (owner_id);

create index if not exists care_routines_owner_cat_idx
  on public.care_routines (owner_id, cat_id);

create index if not exists care_routine_items_routine_id_idx
  on public.care_routine_items (routine_id);

create index if not exists care_items_owner_cat_idx
  on public.care_items (owner_id, cat_id);

create index if not exists care_events_owner_cat_occurred_idx
  on public.care_events (owner_id, cat_id, occurred_on desc);

create index if not exists care_plans_owner_id_idx
  on public.care_plans (owner_id);

create index if not exists care_plans_cat_id_idx
  on public.care_plans (cat_id);

create index if not exists care_plans_routine_id_idx
  on public.care_plans (routine_id);

create index if not exists care_tasks_plan_id_idx
  on public.care_tasks (plan_id);

create index if not exists care_submissions_owner_id_idx
  on public.care_submissions (owner_id);

create index if not exists care_submissions_plan_id_idx
  on public.care_submissions (plan_id);

create unique index if not exists care_submissions_plan_id_idempotency_key_idx
  on public.care_submissions (plan_id, idempotency_key)
  where idempotency_key is not null;

alter table public.cats enable row level security;
alter table public.care_routines enable row level security;
alter table public.care_routine_items enable row level security;
alter table public.care_items enable row level security;
alter table public.care_events enable row level security;
alter table public.care_plans enable row level security;
alter table public.care_tasks enable row level security;
alter table public.care_submissions enable row level security;

grant select, insert, update, delete
  on public.cats,
     public.care_routines,
     public.care_routine_items,
     public.care_items,
     public.care_events,
     public.care_plans,
     public.care_tasks,
     public.care_submissions
  to authenticated;

grant all
  on public.cats,
     public.care_routines,
     public.care_routine_items,
     public.care_items,
     public.care_events,
     public.care_plans,
     public.care_tasks,
     public.care_submissions
  to service_role;

create policy "Owners can read their cats"
  on public.cats
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their cats"
  on public.cats
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their cats"
  on public.cats
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their cats"
  on public.cats
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can read their care routines"
  on public.care_routines
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their care routines"
  on public.care_routines
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update their care routines"
  on public.care_routines
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_routines.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their care routines"
  on public.care_routines
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can read their care routine items"
  on public.care_routine_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
    )
  );

create policy "Owners can insert their care routine items"
  on public.care_routine_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.care_routines
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update their care routine items"
  on public.care_routine_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.care_routines
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their care routine items"
  on public.care_routine_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.care_routines
      where care_routines.id = care_routine_items.routine_id
        and care_routines.owner_id = (select auth.uid())
    )
  );

create policy "Owners can read their care items"
  on public.care_items
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their care items"
  on public.care_items
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update their care items"
  on public.care_items
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_items.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their care items"
  on public.care_items
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can read their care events"
  on public.care_events
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their care events"
  on public.care_events
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update their care events"
  on public.care_events
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_events.cat_id
        and cats.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their care events"
  on public.care_events
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can read their care plans"
  on public.care_plans
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their care plans"
  on public.care_plans
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_plans.cat_id
        and cats.owner_id = (select auth.uid())
    )
    and (
      care_plans.routine_id is null
      or exists (
        select 1
        from public.care_routines
        where care_routines.id = care_plans.routine_id
          and care_routines.cat_id = care_plans.cat_id
          and care_routines.owner_id = (select auth.uid())
      )
    )
  );

create policy "Owners can update their care plans"
  on public.care_plans
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = care_plans.cat_id
        and cats.owner_id = (select auth.uid())
    )
    and (
      care_plans.routine_id is null
      or exists (
        select 1
        from public.care_routines
        where care_routines.id = care_plans.routine_id
          and care_routines.cat_id = care_plans.cat_id
          and care_routines.owner_id = (select auth.uid())
      )
    )
  );

create policy "Owners can delete their care plans"
  on public.care_plans
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can read their care tasks"
  on public.care_tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_tasks.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can insert their care tasks"
  on public.care_tasks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_tasks.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can update their care tasks"
  on public.care_tasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_tasks.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_tasks.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can delete their care tasks"
  on public.care_tasks
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.care_plans
      where care_plans.id = care_tasks.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
  );

create policy "Owners can read their care submissions"
  on public.care_submissions
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can insert their care submissions"
  on public.care_submissions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.care_plans
      where care_plans.id = care_submissions.plan_id
        and care_plans.owner_id = (select auth.uid())
    )
    and (
      care_submissions.task_id is null
      or exists (
        select 1
        from public.care_tasks
        where care_tasks.id = care_submissions.task_id
          and care_tasks.plan_id = care_submissions.plan_id
      )
    )
  );

create policy "Owners can update their care submissions"
  on public.care_submissions
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their care submissions"
  on public.care_submissions
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);
