-- Run this after 001 through 005. Do not rerun the earlier files.
-- Adds one personal video, a review rating, and customer testimonials to each sales agent.

alter table public.sales_agents
  add column if not exists video_path text,
  add column if not exists rating_value numeric(2, 1),
  add column if not exists rating_count integer,
  add column if not exists testimonials jsonb not null default '[]'::jsonb;

alter table public.sales_agents drop constraint if exists sales_agents_video;
alter table public.sales_agents
  add constraint sales_agents_video check (
    video_path is null or video_path ~ '^[0-9a-f-]{36}\.mp4$'
  );

alter table public.sales_agents drop constraint if exists sales_agents_rating_value;
alter table public.sales_agents
  add constraint sales_agents_rating_value check (
    rating_value is null or (rating_value >= 1 and rating_value <= 5)
  );

alter table public.sales_agents drop constraint if exists sales_agents_rating_count;
alter table public.sales_agents
  add constraint sales_agents_rating_count check (
    rating_count is null or (rating_count >= 0 and rating_count <= 1000000)
  );

create or replace function public.clean_testimonials(raw jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  item jsonb;
  cleaned jsonb := '[]'::jsonb;
  person text;
  words text;
begin
  if raw is null or jsonb_typeof(raw) <> 'array' then
    raise exception 'Enter the testimonials as a list.';
  end if;
  if jsonb_array_length(raw) > 8 then
    raise exception 'Add up to 8 testimonials.';
  end if;
  for item in select value from jsonb_array_elements(raw)
  loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'Each testimonial needs a name and a quote.';
    end if;
    person := btrim(coalesce(item->>'name', ''));
    words := btrim(coalesce(item->>'quote', ''));
    if char_length(person) < 2 or char_length(person) > 80 then
      raise exception 'Enter the customer name.';
    end if;
    if char_length(words) < 8 or char_length(words) > 400 then
      raise exception 'Enter a customer quote between 8 and 400 characters.';
    end if;
    cleaned := cleaned || jsonb_build_array(jsonb_build_object('name', person, 'quote', words));
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
    'page_identifier', page_identifier
  )
  from public.sales_agents
  where page_identifier = page_key
    and is_hidden = false;
$$;

drop function if exists public.create_sales_agent(text, text, text, text, text, text, text, text, text);

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
  p_testimonials jsonb
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
    p_page_identifier
  )
  returning * into created;
  return to_jsonb(created);
end;
$$;

drop function if exists public.update_sales_agent(text, text, text, text, text, text, text, text, text);

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
  p_testimonials jsonb
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
    updated_at = now()
  where page_identifier = page_key
  returning * into updated;
  if not found then
    raise exception 'not found';
  end if;
  return to_jsonb(updated);
end;
$$;

revoke all on function public.clean_testimonials(jsonb) from public;
revoke all on function public.create_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb) from public;
revoke all on function public.update_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb) from public;

grant execute on function public.create_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb) to authenticated;
grant execute on function public.update_sales_agent(text, text, text, text, text, text, text, text, text, text, numeric, integer, jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agent-videos',
  'agent-videos',
  true,
  41943040,
  array['video/mp4']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "agent videos are publicly readable" on storage.objects;
drop policy if exists "administrators upload agent videos" on storage.objects;
drop policy if exists "administrators update agent videos" on storage.objects;
drop policy if exists "administrators delete agent videos" on storage.objects;

create policy "agent videos are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'agent-videos');

create policy "administrators upload agent videos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'agent-videos' and public.is_administrator());

create policy "administrators update agent videos"
on storage.objects
for update
to authenticated
using (bucket_id = 'agent-videos' and public.is_administrator())
with check (bucket_id = 'agent-videos' and public.is_administrator());

create policy "administrators delete agent videos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'agent-videos' and public.is_administrator());
