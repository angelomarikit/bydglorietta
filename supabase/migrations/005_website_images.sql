-- Run this after 004_website_content.sql.
-- It creates the storage used when an administrator replaces a photograph.
-- Do not run it from the app. Paste it into the Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-images',
  'website-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "website images are publicly readable" on storage.objects;
drop policy if exists "administrators upload website images" on storage.objects;
drop policy if exists "administrators update website images" on storage.objects;
drop policy if exists "administrators delete website images" on storage.objects;

create policy "website images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'website-images');

create policy "administrators upload website images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'website-images' and public.is_administrator());

create policy "administrators update website images"
on storage.objects
for update
to authenticated
using (bucket_id = 'website-images' and public.is_administrator())
with check (bucket_id = 'website-images' and public.is_administrator());

create policy "administrators delete website images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'website-images' and public.is_administrator());
