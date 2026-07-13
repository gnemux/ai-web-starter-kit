do $$
begin
  if (
    select count(*)
    from public.care_plan_cats
    where plan_id = '75000000-0000-0000-0000-000000000001'
  ) <> 2 then
    raise exception 'backfill must preserve both legacy participant positions';
  end if;

  if not exists (
    select 1
    from public.care_plan_cats
    where plan_id = '75000000-0000-0000-0000-000000000001'
      and sort_order = 0
      and cat_id = '25000000-0000-0000-0000-000000000001'
      and cat_name_snapshot = 'Owner A Cat'
      and cat_deleted_at is null
  ) then
    raise exception 'backfill must preserve the same-owner participant';
  end if;

  if not exists (
    select 1
    from public.care_plan_cats
    where plan_id = '75000000-0000-0000-0000-000000000001'
      and sort_order = 1
      and cat_id is null
      and cat_name_snapshot = '已删除猫咪'
      and cat_deleted_at is not null
  ) then
    raise exception 'foreign participant id must become a neutral tombstone';
  end if;

  if exists (
    select 1
    from public.care_plan_cats
    where plan_id = '75000000-0000-0000-0000-000000000001'
      and (
        cat_id = '25000000-0000-0000-0000-000000000002'
        or cat_name_snapshot = 'Owner B Secret Cat'
      )
  ) then
    raise exception 'backfill leaked another owner cat id or name';
  end if;
end;
$$;
