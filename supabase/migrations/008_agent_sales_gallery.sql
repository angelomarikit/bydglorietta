-- Run this after 001 through 007. Do not rerun the earlier files.
-- Adds a proof-of-sales photo gallery to each sales agent.

alter table public.sales_agents
  add column if not exists sales_photos jsonb not null default '[]'::jsonb;

create or replace function public.clean_sales_photos(raw jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  item jsonb;
  cleaned jsonb := '[]'::jsonb;
  path text;
begin
  if raw is null or jsonb_typeof(raw) <> 'array' then
    raise exception 'Add the sales photos as a list.';
  end if;
  if jsonb_array_length(raw) > 12 then
    raise exception 'Add up to 12 sales photos.';
  end if;
  for item in select value from jsonb_array_elements(raw)
  loop
    if jsonb_typeof(item) <> 'string' then
      raise exception 'A sales photo could not be saved.';
    end if;
    path := btrim(item #>> '{}');
    if path !~ '^[0-9a-f-]{36}\.(jpg|png|webp)$' then
      raise exception 'A sales photo could not be saved.';
    end if;
    cleaned := cleaned || jsonb_build_array(to_jsonb(path));
  end loop;
  return cleaned;
end;
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
    'video_path', video_path,
    'rating_value', rating_value,
    'rating_count', rating_count,
    'testimonials', testimonials,
    'sales_photos', sales_photos,
    'page_identifier', page_identifier
  )
  from public.sales_agents
  where page_identifier = page_key
    and is_hidden = false;
$$;

drop function if exists public.create_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb);

create or replace function public.create_sales_agent(
  p_full_name text,
  p_contact_number text,
  p_email text,
  p_facebook_url text,
  p_instagram_url text,
  p_whatsapp_number text,
  p_viber_number text,
  p_photo_path text,
  p_page_identifier text,
  p_video_path text,
  p_rating_value numeric,
  p_rating_count integer,
  p_testimonials jsonb,
  p_sales_photos jsonb
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
  if p_rating_value is not null and (p_rating_value < 1 or p_rating_value > 5) then
    raise exception 'Enter a rating from 1 to 5.';
  end if;
  if p_rating_count is not null and (p_rating_count < 0 or p_rating_count > 1000000) then
    raise exception 'Enter a review count.';
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
    video_path,
    rating_value,
    rating_count,
    testimonials,
    sales_photos,
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
    nullif(btrim(p_video_path), ''),
    p_rating_value,
    p_rating_count,
    public.clean_testimonials(coalesce(p_testimonials, '[]'::jsonb)),
    public.clean_sales_photos(coalesce(p_sales_photos, '[]'::jsonb)),
    p_page_identifier
  )
  returning * into created;
  return to_jsonb(created);
end;
$$;

drop function if exists public.update_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb);

create or replace function public.update_sales_agent(
  page_key text,
  p_full_name text,
  p_contact_number text,
  p_email text,
  p_facebook_url text,
  p_instagram_url text,
  p_whatsapp_number text,
  p_viber_number text,
  p_photo_path text,
  p_video_path text,
  p_rating_value numeric,
  p_rating_count integer,
  p_testimonials jsonb,
  p_sales_photos jsonb
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
  if p_rating_value is not null and (p_rating_value < 1 or p_rating_value > 5) then
    raise exception 'Enter a rating from 1 to 5.';
  end if;
  if p_rating_count is not null and (p_rating_count < 0 or p_rating_count > 1000000) then
    raise exception 'Enter a review count.';
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
    video_path = nullif(btrim(p_video_path), ''),
    rating_value = p_rating_value,
    rating_count = p_rating_count,
    testimonials = public.clean_testimonials(coalesce(p_testimonials, '[]'::jsonb)),
    sales_photos = public.clean_sales_photos(coalesce(p_sales_photos, '[]'::jsonb)),
    updated_at = now()
  where page_identifier = page_key
  returning * into updated;
  if not found then
    raise exception 'not found';
  end if;
  return to_jsonb(updated);
end;
$$;

revoke all on function public.clean_sales_photos(jsonb) from public;
revoke all on function public.create_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb, jsonb) from public;
revoke all on function public.update_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb, jsonb) from public;

grant execute on function public.create_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb, jsonb) to authenticated;
grant execute on function public.update_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb, jsonb) to authenticated;
