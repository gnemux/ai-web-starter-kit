-- Public bucket object URLs remain readable without a storage.objects SELECT
-- policy. Removing this broad policy prevents anon/authenticated clients from
-- enumerating every cat photo through the Storage list API.

drop policy if exists "Cat photos are publicly readable" on storage.objects;

drop policy if exists "Owners can read their cat photos" on storage.objects;
create policy "Owners can read their cat photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cat-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
