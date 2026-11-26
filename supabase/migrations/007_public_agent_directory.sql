-- Run this after 001 through 006. Do not rerun the earlier files.
-- Lets the homepage list visible sales agents and their photos.

create or replace function public.list_public_agents()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'full_name', full_name,
          'photo_path', photo_path,
          'page_identifier', page_identifier
        )
        order by lower(full_name)
      )
      from public.sales_agents
      where is_hidden = false
    ),
    '[]'::jsonb
  );
$$;

revoke all on function public.list_public_agents() from public;
grant execute on function public.list_public_agents() to anon, authenticated;
