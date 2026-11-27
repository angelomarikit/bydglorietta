-- Run this after 001 through 014. Do not rerun the earlier files.
-- Lets the admin save the About Us page, including its photographs.

alter table public.website_content drop constraint if exists website_content_key;

alter table public.website_content
  add constraint website_content_key check (
    page_key in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes', 'service', 'registration', 'about')
  );

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
  if page_key not in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes', 'service', 'registration', 'about') then
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

revoke all on function public.save_website_page(text, jsonb) from public;
grant execute on function public.save_website_page(text, jsonb) to authenticated;
