-- Run this after 001 through 011. Do not rerun the earlier files.
-- Lets a visitor attach one photo when they leave feedback on an agent page.

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
  photo text;
begin
  if raw is null or jsonb_typeof(raw) <> 'array' then
    raise exception 'Enter the testimonials as a list.';
  end if;
  if jsonb_array_length(raw) > 40 then
    raise exception 'Add up to 40 testimonials.';
  end if;
  for item in select value from jsonb_array_elements(raw)
  loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'Each testimonial needs a name and a quote.';
    end if;
    person := btrim(coalesce(item->>'name', ''));
    words := btrim(coalesce(item->>'quote', ''));
    photo := nullif(btrim(coalesce(item->>'photo_path', '')), '');
    if char_length(person) < 2 or char_length(person) > 80 then
      raise exception 'Enter the customer name.';
    end if;
    if char_length(words) < 8 or char_length(words) > 400 then
      raise exception 'Enter a customer quote between 8 and 400 characters.';
    end if;
    if photo is not null and photo !~ '^[0-9a-f-]{36}\.(jpg|png|webp)$' then
      raise exception 'A testimonial photo could not be saved.';
    end if;
    cleaned := cleaned || jsonb_build_array(jsonb_build_object('name', person, 'quote', words, 'photo_path', photo));
  end loop;
  return cleaned;
end;
$$;

drop function if exists public.add_agent_testimonial(text, text, text);

create or replace function public.add_agent_testimonial(
  page_key text,
  customer_name text,
  customer_quote text,
  customer_photo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  person text := btrim(coalesce(customer_name, ''));
  words text := btrim(coalesce(customer_quote, ''));
  photo text := nullif(btrim(coalesce(customer_photo, '')), '');
  updated_id uuid;
begin
  if char_length(person) < 2 or char_length(person) > 80 then
    raise exception 'Enter the customer name.';
  end if;
  if char_length(words) < 8 or char_length(words) > 400 then
    raise exception 'Enter a customer quote between 8 and 400 characters.';
  end if;
  if photo is not null and photo !~ '^[0-9a-f-]{36}\.(jpg|png|webp)$' then
    raise exception 'A testimonial photo could not be saved.';
  end if;
  update public.sales_agents
  set testimonials = testimonials || jsonb_build_array(
    jsonb_build_object('name', person, 'quote', words, 'photo_path', photo)
  )
  where page_identifier = page_key
    and is_hidden = false
    and jsonb_typeof(testimonials) = 'array'
    and jsonb_array_length(testimonials) < 40
  returning id into updated_id;
  if updated_id is not null then
    return;
  end if;
  if exists (
    select 1 from public.sales_agents
    where page_identifier = page_key
      and is_hidden = false
      and jsonb_array_length(testimonials) >= 40
  ) then
    raise exception 'This page has reached the feedback limit.';
  end if;
  raise exception 'This agent page is not available.';
end;
$$;

drop policy if exists "visitors upload testimonial photos" on storage.objects;

create policy "visitors upload testimonial photos"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'agent-photos'
  and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
);

revoke all on function public.clean_testimonials(jsonb) from public;
revoke all on function public.add_agent_testimonial(text, text, text, text) from public;
grant execute on function public.add_agent_testimonial(text, text, text, text) to anon, authenticated;
