-- Run this after 001 through 009. Do not rerun the earlier files.
-- Lets each customer testimonial include an uploaded photo.

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
