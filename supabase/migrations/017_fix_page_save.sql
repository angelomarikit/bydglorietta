-- Paste this into the Supabase SQL editor once.
-- The save failed because the argument page_key had the same name as the table column.

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

revoke all on function public.save_website_page(text, jsonb) from public;
grant execute on function public.save_website_page(text, jsonb) to authenticated;
