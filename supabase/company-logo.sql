alter table public.cards
add column if not exists company_logo_url text;

alter table public.cards
add column if not exists room_number text;

grant select (company_logo_url)
on table public.cards
to anon, authenticated;

grant select (room_number)
on table public.cards
to anon, authenticated;
