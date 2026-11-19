-- Run this second, after 001_sales_agents.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-photos',
  'agent-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "agent photos are publicly readable" on storage.objects;
drop policy if exists "administrators upload agent photos" on storage.objects;
drop policy if exists "administrators update agent photos" on storage.objects;
drop policy if exists "administrators delete agent photos" on storage.objects;

create policy "agent photos are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'agent-photos');

create policy "administrators upload agent photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'agent-photos' and public.is_administrator());

create policy "administrators update agent photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'agent-photos' and public.is_administrator())
with check (bucket_id = 'agent-photos' and public.is_administrator());

create policy "administrators delete agent photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'agent-photos' and public.is_administrator());
