-- Paste this into the Supabase SQL editor once.
-- It lets the admin save Car details, Contact, Service Center, About Us, and Vehicle Registration Inquiry.

create table if not exists public.website_content (
  page_key text primary key,
  fields jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.website_content drop constraint if exists website_content_key;
alter table public.website_content drop constraint if exists website_content_object;
alter table public.website_content drop constraint if exists website_content_size;

alter table public.website_content
  add constraint website_content_key check (
    page_key in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes', 'service', 'registration', 'about')
  );

alter table public.website_content
  add constraint website_content_object check (jsonb_typeof(fields) = 'object');

alter table public.website_content
  add constraint website_content_size check (octet_length(fields::text) <= 100000);

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
declare
  chosen_page text := save_website_page.page_key;
  chosen_fields jsonb := save_website_page.fields;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  if chosen_page not in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes', 'service', 'registration', 'about') then
    raise exception 'unknown page';
  end if;
  if chosen_fields is null or jsonb_typeof(chosen_fields) <> 'object' or octet_length(chosen_fields::text) > 100000 then
    raise exception 'invalid page';
  end if;
  insert into public.website_content (page_key, fields)
  values (chosen_page, chosen_fields)
  on conflict on constraint website_content_pkey do update
    set fields = excluded.fields,
        updated_at = now();
end;
$$;

revoke all on function public.get_public_website() from public;
revoke all on function public.save_website_page(text, jsonb) from public;
grant execute on function public.get_public_website() to anon, authenticated;
grant execute on function public.save_website_page(text, jsonb) to authenticated;
