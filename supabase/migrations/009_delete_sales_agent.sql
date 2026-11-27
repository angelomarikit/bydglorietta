-- Run this after 001 through 008. Do not rerun the earlier files.
-- Lets an administrator permanently delete a sales agent.

create or replace function public.delete_sales_agent(page_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  removed public.sales_agents;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  delete from public.sales_agents
  where page_identifier = page_key
  returning * into removed;
  if not found then
    raise exception 'not found';
  end if;
  return to_jsonb(removed);
end;
$$;

revoke all on function public.delete_sales_agent(text) from public;
grant execute on function public.delete_sales_agent(text) to authenticated;
