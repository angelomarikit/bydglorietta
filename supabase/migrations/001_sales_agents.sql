-- Run this first in the Supabase SQL Editor.
-- Do not run 002 or 003 until this finishes without error.

create table public.administrators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.sales_agents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact_number text not null,
  email text,
  facebook_url text,
  instagram_url text,
  whatsapp_number text,
  viber_number text,
  photo_path text,
  page_identifier text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_agents_name_length check (char_length(btrim(full_name)) between 2 and 120),
  constraint sales_agents_phone check (contact_number ~ '^[0-9+().[:space:]-]{7,32}$'),
  constraint sales_agents_email check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint sales_agents_facebook check (
    facebook_url is null or facebook_url ~* '^https://(www\.)?(facebook|fb)\.com/.+'
  ),
  constraint sales_agents_instagram check (
    instagram_url is null or instagram_url ~* '^https://(www\.)?instagram\.com/.+'
  ),
  constraint sales_agents_whatsapp check (
    whatsapp_number is null or whatsapp_number ~ '^[0-9+().[:space:]-]{7,32}$'
  ),
  constraint sales_agents_viber check (
    viber_number is null or viber_number ~ '^[0-9+().[:space:]-]{7,32}$'
  ),
  constraint sales_agents_photo check (
    photo_path is null or photo_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
  ),
  constraint sales_agents_page_identifier check (
    page_identifier ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(page_identifier) <= 60
  ),
  constraint sales_agents_page_identifier_unique unique (page_identifier)
);

create index sales_agents_name on public.sales_agents (full_name);

alter table public.administrators enable row level security;
alter table public.sales_agents enable row level security;

revoke all on public.administrators from anon, authenticated;
revoke all on public.sales_agents from anon, authenticated;

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.administrators
    where user_id = auth.uid()
  );
$$;

create or replace function public.get_public_agent(page_key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'full_name', full_name,
    'contact_number', contact_number,
    'email', email,
    'facebook_url', facebook_url,
    'instagram_url', instagram_url,
    'whatsapp_number', whatsapp_number,
    'viber_number', viber_number,
    'photo_path', photo_path,
    'page_identifier', page_identifier
  )
  from public.sales_agents
  where page_identifier = page_key
    and is_hidden = false;
$$;

create or replace function public.page_link_in_use(candidate text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  return exists (
    select 1 from public.sales_agents where page_identifier = candidate
  );
end;
$$;

create or replace function public.list_sales_agents()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  return coalesce(
    (
      select jsonb_agg(to_jsonb(agents) order by agents.full_name)
      from public.sales_agents as agents
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.get_managed_agent(page_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  found jsonb;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  select to_jsonb(agents)
  into found
  from public.sales_agents as agents
  where agents.page_identifier = page_key;
  return found;
end;
$$;

create or replace function public.create_sales_agent(
  p_full_name text,
  p_contact_number text,
  p_email text,
  p_facebook_url text,
  p_instagram_url text,
  p_whatsapp_number text,
  p_viber_number text,
  p_photo_path text,
  p_page_identifier text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.sales_agents;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  insert into public.sales_agents (
    full_name,
    contact_number,
    email,
    facebook_url,
    instagram_url,
    whatsapp_number,
    viber_number,
    photo_path,
    page_identifier
  )
  values (
    btrim(p_full_name),
    btrim(p_contact_number),
    nullif(btrim(p_email), ''),
    nullif(btrim(p_facebook_url), ''),
    nullif(btrim(p_instagram_url), ''),
    nullif(btrim(p_whatsapp_number), ''),
    nullif(btrim(p_viber_number), ''),
    nullif(btrim(p_photo_path), ''),
    p_page_identifier
  )
  returning * into created;
  return to_jsonb(created);
end;
$$;

create or replace function public.update_sales_agent(
  page_key text,
  p_full_name text,
  p_contact_number text,
  p_email text,
  p_facebook_url text,
  p_instagram_url text,
  p_whatsapp_number text,
  p_viber_number text,
  p_photo_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.sales_agents;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  update public.sales_agents
  set
    full_name = btrim(p_full_name),
    contact_number = btrim(p_contact_number),
    email = nullif(btrim(p_email), ''),
    facebook_url = nullif(btrim(p_facebook_url), ''),
    instagram_url = nullif(btrim(p_instagram_url), ''),
    whatsapp_number = nullif(btrim(p_whatsapp_number), ''),
    viber_number = nullif(btrim(p_viber_number), ''),
    photo_path = nullif(btrim(p_photo_path), ''),
    updated_at = now()
  where page_identifier = page_key
  returning * into updated;
  if not found then
    raise exception 'not found';
  end if;
  return to_jsonb(updated);
end;
$$;

create or replace function public.set_agent_visibility(page_key text, hidden boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.sales_agents;
begin
  if not public.is_administrator() then
    raise exception 'not authorized';
  end if;
  update public.sales_agents
  set is_hidden = hidden, updated_at = now()
  where page_identifier = page_key
  returning * into updated;
  if not found then
    raise exception 'not found';
  end if;
  return to_jsonb(updated);
end;
$$;

revoke all on function public.is_administrator() from public;
revoke all on function public.get_public_agent(text) from public;
revoke all on function public.page_link_in_use(text) from public;
revoke all on function public.list_sales_agents() from public;
revoke all on function public.get_managed_agent(text) from public;
revoke all on function public.create_sales_agent(text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.update_sales_agent(text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.set_agent_visibility(text, boolean) from public;

grant execute on function public.is_administrator() to authenticated;
grant execute on function public.get_public_agent(text) to anon, authenticated;
grant execute on function public.page_link_in_use(text) to authenticated;
grant execute on function public.list_sales_agents() to authenticated;
grant execute on function public.get_managed_agent(text) to authenticated;
grant execute on function public.create_sales_agent(text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.update_sales_agent(text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.set_agent_visibility(text, boolean) to authenticated;
