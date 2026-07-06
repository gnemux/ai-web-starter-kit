alter table public.catcare_product_catalog
  drop constraint if exists catcare_product_catalog_item_type_check;

alter table public.catcare_product_catalog
  add constraint catcare_product_catalog_item_type_check
  check (item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'supplement', 'litter', 'supply', 'other'));

alter table public.owner_item_library
  drop constraint if exists owner_item_library_item_type_check;

alter table public.owner_item_library
  add constraint owner_item_library_item_type_check
  check (item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'supplement', 'litter', 'supply', 'other'));

alter table public.care_items
  drop constraint if exists care_items_item_type_check;

alter table public.care_items
  add constraint care_items_item_type_check
  check (item_type in ('dry_food', 'wet_food', 'treat', 'medicine', 'supplement', 'litter', 'supply', 'other'));

update public.catcare_product_catalog
set item_type = 'supplement',
    updated_at = now()
where item_type = 'medicine'
  and (
    display_name like '%益生菌%' or
    display_name like '%鱼油%' or
    display_name like '%化毛%' or
    display_name like '%营养膏%' or
    display_name like '%卵磷脂%' or
    display_name like '%关节营养%' or
    display_name like '%赖氨酸%' or
    display_name like '%FortiFlora%' or
    display_name like '%Proviable%' or
    display_name like '%Probiotic%' or
    display_name like '%Cosequin%' or
    display_name like '%Viralys%'
  );

update public.owner_item_library
set item_type = 'supplement',
    updated_at = now()
where item_type = 'medicine'
  and (
    display_name like '%益生菌%' or
    display_name like '%鱼油%' or
    display_name like '%化毛%' or
    display_name like '%营养膏%' or
    display_name like '%卵磷脂%' or
    display_name like '%关节营养%' or
    display_name like '%赖氨酸%' or
    display_name like '%FortiFlora%' or
    display_name like '%Proviable%' or
    display_name like '%Probiotic%' or
    display_name like '%Cosequin%' or
    display_name like '%Viralys%'
  );

insert into public.catcare_product_catalog
  (item_type, brand, product_name, display_name, aliases, country_region)
values
  ('litter', 'pidan', '混合猫砂', 'pidan 混合猫砂', array['皮蛋 混合猫砂'], 'CN'),
  ('litter', 'pidan', '豆腐猫砂', 'pidan 豆腐猫砂', array['皮蛋 豆腐猫砂'], 'CN'),
  ('litter', '小壳', '豆腐猫砂', '小壳 豆腐猫砂', '{}', 'CN'),
  ('litter', '小壳', '混合猫砂', '小壳 混合猫砂', '{}', 'CN'),
  ('litter', 'N1', '玉米豆腐猫砂', 'N1 玉米豆腐猫砂', array['N1 豆腐猫砂'], 'CN'),
  ('litter', '里兜', '豆腐猫砂', '里兜 豆腐猫砂', '{}', 'CN'),
  ('litter', '里兜', '混合猫砂', '里兜 混合猫砂', '{}', 'CN'),
  ('litter', '霍曼', '豆腐猫砂', '霍曼 豆腐猫砂', array['Homerun 豆腐猫砂'], 'CN'),
  ('litter', '宠幸', '豆腐猫砂', '宠幸 豆腐猫砂', '{}', 'CN'),
  ('litter', '喵洁客', '膨润土猫砂', '喵洁客 膨润土猫砂', array['CatMagic'], 'CN'),
  ('litter', '蓝钻', '膨润土猫砂', '蓝钻 膨润土猫砂', array['Ever Clean 蓝钻猫砂'], 'US'),
  ('litter', 'Ever Clean', '蓝钻猫砂', 'Ever Clean 蓝钻猫砂', array['蓝钻'], 'US'),
  ('litter', 'World''s Best', '玉米猫砂', 'World''s Best 玉米猫砂', array['世界最好猫砂'], 'US'),
  ('litter', 'Fresh Step', '膨润土猫砂', 'Fresh Step 膨润土猫砂', '{}', 'US'),
  ('litter', 'Arm & Hammer', '膨润土猫砂', 'Arm & Hammer 膨润土猫砂', '{}', 'US'),
  ('litter', 'Catit', '豌豆壳猫砂', 'Catit 豌豆壳猫砂', '{}', 'CA'),
  ('litter', 'PrettyLitter', '水晶猫砂', 'PrettyLitter 水晶猫砂', '{}', 'US'),
  ('litter', '通用', '矿砂', '矿砂', '{}', null),
  ('litter', '通用', '豆腐砂', '豆腐砂', '{}', null),
  ('litter', '通用', '混合砂', '混合砂', '{}', null),
  ('litter', '通用', '水晶砂', '水晶砂', '{}', null),
  ('litter', '通用', '木砂', '木砂', '{}', null)
on conflict (item_type, display_name) do update
set
  aliases = excluded.aliases,
  brand = excluded.brand,
  country_region = excluded.country_region,
  product_name = excluded.product_name,
  updated_at = now();
