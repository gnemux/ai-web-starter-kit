-- GNE-319 acceptance repair: save exactly the draft currently visible in the
-- editor. Draft-only save and save-and-publish share the same plan row lock so
-- a delayed save can never mutate an already published plan.

create or replace function public.save_care_plan_tasks(
  target_plan_id uuid,
  submitted_handoff_notes text,
  submitted_visit_count integer,
  submitted_task_updates jsonb,
  submitted_new_tasks jsonb,
  should_publish boolean
)
returns table (
  saved_plan_id uuid,
  saved_owner_id uuid,
  enabled_task_count bigint,
  plan_status text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  plan_owner_id uuid;
  task_payload jsonb;
  new_task_payload jsonb;
  existing_editor_task_count integer;
  submitted_editor_task_count integer;
  next_sort_order integer;
  enabled_count bigint;
  updated_task_id uuid;
begin
  if caller_id is null then
    raise insufficient_privilege using message = 'Authentication required.';
  end if;

  select care_plans.owner_id
  into plan_owner_id
  from public.care_plans
  where care_plans.id = target_plan_id
    and care_plans.owner_id = caller_id
    and care_plans.status = 'draft'
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'care_plan_not_editable';
  end if;

  if submitted_handoff_notes is not null
    and char_length(submitted_handoff_notes) > 2000 then
    raise exception using errcode = 'P0001', message = 'care_plan_handoff_too_long';
  end if;

  if submitted_visit_count not between 1 and 3 then
    raise exception using errcode = 'P0001', message = 'care_plan_visit_count_invalid';
  end if;

  if should_publish is null then
    raise exception using errcode = 'P0001', message = 'care_plan_publish_intent_invalid';
  end if;

  if jsonb_typeof(submitted_task_updates) <> 'array'
    or jsonb_array_length(submitted_task_updates) > 200
    or jsonb_typeof(submitted_new_tasks) <> 'array'
    or jsonb_array_length(submitted_new_tasks) > 50 then
    raise exception using errcode = 'P0001', message = 'care_plan_task_payload_invalid';
  end if;

  select count(*)
  into existing_editor_task_count
  from public.care_tasks
  where care_tasks.plan_id = target_plan_id
    and care_tasks.source <> 'care_item'
    and care_tasks.title not like '%：准备 %';

  select count(distinct (payload.value ->> 'id')::uuid)
  into submitted_editor_task_count
  from jsonb_array_elements(submitted_task_updates) as payload(value);

  if submitted_editor_task_count <> existing_editor_task_count then
    raise exception using errcode = 'P0001', message = 'care_plan_task_set_changed';
  end if;

  for task_payload in
    select payload.value
    from jsonb_array_elements(submitted_task_updates) as payload(value)
  loop
    if nullif(btrim(task_payload ->> 'title'), '') is null
      or char_length(btrim(task_payload ->> 'title')) > 120
      or char_length(coalesce(task_payload ->> 'instructions', '')) > 2000
      or char_length(coalesce(task_payload ->> 'time_hint', '')) > 80 then
      raise exception using errcode = 'P0001', message = 'care_plan_task_payload_invalid';
    end if;

    update public.care_tasks
    set
      enabled = coalesce((task_payload ->> 'enabled')::boolean, false),
      instructions = nullif(btrim(task_payload ->> 'instructions'), ''),
      photo_required = coalesce((task_payload ->> 'photo_required')::boolean, false),
      required = coalesce((task_payload ->> 'required')::boolean, false),
      time_hint = nullif(btrim(task_payload ->> 'time_hint'), ''),
      title = btrim(task_payload ->> 'title')
    where care_tasks.id = (task_payload ->> 'id')::uuid
      and care_tasks.plan_id = target_plan_id
      and care_tasks.source <> 'care_item'
      and care_tasks.title not like '%：准备 %'
    returning care_tasks.id into updated_task_id;

    if updated_task_id is null then
      raise exception using errcode = 'P0001', message = 'care_plan_task_set_changed';
    end if;

    updated_task_id := null;
  end loop;

  select coalesce(max(care_tasks.sort_order), -1) + 1
  into next_sort_order
  from public.care_tasks
  where care_tasks.plan_id = target_plan_id;

  for new_task_payload in
    select payload.value
    from jsonb_array_elements(submitted_new_tasks) as payload(value)
  loop
    if nullif(btrim(new_task_payload ->> 'title'), '') is null
      or char_length(btrim(new_task_payload ->> 'title')) > 120
      or char_length(coalesce(new_task_payload ->> 'instructions', '')) > 2000
      or char_length(coalesce(new_task_payload ->> 'time_hint', '')) > 80
      or coalesce(new_task_payload ->> 'category', '') not in (
        'meal', 'water', 'litter', 'medicine', 'treat', 'play',
        'environment', 'observe', 'other'
      ) then
      raise exception using errcode = 'P0001', message = 'care_plan_task_payload_invalid';
    end if;

    insert into public.care_tasks (
      category,
      enabled,
      frequency,
      instructions,
      plan_id,
      photo_required,
      required,
      sort_order,
      source,
      source_ref,
      time_hint,
      title
    )
    values (
      new_task_payload ->> 'category',
      coalesce((new_task_payload ->> 'enabled')::boolean, false),
      'daily',
      nullif(btrim(new_task_payload ->> 'instructions'), ''),
      target_plan_id,
      coalesce((new_task_payload ->> 'photo_required')::boolean, false),
      coalesce((new_task_payload ->> 'required')::boolean, false),
      next_sort_order,
      'owner',
      null,
      coalesce(nullif(btrim(new_task_payload ->> 'time_hint'), ''), '08:30'),
      btrim(new_task_payload ->> 'title')
    );

    next_sort_order := next_sort_order + 1;
  end loop;

  select count(*)
  into enabled_count
  from public.care_tasks
  where care_tasks.plan_id = target_plan_id
    and care_tasks.enabled
    and care_tasks.source <> 'care_item'
    and care_tasks.title not like '%：准备 %';

  if should_publish and enabled_count = 0 then
    raise exception using errcode = 'P0001', message = 'care_plan_requires_enabled_task';
  end if;

  update public.care_plans
  set
    ai_input_summary = jsonb_set(
      coalesce(care_plans.ai_input_summary, '{}'::jsonb),
      '{visit_count}',
      to_jsonb(submitted_visit_count),
      true
    ),
    handoff_notes = nullif(btrim(submitted_handoff_notes), ''),
    published_at = case
      when should_publish then statement_timestamp()
      else care_plans.published_at
    end,
    status = case
      when should_publish then 'published'
      else care_plans.status
    end
  where care_plans.id = target_plan_id
    and care_plans.owner_id = caller_id
    and care_plans.status = 'draft';

  if not found then
    raise exception using errcode = 'P0001', message = 'care_plan_not_editable';
  end if;

  return query
  select
    target_plan_id,
    plan_owner_id,
    enabled_count,
    case when should_publish then 'published' else 'draft' end;
end;
$$;

revoke all on function public.save_care_plan_tasks(
  uuid,
  text,
  integer,
  jsonb,
  jsonb,
  boolean
) from public, anon;

grant execute on function public.save_care_plan_tasks(
  uuid,
  text,
  integer,
  jsonb,
  jsonb,
  boolean
) to authenticated;
