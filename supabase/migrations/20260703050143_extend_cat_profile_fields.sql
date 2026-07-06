alter table public.cats
  add column if not exists gender text,
  add column if not exists birth_date date,
  add column if not exists weight_kg numeric(4,1),
  add column if not exists photo_url text;

alter table public.cats
  drop constraint if exists cats_gender_check,
  add constraint cats_gender_check
    check (gender is null or gender in ('male', 'female', 'unknown'));

alter table public.cats
  drop constraint if exists cats_weight_kg_check,
  add constraint cats_weight_kg_check
    check (weight_kg is null or (weight_kg > 0 and weight_kg <= 30));

alter table public.cats
  drop constraint if exists cats_photo_url_check,
  add constraint cats_photo_url_check
    check (photo_url is null or char_length(photo_url) <= 2048);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat-photos',
  'cat-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Cat photos are publicly readable" on storage.objects;
create policy "Cat photos are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cat-photos');

drop policy if exists "Owners can upload their cat photos" on storage.objects;
create policy "Owners can upload their cat photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owners can update their cat photos" on storage.objects;
create policy "Owners can update their cat photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owners can delete their cat photos" on storage.objects;
create policy "Owners can delete their cat photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
