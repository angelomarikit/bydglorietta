-- Run this third, after 001 and 002.
-- 1. Create the administrator in Supabase Authentication.
-- 2. Replace the placeholder below with that person's user id.
-- 3. Run this file. A hidden page or a public visitor cannot do this.

do $first_administrator$
declare
  chosen uuid := '359107dc-4239-4e4d-80a1-d7db9bf3130f';
begin
  if chosen = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Replace the placeholder user id in 003_first_administrator.sql, then run this file.';
  end if;

  insert into public.administrators (user_id)
  values (chosen)
  on conflict (user_id) do nothing;
end
$first_administrator$;
