drop policy if exists "Users can view their own card photos" on storage.objects;
create policy "Users can view their own card photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete their own card photos" on storage.objects;
create policy "Users can delete their own card photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'card-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cardly_access
    where user_id = (select auth.uid())
  )
);
