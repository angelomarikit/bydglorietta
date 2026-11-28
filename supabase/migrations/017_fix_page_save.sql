-- Paste this into the Supabase SQL editor once.
-- The save failed because the argument page_key had the same name as the table column.

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
  if save_website_page.page_key not in ('home', 'car', 'contact', 'drive', 'blog', 'footer', 'notes', 'service', 'registration', 'about') then
    raise exception 'unknown page';
  end if;
  if save_website_page.fields is null or jsonb_typeof(save_website_page.fields) <> 'object' or octet_length(save_website_page.fields::text) > 100000 then
    raise exception 'invalid page';
  end if;
  insert into public.website_content as saved (page_key, fields)
  values (save_website_page.page_key, save_website_page.fields)
  on conflict (page_key) do update
    set fields = excluded.fields,
        updated_at = now();
end;
$$;

revoke all on function public.save_website_page(text, jsonb) from public;
grant execute on function public.save_website_page(text, jsonb) to authenticated;
