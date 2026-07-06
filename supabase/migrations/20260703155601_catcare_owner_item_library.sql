create table if not exists public.catcare_product_catalog (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (
    item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'litter', 'supply', 'other')
  ),
  brand text check (brand is null or char_length(brand) <= 80),
  product_name text not null check (char_length(product_name) between 1 and 160),
  display_name text not null check (char_length(display_name) between 1 and 200),
  aliases text[] not null default '{}',
  country_region text check (country_region is null or char_length(country_region) <= 80),
  source text not null default 'seed' check (source in ('seed', 'manual', 'import')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_type, display_name)
);

create table if not exists public.owner_item_library (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  catalog_product_id uuid references public.catcare_product_catalog(id) on delete set null,
  item_type text not null check (
    item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'litter', 'supply', 'other')
  ),
  display_name text not null check (char_length(display_name) between 1 and 160),
  brand text check (brand is null or char_length(brand) <= 80),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists owner_item_library_owner_type_name_idx
  on public.owner_item_library (owner_id, item_type, lower(display_name));

create table if not exists public.cat_item_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  owner_item_id uuid not null references public.owner_item_library(id) on delete cascade,
  default_amount text check (default_amount is null or char_length(default_amount) <= 120),
  default_frequency text check (default_frequency is null or char_length(default_frequency) <= 120),
  instructions text check (instructions is null or char_length(instructions) <= 2000),
  visible_to_sitter boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cat_id, owner_item_id)
);

create index if not exists cat_item_assignments_owner_cat_idx
  on public.cat_item_assignments (owner_id, cat_id);

drop trigger if exists set_catcare_product_catalog_updated_at on public.catcare_product_catalog;
create trigger set_catcare_product_catalog_updated_at
  before update on public.catcare_product_catalog
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_owner_item_library_updated_at on public.owner_item_library;
create trigger set_owner_item_library_updated_at
  before update on public.owner_item_library
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_cat_item_assignments_updated_at on public.cat_item_assignments;
create trigger set_cat_item_assignments_updated_at
  before update on public.cat_item_assignments
  for each row
  execute function public.set_updated_at();

alter table public.catcare_product_catalog enable row level security;
alter table public.owner_item_library enable row level security;
alter table public.cat_item_assignments enable row level security;

grant select on public.catcare_product_catalog to anon, authenticated;
grant select, insert, update, delete on public.owner_item_library to authenticated;
grant select, insert, update, delete on public.cat_item_assignments to authenticated;
grant all
  on public.catcare_product_catalog,
     public.owner_item_library,
     public.cat_item_assignments
  to service_role;

drop policy if exists "Product catalog is readable" on public.catcare_product_catalog;
create policy "Product catalog is readable"
  on public.catcare_product_catalog
  for select
  to anon, authenticated
  using (is_active);

drop policy if exists "Owners can read their item library" on public.owner_item_library;
create policy "Owners can read their item library"
  on public.owner_item_library
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can insert their item library" on public.owner_item_library;
create policy "Owners can insert their item library"
  on public.owner_item_library
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their item library" on public.owner_item_library;
create policy "Owners can update their item library"
  on public.owner_item_library
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete their item library" on public.owner_item_library;
create policy "Owners can delete their item library"
  on public.owner_item_library
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can read their cat item assignments" on public.cat_item_assignments;
create policy "Owners can read their cat item assignments"
  on public.cat_item_assignments
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can insert their cat item assignments" on public.cat_item_assignments;
create policy "Owners can insert their cat item assignments"
  on public.cat_item_assignments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.owner_item_library
      where owner_item_library.id = cat_item_assignments.owner_item_id
        and owner_item_library.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can update their cat item assignments" on public.cat_item_assignments;
create policy "Owners can update their cat item assignments"
  on public.cat_item_assignments
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1
      from public.cats
      where cats.id = cat_item_assignments.cat_id
        and cats.owner_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.owner_item_library
      where owner_item_library.id = cat_item_assignments.owner_item_id
        and owner_item_library.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Owners can delete their cat item assignments" on public.cat_item_assignments;
create policy "Owners can delete their cat item assignments"
  on public.cat_item_assignments
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

insert into public.catcare_product_catalog
  (item_type, brand, product_name, display_name, aliases, country_region)
values
  ('dry_food', '阿飞和巴弟', 'E76 全价鲜肉猫粮', '阿飞和巴弟 E76 全价鲜肉猫粮', array['E76'], 'CN'),
  ('dry_food', '高爷家', '全价鲜肉猫粮', '高爷家 全价鲜肉猫粮', '{}', 'CN'),
  ('dry_food', '鲜朗', '低温烘焙全价猫粮', '鲜朗 低温烘焙全价猫粮', '{}', 'CN'),
  ('dry_food', '皇家', '室内成猫粮', '皇家 室内成猫粮', array['Royal Canin'], 'FR'),
  ('dry_food', '冠能', '成猫优护粮', '冠能 成猫优护粮', array['Purina Pro Plan'], 'US'),
  ('dry_food', '渴望', '六种鱼猫粮', '渴望 六种鱼猫粮（Orijen）', array['Orijen'], 'CA'),
  ('dry_food', '爱肯拿', '海洋盛宴猫粮', '爱肯拿 海洋盛宴猫粮（Acana）', array['Acana'], 'CA'),
  ('dry_food', '百利', '本能原始无谷鸡肉猫粮', '百利 本能原始无谷鸡肉猫粮', array['Instinct'], 'US'),
  ('wet_food', '阿飞和巴弟', '主食罐 鸡肉配方', '阿飞和巴弟 主食罐 鸡肉配方', '{}', 'CN'),
  ('wet_food', '海洋之星', '三文鱼主食罐', '海洋之星 三文鱼主食罐', '{}', 'UK'),
  ('wet_food', '巅峰', '主食罐 牛肉配方', '巅峰 主食罐 牛肉配方（Ziwi Peak）', array['Ziwi Peak'], 'NZ'),
  ('wet_food', 'K9 Natural', '主食罐 鸡肉配方', 'K9 Natural 主食罐 鸡肉配方', '{}', 'NZ'),
  ('wet_food', 'Tiki Cat', '主食罐 鸡肉配方', 'Tiki Cat 主食罐 鸡肉配方', '{}', 'US'),
  ('wet_food', 'Weruva', '唯美味 鸡肉主食罐', 'Weruva 唯美味 鸡肉主食罐', array['唯美味'], 'US'),
  ('treat', '小壳', '鸡肉猫条', '小壳 鸡肉猫条', '{}', 'CN'),
  ('treat', '小壳', '冻干鸡肉粒', '小壳 冻干鸡肉粒', '{}', 'CN'),
  ('treat', '阿飞和巴弟', '鸡肉冻干零食', '阿飞和巴弟 鸡肉冻干零食', '{}', 'CN'),
  ('treat', '齿一生', '猫咪洁齿零食', '齿一生 猫咪洁齿零食', '{}', 'CN'),
  ('treat', 'CIAO', '啾噜 金枪鱼猫条', 'CIAO 啾噜 金枪鱼猫条', array['Inaba'], 'JP'),
  ('treat', 'Greenies', 'Feline 猫咪洁齿零食', 'Greenies Feline 猫咪洁齿零食', '{}', 'US'),
  ('medicine', '冠能', 'FortiFlora 猫用益生菌', '冠能 FortiFlora 猫用益生菌', array['Purina Pro Plan FortiFlora'], 'US'),
  ('medicine', '卫仕', '猫用益生菌', '卫仕 猫用益生菌', '{}', 'CN'),
  ('medicine', '红狗', '益生菌肠胃宝', '红狗 益生菌肠胃宝', '{}', 'CN'),
  ('medicine', '麦德氏', 'IN-Plus 猫用益生菌', '麦德氏 IN-Plus 猫用益生菌', '{}', 'CN'),
  ('medicine', 'Nutramax', 'Cosequin 猫用关节营养', 'Nutramax Cosequin 猫用关节营养', '{}', 'US'),
  ('litter', 'pidan', '混合猫砂', 'pidan 混合猫砂', array['皮蛋'], 'CN'),
  ('litter', '小壳', '豆腐猫砂', '小壳 豆腐猫砂', '{}', 'CN'),
  ('litter', 'Ever Clean', '蓝钻猫砂', 'Ever Clean 蓝钻猫砂', array['蓝钻'], 'US'),
  ('supply', '通用', '自动饮水机', '自动饮水机', '{}', null),
  ('supply', '通用', '自动喂食器', '自动喂食器', '{}', null),
  ('supply', '通用', '猫砂铲', '猫砂铲', '{}', null),
  ('supply', '通用', '航空箱', '航空箱', '{}', null)
on conflict (item_type, display_name) do update
set
  brand = excluded.brand,
  product_name = excluded.product_name,
  aliases = excluded.aliases,
  country_region = excluded.country_region,
  is_active = true;

insert into public.owner_item_library
  (owner_id, item_type, display_name, created_at, updated_at)
select distinct
  care_items.owner_id,
  care_items.item_type,
  trim(care_items.name),
  min(care_items.created_at),
  max(care_items.updated_at)
from public.care_items
where trim(care_items.name) <> ''
group by care_items.owner_id, care_items.item_type, trim(care_items.name)
on conflict (owner_id, item_type, lower(display_name)) do nothing;

insert into public.cat_item_assignments
  (
    owner_id,
    cat_id,
    owner_item_id,
    default_amount,
    default_frequency,
    instructions,
    visible_to_sitter,
    created_at,
    updated_at
  )
select
  care_items.owner_id,
  care_items.cat_id,
  owner_item_library.id,
  care_items.default_amount,
  care_items.default_frequency,
  care_items.instructions,
  care_items.visible_to_sitter,
  care_items.created_at,
  care_items.updated_at
from public.care_items
join public.owner_item_library
  on owner_item_library.owner_id = care_items.owner_id
  and owner_item_library.item_type = care_items.item_type
  and lower(owner_item_library.display_name) = lower(trim(care_items.name))
where trim(care_items.name) <> ''
on conflict (cat_id, owner_item_id) do nothing;

insert into public.owner_item_library
  (owner_id, item_type, display_name, created_at, updated_at)
select distinct
  care_routines.owner_id,
  case care_routine_items.title
    when '主粮' then 'dry_food'
    when '罐头' then 'wet_food'
    when '零食' then 'treat'
  end,
  trim(split_part(care_routine_items.instructions, ' · ', 1)),
  min(care_routine_items.created_at),
  max(care_routine_items.updated_at)
from public.care_routine_items
join public.care_routines
  on care_routines.id = care_routine_items.routine_id
where care_routine_items.enabled = true
  and care_routine_items.title in ('主粮', '罐头', '零食')
  and position(' · ' in coalesce(care_routine_items.instructions, '')) > 0
  and trim(split_part(care_routine_items.instructions, ' · ', 1)) <> ''
group by
  care_routines.owner_id,
  care_routine_items.title,
  trim(split_part(care_routine_items.instructions, ' · ', 1))
on conflict (owner_id, item_type, lower(display_name)) do nothing;

insert into public.cat_item_assignments
  (
    owner_id,
    cat_id,
    owner_item_id,
    default_amount,
    default_frequency,
    instructions,
    visible_to_sitter,
    created_at,
    updated_at
  )
select
  care_routines.owner_id,
  care_routines.cat_id,
  owner_item_library.id,
  nullif(trim(split_part(care_routine_items.instructions, ' · ', 2)), ''),
  care_routine_items.frequency,
  null,
  true,
  care_routine_items.created_at,
  care_routine_items.updated_at
from public.care_routine_items
join public.care_routines
  on care_routines.id = care_routine_items.routine_id
join public.owner_item_library
  on owner_item_library.owner_id = care_routines.owner_id
  and owner_item_library.item_type = case care_routine_items.title
    when '主粮' then 'dry_food'
    when '罐头' then 'wet_food'
    when '零食' then 'treat'
  end
  and lower(owner_item_library.display_name) =
    lower(trim(split_part(care_routine_items.instructions, ' · ', 1)))
where care_routine_items.enabled = true
  and care_routine_items.title in ('主粮', '罐头', '零食')
  and position(' · ' in coalesce(care_routine_items.instructions, '')) > 0
  and trim(split_part(care_routine_items.instructions, ' · ', 1)) <> ''
on conflict (cat_id, owner_item_id) do update
set
  default_amount = excluded.default_amount,
  default_frequency = excluded.default_frequency,
  visible_to_sitter = true,
  updated_at = now();
