-- Run this after 001, 002, and 003.
-- It adds the website wording the admin can edit.
-- Do not run it from the app. Paste it into the Supabase SQL Editor.

create table public.website_content (
  page_key text primary key,
  fields jsonb not null,
  updated_at timestamptz not null default now(),
  constraint website_content_key check (
    page_key in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes')
  ),
  constraint website_content_object check (jsonb_typeof(fields) = 'object'),
  constraint website_content_size check (octet_length(fields::text) <= 100000)
);

alter table public.website_content enable row level security;

revoke all on public.website_content from anon, authenticated;

create or replace function public.get_public_website()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(page_key, fields), '{}'::jsonb)
  from public.website_content;
$$;

create or replace function public.save_website_page(page_key text, fields jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  if page_key not in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes') then
    raise exception 'unknown page';
  end if;
  if fields is null or jsonb_typeof(fields) <> 'object' or octet_length(fields::text) > 100000 then
    raise exception 'invalid page';
  end if;
  insert into public.website_content as saved (page_key, fields)
  values (page_key, fields)
  on conflict (page_key) do update
    set fields = excluded.fields,
        updated_at = now();
end;
$$;

revoke all on function public.get_public_website() from public;
revoke all on function public.save_website_page(text, jsonb) from public;
grant execute on function public.get_public_website() to anon, authenticated;
grant execute on function public.save_website_page(text, jsonb) to authenticated;
